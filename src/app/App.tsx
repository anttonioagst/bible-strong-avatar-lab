import { LabHome } from '@/app/LabHome'
import { useHashSurface } from '@/app/surface'
import { StudioView } from '@/features/studio/components/StudioView'
import { useStudioController } from '@/features/studio/useStudioController'
import { StudioLanguageProvider } from '@/i18n'

function AppContent() {
  const surface = useHashSurface()
  const controller = useStudioController()

  if (surface === 'studio') {
    return <StudioView {...controller} />
  }

  return (
    <LabHome
      avatars={controller.avatars}
      baseBehavior={controller.baseBehavior}
      language={controller.language}
      reduceMotion={controller.reduceMotion}
      setLanguage={controller.setLanguage}
      t={controller.t}
    />
  )
}

export default function App() {
  return (
    <StudioLanguageProvider>
      <AppContent />
    </StudioLanguageProvider>
  )
}
