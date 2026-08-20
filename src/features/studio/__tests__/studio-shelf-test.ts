import { LAB_SHELF_PRIORITY_IDS } from '@/features/studio/studioBrand'
import { translateStudioText } from '@/i18n'

const sortShelfPets = <T extends { id: string }>(pets: T[]): T[] => {
  const priority = new Map<string, number>(LAB_SHELF_PRIORITY_IDS.map((id, index) => [id, index]))
  return [...pets].sort((left, right) => {
    const leftRank = priority.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightRank = priority.get(right.id) ?? Number.MAX_SAFE_INTEGER
    if (leftRank !== rightRank) return leftRank - rightRank
    return left.id.localeCompare(right.id)
  })
}

describe('studio pets shelf', () => {
  it('orders bundled pets before user pets like the Lab shelf', () => {
    const pets = sortShelfPets([
      { id: 'zebra' },
      { id: 'wiipo' },
      { id: 'alpha' },
      { id: 'radar' },
      { id: 'antonio' },
    ])

    expect(pets.map(pet => pet.id)).toEqual(['radar', 'antonio', 'wiipo', 'alpha', 'zebra'])
  })

  it('uses pet language in visitor-facing Studio chrome', () => {
    const keys = [
      'Vos pets',
      'Aucun pet pour l’instant.',
      'Ajouter un pet',
      'Nom du pet',
      'Pet sélectionné',
      'Exporter le pet',
      'Capture une image statique du pet.',
      'Le corps, les expressions et les animations propres à ce pet seront définitivement supprimés. La bibliothèque de base sera conservée.',
    ] as const

    for (const key of keys) {
      expect(translateStudioText(key, 'en')).not.toBe(key)
      expect(translateStudioText(key, 'zh-CN')).not.toBe(key)
    }

    expect(translateStudioText('Vos pets', 'en')).toBe('Your pets')
    expect(translateStudioText('Export', 'en')).toBe('Export')
    expect(translateStudioText('Export', 'zh-CN')).toBe('导出')
    expect(translateStudioText('Nom du pet', 'zh-CN')).toBe('宠物名称')
  })
})
