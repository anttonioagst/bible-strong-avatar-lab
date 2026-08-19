import { poseFromExpression, renderAvatar } from '@/features/avatar/geometry'
import { defaultExpression } from '@/features/avatar/presets'
import { surfacePresets } from '@/features/avatar/surfaces'
import {
  applyAvatarProjection,
  parseAvatarProjection,
  parseAvatarStyleFamily,
} from '@/features/avatar/avatarStyle'
import { generateIpLogoSvg, sanitizeImportedSvg } from '@/features/avatar/ipLogoMark'
import {
  createAvatar,
  createBlobAvatar,
  createIpLogoAvatar,
  parseAvatarLibrary,
} from '@/features/avatar/avatars'
import { blobatarNameForAvatar, renderBlobatarSvg } from '@/features/avatar/blobatarAdapter'
import { initialExpressions } from '@/features/avatar/presets'
import { createInitialSequences } from '@/features/animation/sequences'
import { resolveAvatarMarkSvg } from '@/features/avatar/avatarMark'

const base = {
  expressions: initialExpressions,
  sequences: createInitialSequences(),
}

describe('additive avatar style schema', () => {
  it('defaults missing style and projection to classic perspective', () => {
    expect(parseAvatarStyleFamily(undefined)).toBe('classic')
    expect(parseAvatarProjection(undefined)).toBe('perspective')
    expect(createAvatar('Radar')).toMatchObject({
      styleFamily: 'classic',
      projection: 'perspective',
    })
  })

  it('parses saved avatars without style fields as classic', () => {
    const saved = createAvatar('Saved')
    const radar = { ...createAvatar('Radar'), id: 'radar' }
    const legacy = {
      id: saved.id,
      name: saved.name,
      body: saved.body,
      colors: saved.colors,
      eyes: saved.eyes,
      renderStyle: saved.renderStyle,
    }

    const result = parseAvatarLibrary(
      { activeAvatarId: saved.id, avatars: [legacy] },
      { activeAvatarId: 'radar', avatars: [radar] },
      base
    )

    expect(result.avatars[0]).toMatchObject({
      id: saved.id,
      styleFamily: 'classic',
      projection: 'perspective',
    })
  })

  it('creates a blob avatar from a seed string', () => {
    const avatar = createBlobAvatar('strobe-bot')
    expect(avatar.styleFamily).toBe('blob')
    expect(blobatarNameForAvatar(avatar)).toBe('strobe-bot')
    expect(renderBlobatarSvg(blobatarNameForAvatar(avatar))).toContain('<svg')
    expect(resolveAvatarMarkSvg(avatar)).toContain('<svg')
  })

  it('creates a deterministic IP logo mark without replacing classic', () => {
    const first = generateIpLogoSvg('Radar')
    const second = generateIpLogoSvg('Radar')
    const other = generateIpLogoSvg('Strobi')
    const avatar = createIpLogoAvatar('Mark')

    expect(first).toBe(second)
    expect(first).not.toBe(other)
    expect(first).toContain('viewBox="0 0 100 100"')
    expect(avatar.styleFamily).toBe('ip-logo')
    expect(avatar.markSvg).toContain('<svg')
  })

  it('rejects scripted SVG imports', () => {
    expect(() =>
      sanitizeImportedSvg('<svg><script>alert(1)</script><rect width="10" height="10"/></svg>')
    ).not.toThrow()
    expect(
      sanitizeImportedSvg('<svg><script>alert(1)</script><rect width="10" height="10"/></svg>')
    ).not.toContain('<script')
  })

  it('flattens perspective at render time without mutating stored expressions', () => {
    const stored = { ...defaultExpression, perspective: 1 }
    const pose = poseFromExpression(stored)
    const flat = applyAvatarProjection(pose, 'flat')
    const perspectivePath = renderAvatar(pose, surfacePresets.sphere, 1).headPath
    const flatPath = renderAvatar(flat, surfacePresets.sphere, 1).headPath

    expect(stored.perspective).toBe(1)
    expect(pose.expression.perspective).toBe(1)
    expect(flat.expression.perspective).toBe(0)
    expect(flatPath).not.toBe(perspectivePath)
  })
})
