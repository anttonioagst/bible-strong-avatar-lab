import { parseHashSurface, parsePetQuery } from '@/app/surface'
import { translateStudioText } from '@/i18n'

describe('Photo surface routing and chrome', () => {
  it('mounts the Photo surface from the photo hash', () => {
    expect(parseHashSurface('#/photo')).toBe('photo')
    expect(parseHashSurface('#/photo?pet=radar')).toBe('photo')
  })

  it('selects pets from hash query strings', () => {
    expect(parsePetQuery('#/photo?pet=radar')).toBe('radar')
    expect(parsePetQuery('#/studio?pet=wiipo')).toBe('wiipo')
  })

  it('exposes background, size, format, and capture copy in every locale', () => {
    const controls = [
      'Arrière-plan',
      'Définition du mode photo',
      'Format d’export du mode photo',
      'Capturer',
      'Réglages photo',
      'Ouvrir Photo',
    ] as const

    for (const key of controls) {
      expect(translateStudioText(key, 'en')).not.toBe(key)
      expect(translateStudioText(key, 'zh-CN')).not.toBe(key)
    }

    expect(translateStudioText('Capturer', 'en')).toBe('Capture')
    expect(translateStudioText('Réglages photo', 'zh-CN')).toBe('照片设置')
  })
})
