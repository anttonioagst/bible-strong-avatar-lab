import { Blobatar } from 'blobatar/react'
import 'blobatar/motion.css'
import { useState } from 'react'

import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { StudioController } from '@/features/studio/useStudioController'

type CreateBlobViewProps = Pick<
  StudioController,
  'finishSurfaceBlobCreate' | 'language' | 'setLanguage' | 't'
>

export function CreateBlobView({
  finishSurfaceBlobCreate,
  language,
  setLanguage,
  t,
}: CreateBlobViewProps) {
  const activeSurface = useNavSurface()
  const [seedDraft, setSeedDraft] = useState('')
  const previewSeed = seedDraft.trim() || 'Blob'

  return (
    <div className="create-root" lang={language}>
      <SiteHeader
        activeSurface={activeSurface}
        variant="habitat"
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <section className="create-preview create-preview-habitat" aria-label={t('Aperçu du blob')}>
        <Blobatar
          className="create-blob-preview"
          name={previewSeed}
          background="squircle"
          animate="always"
          title={previewSeed}
        />
      </section>

      <section className="create-form" aria-label={t('Créer un pet Blob')}>
        <div className="create-form-inner">
          <header className="create-form-header">
            <h1 className="create-form-title">{t('Créer un pet Blob')}</h1>
            <p className="create-form-lead">
              {t('Tapez une graine pour prévisualiser le blob, puis créez le pet.')}
            </p>
          </header>

          <Field className="create-field">
            <FieldTitle>{t('Graine')}</FieldTitle>
            <FieldDescription>
              {t('La graine détermine le blobatar. Utilisez le nom ou un identifiant.')}
            </FieldDescription>
            <Input
              className="create-seed-input h-10 font-mono"
              aria-label={t('Graine')}
              value={seedDraft}
              onChange={event => setSeedDraft(event.currentTarget.value)}
              placeholder={t('Graine')}
            />
          </Field>

          <div className="create-form-actions">
            <Button
              type="button"
              className="create-primary-button"
              onClick={() => finishSurfaceBlobCreate(seedDraft)}
            >
              {t('Créer le pet')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
