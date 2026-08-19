import { parseHashSurface, parseNavSurface } from '@/app/surface'

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

  it('falls back to the Lab surface for unknown hashes', () => {
    expect(parseHashSurface('#/photo')).toBe('lab')
    expect(parseHashSurface('#/create/blob')).toBe('lab')
    expect(parseHashSurface('#/unknown')).toBe('lab')
  })

  it('keeps nav highlighting distinct from the mounted surface', () => {
    expect(parseNavSurface('#/photo')).toBe('photo')
    expect(parseNavSurface('#/studio')).toBe('studio')
    expect(parseNavSurface('#/')).toBe('lab')
  })
})
