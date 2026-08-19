import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'
import type { StudioController } from '@/features/studio/useStudioController'

type StudioIdentityProps = Pick<StudioController, 'language' | 'setLanguage' | 't'> & {
  className?: string
}

export function StudioIdentity({ className = '', language, setLanguage, t }: StudioIdentityProps) {
  const activeSurface = useNavSurface()
  const variant = className.includes('stage-identity') ? 'habitat' : 'bench'

  return (
    <SiteHeader
      activeSurface={activeSurface}
      variant={variant}
      language={language}
      setLanguage={setLanguage}
      t={t}
      className={`studio-identity ${className}`.trim()}
    />
  )
}
