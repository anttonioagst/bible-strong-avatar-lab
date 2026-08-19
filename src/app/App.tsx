import { CreateBlobView } from '@/app/CreateBlobView'
import { CreateMarkView } from '@/app/CreateMarkView'
import { LabHome } from '@/app/LabHome'
import { PhotoView } from '@/app/PhotoView'
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

  if (surface === 'photo') {
    return <PhotoView {...controller} />
  }

  if (surface === 'create-blob') {
    return (
      <CreateBlobView
        finishSurfaceBlobCreate={controller.finishSurfaceBlobCreate}
        language={controller.language}
        setLanguage={controller.setLanguage}
        t={controller.t}
      />
    )
  }

  if (surface === 'create-ip') {
    return (
      <CreateMarkView
        finishSurfaceMarkCreate={controller.finishSurfaceMarkCreate}
        importSurfaceMarkFile={controller.importSurfaceMarkFile}
        language={controller.language}
        setLanguage={controller.setLanguage}
        t={controller.t}
      />
    )
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
