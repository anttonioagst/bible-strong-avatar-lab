import viteConfig from '../../../../vite.config'
import { loadStudioDocument } from '@/features/studio/studioDocument'
import { createRadarPlayerDocument, RADAR_AVATAR_ID } from '@/features/player/radarPayload'

describe('Radar player document', () => {
  it('selects the bundled Radar avatar and idle sequence with blink', () => {
    const bundled = loadStudioDocument({ getItem: () => null })
    const grok = bundled.library.avatars.find(avatar => avatar.name === 'Grok bot')
    const player = createRadarPlayerDocument()

    expect(bundled.library.activeAvatarId).toBe(RADAR_AVATAR_ID)
    expect(bundled.library.avatars[0]).toMatchObject({
      id: RADAR_AVATAR_ID,
      name: 'Radar',
      colors: { body: '#1c1c1c', eyes: '#e8a54b' },
    })
    expect(bundled.library.avatars.map(avatar => avatar.name)).toEqual(
      expect.arrayContaining(['Radar', 'Antonio', 'Strobi', 'Freddy', 'Grok bot'])
    )
    expect(bundled.library.avatars[1]).toMatchObject({ id: 'antonio', name: 'Antonio' })
    expect(player.avatar.id).toBe(RADAR_AVATAR_ID)
    expect(player.avatar.id).not.toBe('antonio')
    expect(player.avatar.body.primary.type).toBe('sphere')
    expect(player.avatar.body.nodes).toHaveLength(1)
    expect(player.sequence.id).toBe('idle')
    expect(player.sequence.playbackMode).toBe('loop')
    expect(player.sequence.blink.enabled).toBe(true)
    expect(player.sequence.steps.length).toBeGreaterThan(0)
    expect(player.expressions[player.sequence.steps[0].expressionId]).toBeDefined()
    expect(grok?.colors).toEqual({ body: '#000000', eyes: '#ffffff' })
    expect(player.avatar.colors).not.toEqual(grok?.colors)
  })

  it('keeps a relative Vite base and Radar HTML entry for GitHub Pages project URLs', () => {
    expect(viteConfig.base).toBe('./')
    expect(viteConfig.build?.rollupOptions?.input).toEqual(
      expect.objectContaining({
        radar: expect.stringMatching(/radar\.html$/),
      })
    )
  })
})
