import { parseHashSurface, parseNavSurface, parsePetQuery, photoPetHash } from '@/app/surface'

describe('hash surfaces', () => {
  it('maps empty and root hashes to the Lab surface', () => {
    expect(parseHashSurface('')).toBe('lab')
    expect(parseHashSurface('#')).toBe('lab')
    expect(parseHashSurface('#/')).toBe('lab')
  })

  it('maps the studio hash to the Studio surface', () => {
    expect(parseHashSurface('#/studio')).toBe('studio')
    expect(parseHashSurface('#/studio?pet=radar')).toBe('studio')
  })

  it('maps the photo hash to the Photo surface', () => {
    expect(parseHashSurface('#/photo')).toBe('photo')
    expect(parseHashSurface('#/photo?pet=radar')).toBe('photo')
  })

  it('maps create hashes to dedicated surfaces', () => {
    expect(parseHashSurface('#/create/blob')).toBe('create-blob')
    expect(parseHashSurface('#/create/ip')).toBe('create-ip')
  })

  it('falls back to the Lab surface for unknown hashes', () => {
    expect(parseHashSurface('#/unknown')).toBe('lab')
  })

  it('keeps nav highlighting distinct from the mounted surface', () => {
    expect(parseNavSurface('#/photo')).toBe('photo')
    expect(parseNavSurface('#/studio')).toBe('studio')
    expect(parseNavSurface('#/')).toBe('lab')
  })

  it('reads pet selection from hash query strings', () => {
    expect(parsePetQuery('#/photo?pet=radar')).toBe('radar')
    expect(parsePetQuery('#/studio?pet=wiipo')).toBe('wiipo')
    expect(parsePetQuery('#/photo')).toBeNull()
    expect(parsePetQuery('#/')).toBeNull()
  })

  it('builds photo pet hashes for navigation', () => {
    expect(photoPetHash('radar')).toBe('#/photo?pet=radar')
  })
})
