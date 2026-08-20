import { parseHashSurface, photoPetHash } from '@/app/surface'
import { translateStudioText } from '@/i18n'

describe('Photo surface routing and chrome', () => {
  it('mounts the Photo surface from the photo hash', () => {
    expect(parseHashSurface('#/photo')).toBe('photo')
    expect(parseHashSurface('#/photo?pet=radar')).toBe('photo')
  })

  it('builds photo pet hashes for navigation and picker write-back', () => {
    expect(photoPetHash('radar')).toBe('#/photo?pet=radar')
    expect(photoPetHash('wiipo')).toBe('#/photo?pet=wiipo')
  })

  it('selects pets from hash query strings', () => {
    expect(photoPetHash('radar').includes('pet=radar')).toBe(true)
  })

  it('exposes background, size, format, capture, and framing copy in every locale', () => {
    const controls = [
      'Arrière-plan',
      'Définition du mode photo',
      'Format d’export du mode photo',
      'Capturer',
      'Réglages photo',
      'Ouvrir Photo',
      'Cadrage',
      'Outils du mode photo',
      'Recentrer le cadrage',
      'Coins arrondis',
    ] as const

    for (const key of controls) {
      expect(translateStudioText(key, 'en')).not.toBe(key)
      expect(translateStudioText(key, 'zh-CN')).not.toBe(key)
    }

    expect(translateStudioText('Capturer', 'en')).toBe('Capture')
    expect(translateStudioText('Pose', 'zh-CN')).toBe('姿势')
    expect(translateStudioText('Cadrage', 'zh-CN')).toBe('取景')
    expect(translateStudioText('Réglages photo', 'zh-CN')).toBe('照片设置')
  })
})
