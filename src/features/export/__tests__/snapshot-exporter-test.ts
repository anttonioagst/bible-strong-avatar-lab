import { resolveAvatarMarkSvg } from '@/features/avatar/avatarMark'
import { renderBlobatarSvg } from '@/features/avatar/blobatarAdapter'
import { poseFromExpression, renderAvatar } from '@/features/avatar/geometry'
import { defaultExpression } from '@/features/avatar/presets'
import { createRenderedScene, paintRenderedOffset } from '@/features/rendering/renderedScene'
import {
  prepareSnapshotPngCanvas,
  serializeAvatarSnapshot,
  serializeMarkSnapshot,
  serializePixelSnapshot,
  snapshotFileName,
} from '@/features/export/snapshotExporter'
import { surfacePresets } from '@/features/avatar/surfaces'

describe('avatar snapshot export', () => {
  const geometry = renderAvatar(poseFromExpression(defaultExpression), surfacePresets.sphere, 1)
  const scene = createRenderedScene(geometry)
  const colors = { body: '#5b7fe5', eyes: '#111316' }

  it('exports the currently rendered scene as a transparent SVG', () => {
    paintRenderedOffset(scene, { x: 3, y: -2 })
    const svg = serializeAvatarSnapshot('Strobi', scene, colors, {
      background: 'transparent',
      colorFrom: '#ffffff',
      colorTo: '#000000',
      size: 1024,
    })

    expect(svg).toContain('width="1024" height="1024"')
    expect(svg).toContain('transform="translate(3 -2)"')
    expect(svg).toContain(`d="${geometry.headPath}" fill="#5b7fe5"`)
    expect(svg).toContain('fill="#111316"')
    expect(svg).not.toContain('width="300" height="300" fill=')
  })

  it('applies logo framing without changing the rendered avatar scene', () => {
    const svg = serializeAvatarSnapshot('Strobi', scene, colors, {
      background: 'solid',
      colorFrom: '#818181',
      colorTo: '#818181',
      size: 1024,
      composition: { x: 55, y: 65, scale: 1.3, cornerRadius: 18 },
    })

    expect(svg).toContain('<clipPath id="snapshot-frame-clip">')
    expect(svg).toContain('rx="54"')
    expect(svg).toContain('clip-path="url(#snapshot-frame-clip)"')
    expect(svg).toContain('transform="translate(55 65) scale(1.3)"')
    expect(svg).toContain('fill="#818181"')
  })

  it('embeds a radial background without external dependencies', () => {
    const svg = serializeAvatarSnapshot('Strobi', scene, colors, {
      background: 'radial',
      colorFrom: '#ffffff',
      colorTo: '#8899aa',
      size: 512,
    })

    expect(svg).toContain('<radialGradient id="snapshot-radial"')
    expect(svg).toContain('fill="url(#snapshot-radial)"')
    expect(snapshotFileName('Étoile du soir')).toBe('etoile-du-soir-snapshot.svg')
    expect(snapshotFileName('Étoile du soir', 'png')).toBe('etoile-du-soir-snapshot.png')
  })

  it('embeds a pixel snapshot as a self-contained raster SVG', () => {
    const svg = serializePixelSnapshot('Pixel & Co', 'data:image/png;base64,AAAA', 256)

    expect(svg).toContain('viewBox="0 0 256 256"')
    expect(svg).toContain('image-rendering="pixelated"')
    expect(svg).toContain('data:image/png;base64,AAAA')
    expect(svg).toContain('aria-label="Pixel &amp; Co"')
  })

  it('frames mark snapshots with the same clip and transform', () => {
    const svg = serializeMarkSnapshot(
      'Mark',
      '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
      {
        background: 'transparent',
        colorFrom: '#ffffff',
        colorTo: '#000000',
        size: 512,
        composition: { x: 12, y: -8, scale: 1.1, cornerRadius: 18 },
      }
    )

    expect(svg).toContain('<clipPath id="snapshot-frame-clip">')
    expect(svg).toContain('transform="translate(12 -8) scale(1.1)"')
    expect(svg).toContain('<circle cx="50" cy="50" r="40"/>')
  })

  it('omits the blob squircle plate when Photo asks for transparent', () => {
    const blobSvg = renderBlobatarSvg('photo-seed', { background: false })
    const snapshot = serializeMarkSnapshot('Blob', blobSvg, {
      background: 'transparent',
      colorFrom: '#F5F7FC',
      colorTo: '#C9D5FF',
      size: 1024,
      composition: { x: 0, y: 0, scale: 1, cornerRadius: 18 },
    })

    expect(snapshot).not.toContain('width="300" height="300" fill=')
  })

  it('includes blob expression markup when canvasExpression is mapped', () => {
    const idleSvg = renderBlobatarSvg('photo-seed', { background: false })
    const posedSvg = renderBlobatarSvg('photo-seed', {
      background: false,
      expression: { ...defaultExpression, id: 'expression-1' },
    })

    expect(posedSvg).not.toBe(idleSvg)
    expect(
      resolveAvatarMarkSvg(
        { id: 'blob', name: 'Blob', styleFamily: 'blob', styleSeed: 'photo-seed' },
        { background: false, expression: { ...defaultExpression, id: 'expression-1' } }
      )
    ).toBe(posedSvg)
  })

  it('does not pre-fill an opaque canvas for transparent PNG preparation', () => {
    const context = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D
    prepareSnapshotPngCanvas(context, 64, 'transparent')
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 64, 64)
    expect(context.fillRect).not.toHaveBeenCalled()
  })
})
