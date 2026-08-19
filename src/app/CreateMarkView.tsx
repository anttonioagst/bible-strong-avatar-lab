import { useRef, useState } from 'react'

import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { AvatarMarkPreview } from '@/features/avatar/components/AvatarMarkPreview'
import { createIpLogoAvatar } from '@/features/avatar/avatars'
import { generateIpLogoSvg } from '@/features/avatar/ipLogoMark'
import type { StudioController } from '@/features/studio/useStudioController'

type CreateMarkViewProps = Pick<
  StudioController,
  'finishSurfaceMarkCreate' | 'importSurfaceMarkFile' | 'language' | 'setLanguage' | 't'
>

export function CreateMarkView({
  finishSurfaceMarkCreate,
  importSurfaceMarkFile,
  language,
  setLanguage,
  t,
}: CreateMarkViewProps) {
  const activeSurface = useNavSurface()
  const [nameDraft, setNameDraft] = useState('')
  const [importedMarkSvg, setImportedMarkSvg] = useState<string | null>(null)
  const markImportRef = useRef<HTMLInputElement>(null)

  const label = nameDraft.trim() || 'Mark'
  const markSvg = importedMarkSvg ?? generateIpLogoSvg(label)
  const previewPet = createIpLogoAvatar(label, markSvg)

  const handleImport = (file: File | undefined) => {
    if (!file) return
    importSurfaceMarkFile(file, nameDraft)
  }

  return (
    <div className="create-root" lang={language}>
      <SiteHeader
        activeSurface={activeSurface}
        variant="habitat"
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <section className="create-preview create-preview-habitat" aria-label={t('Aperçu du pet')}>
        <div className="create-mark-dual-preview">
          <div className="create-mark-preview-card">
            <span className="create-preview-label">{t('Mark')}</span>
            <div
              className="create-mark-svg-preview"
              dangerouslySetInnerHTML={{ __html: markSvg }}
            />
          </div>
          <div className="create-mark-preview-card">
            <span className="create-preview-label">{t('Pet')}</span>
            <AvatarMarkPreview
              avatar={previewPet}
              animate="always"
              className="create-pet-preview"
            />
          </div>
        </div>
      </section>

      <section className="create-form" aria-label={t('Créer un pet Mark')}>
        <div className="create-form-inner">
          <header className="create-form-header">
            <h1 className="create-form-title">{t('Créer un pet Mark')}</h1>
            <p className="create-form-lead">
              {t(
                'Générez une marque carrée à partir d’un nom, ou importez un SVG ou une image carrée.'
              )}
            </p>
          </header>

          <Field className="create-field">
            <FieldTitle>{t('Nom du pet')}</FieldTitle>
            <FieldDescription>
              {t('Le nom sert de graine pour la marque générée et le titre du pet.')}
            </FieldDescription>
            <Input
              className="create-seed-input h-10 font-mono"
              aria-label={t('Nom du pet')}
              value={nameDraft}
              onChange={event => {
                setImportedMarkSvg(null)
                setNameDraft(event.currentTarget.value)
              }}
              placeholder={t('Nom du pet')}
            />
          </Field>

          <div className="create-form-actions">
            <input
              ref={markImportRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp,.svg,.png,.jpg,.jpeg,.webp"
              hidden
              onChange={event => {
                const file = event.currentTarget.files?.[0]
                if (file) {
                  handleImport(file)
                }
                event.currentTarget.value = ''
              }}
            />
            <Button type="button" variant="outline" onClick={() => markImportRef.current?.click()}>
              {t('Importer une marque carrée')}
            </Button>
            <Button
              type="button"
              className="create-primary-button"
              onClick={() => finishSurfaceMarkCreate(nameDraft, importedMarkSvg ?? undefined)}
            >
              {t('Créer le pet')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
