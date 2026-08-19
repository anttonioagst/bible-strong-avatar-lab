import { createBlobAvatar } from '@/features/avatar/avatars'
import { parseHashSurface, studioPetHash } from '@/app/surface'
import { translateStudioText } from '@/i18n'

describe('create surfaces routing and copy', () => {
  it('maps create hashes to dedicated surfaces', () => {
    expect(parseHashSurface('#/create/blob')).toBe('create-blob')
    expect(parseHashSurface('#/create/ip')).toBe('create-ip')
    expect(parseHashSurface('#/create/blob?pet=radar')).toBe('create-blob')
  })

  it('builds studio navigation for a created pet', () => {
    const pet = createBlobAvatar('strobe-bot')
    expect(studioPetHash(pet.id)).toBe(`#/studio?pet=${encodeURIComponent(pet.id)}`)
  })

  it('seed creates a blob pet and activates it', () => {
    const seed = 'my-cool-seed'
    const pet = createBlobAvatar(seed)
    const avatars = [createBlobAvatar('existing')]
    const nextAvatars = [...avatars, pet]
    const activeAvatarId = pet.id

    expect(pet.styleFamily).toBe('blob')
    expect(pet.styleSeed).toBe(seed)
    expect(nextAvatars.some(avatar => avatar.id === activeAvatarId)).toBe(true)
    expect(activeAvatarId).toBe(pet.id)
    expect(studioPetHash(activeAvatarId)).toContain(pet.id)
  })

  it('exposes create surface copy in every locale', () => {
    const keys = [
      'Créer un pet Blob',
      'Créer un pet Mark',
      'Créer le pet',
      'Aperçu du blob',
      'Nom du pet',
      'Ouvrir la page de création',
    ] as const

    for (const key of keys) {
      expect(translateStudioText(key, 'en')).not.toBe(key)
      expect(translateStudioText(key, 'zh-CN')).not.toBe(key)
    }

    expect(translateStudioText('Créer le pet', 'en')).toBe('Create pet')
    expect(translateStudioText('Créer un pet Mark', 'zh-CN')).toBe('创建标志宠物')
  })
})
