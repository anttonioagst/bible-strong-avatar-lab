import { useEffect, useState } from 'react'

export type AppSurface = 'lab' | 'studio' | 'photo'

export type NavSurface = 'lab' | 'studio' | 'photo'

export const parseHashSurface = (hash: string): AppSurface => {
  const normalized = hash.replace(/^#/, '').replace(/^\/?/, '/').split('?')[0] ?? '/'
  if (normalized === '/' || normalized === '') return 'lab'
  if (normalized === '/studio') return 'studio'
  if (normalized === '/photo') return 'photo'
  return 'lab'
}

export const parsePetQuery = (hash: string): string | null => {
  const query = hash.includes('?') ? (hash.split('?')[1] ?? '') : ''
  const petId = new URLSearchParams(query).get('pet')
  return petId?.trim() ? petId.trim() : null
}

export const parseNavSurface = (hash: string): NavSurface => {
  const normalized = hash.replace(/^#/, '').replace(/^\/?/, '/').split('?')[0] ?? '/'
  if (normalized === '/studio') return 'studio'
  if (normalized === '/photo') return 'photo'
  return 'lab'
}

export const useHashSurface = (): AppSurface => {
  const [surface, setSurface] = useState<AppSurface>(() => parseHashSurface(window.location.hash))

  useEffect(() => {
    const updateSurface = () => setSurface(parseHashSurface(window.location.hash))
    window.addEventListener('hashchange', updateSurface)
    return () => window.removeEventListener('hashchange', updateSurface)
  }, [])

  return surface
}

export const useNavSurface = (): NavSurface => {
  const [surface, setSurface] = useState<NavSurface>(() => parseNavSurface(window.location.hash))

  useEffect(() => {
    const updateSurface = () => setSurface(parseNavSurface(window.location.hash))
    window.addEventListener('hashchange', updateSurface)
    return () => window.removeEventListener('hashchange', updateSurface)
  }, [])

  return surface
}
