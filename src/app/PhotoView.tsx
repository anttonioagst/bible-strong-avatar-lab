import { Camera } from 'lucide-react'
import { motion } from 'motion/react'
import { type CSSProperties } from 'react'

import { SnapshotPreview } from '@/app/components/common'
import { ColorField } from '@/app/components/controls'
import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'
import { type SnapshotFormat } from '@/app/studio-utils'
import { Button } from '@/components/ui/button'
import { Field, FieldTitle } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AvatarMarkPreview } from '@/features/avatar/components/AvatarMarkPreview'
import { isClassicAvatarStyle } from '@/features/avatar/avatarStyle'
import { defaultExpression } from '@/features/avatar/presets'
import { type SnapshotBackground } from '@/features/export/snapshotExporter'
import { AvatarCanvas } from '@/features/rendering/components/AvatarCanvas'
import type { StudioController } from '@/features/studio/useStudioController'

export function PhotoView(controller: StudioController) {
  const activeSurface = useNavSurface()
  const {
    activateAvatar,
    activeAvatar,
    activeAvatarEyes,
    activeAvatarId,
    avatars,
    canvasExpression,
    expressions,
    language,
    photoFlash,
    reduceMotion,
    renderedColors,
    renderedRotationGizmo,
    renderedScene,
    setLanguage,
    setSnapshotBackground,
    setSnapshotColorFrom,
    setSnapshotColorTo,
    setSnapshotFormat,
    setSnapshotSize,
    snapshotBackground,
    snapshotColorFrom,
    snapshotColorTo,
    snapshotFormat,
    snapshotSize,
    surface,
    t,
    takePicture,
  } = controller

  return (
    <div className="photo-root" lang={language}>
      <SiteHeader
        activeSurface={activeSurface}
        variant="habitat"
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <section
        className="photo-stage"
        style={
          {
            '--avatar-body-color': renderedColors.body,
            '--avatar-eye-color': renderedColors.eyes,
          } as CSSProperties
        }
        aria-label={t('Mode photo')}
      >
        {isClassicAvatarStyle(activeAvatar.styleFamily) ? (
          <AvatarCanvas
            expression={canvasExpression}
            avatarEyes={activeAvatarEyes}
            surface={surface}
            scene={renderedScene}
            colors={renderedColors}
            renderStyle={activeAvatar.renderStyle}
            rotationGizmo={renderedRotationGizmo}
            showWire={false}
            bodyEditing={false}
            selectedBodyNodeId={null}
            selectedBodyNode={null}
            selectedSide={null}
            linked={{ width: true, height: true, size: true }}
            highlight={null}
            onHighlightChange={() => undefined}
            onBodyNodeSelect={() => undefined}
            onBodyNodePreview={() => undefined}
            onBodyNodeChange={() => undefined}
            onEyeSelect={() => undefined}
            onPreview={() => undefined}
            onChange={() => undefined}
            onReset={() => undefined}
            onManipulationStart={() => canvasExpression}
            playback={null}
          />
        ) : (
          <div className="avatar-wrap avatar-wrap-mark photo-mark-stage">
            <AvatarMarkPreview
              avatar={activeAvatar}
              animate={reduceMotion ? false : 'always'}
              expression={expressions[0] ?? defaultExpression}
              className="avatar-preview stage-mark-preview"
            />
          </div>
        )}

        {photoFlash > 0 && (
          <motion.div
            className="photo-flash"
            key={photoFlash}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.92, 0] }}
            transition={{ duration: 0.38, times: [0, 0.16, 1], ease: 'easeOut' }}
          />
        )}
      </section>

      <footer className="photo-dock" aria-label={t('Réglages photo')}>
        <div className="photo-dock-inner">
          <div className="photo-dock-preview" aria-hidden="true">
            {isClassicAvatarStyle(activeAvatar.styleFamily) ? (
              <SnapshotPreview
                scene={renderedScene}
                colors={renderedColors}
                background={snapshotBackground}
                colorFrom={snapshotColorFrom}
                colorTo={snapshotColorTo}
                renderStyle={activeAvatar.renderStyle}
              />
            ) : (
              <div className="snapshot-preview">
                <AvatarMarkPreview
                  avatar={activeAvatar}
                  expression={expressions[0] ?? defaultExpression}
                />
              </div>
            )}
          </div>

          <div className="photo-dock-controls">
            <Field className="photo-dock-field" orientation="horizontal">
              <FieldTitle>{t('Choisir un pet')}</FieldTitle>
              <Select
                value={activeAvatarId}
                items={avatars.map(avatar => ({ value: avatar.id, label: avatar.name }))}
                onValueChange={next => next && activateAvatar(next)}
              >
                <SelectTrigger aria-label={t('Choisir un pet')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatars.map(avatar => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      {avatar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="photo-dock-field" orientation="horizontal">
              <FieldTitle>{t('Arrière-plan')}</FieldTitle>
              <Select
                value={snapshotBackground}
                items={[
                  { value: 'transparent', label: t('Transparent') },
                  { value: 'solid', label: t('Uni') },
                  { value: 'linear', label: t('Dégradé linéaire') },
                  { value: 'radial', label: t('Dégradé radial') },
                ]}
                onValueChange={next => next && setSnapshotBackground(next as SnapshotBackground)}
              >
                <SelectTrigger aria-label={t('Style d’arrière-plan')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">{t('Transparent')}</SelectItem>
                  <SelectItem value="solid">{t('Uni')}</SelectItem>
                  <SelectItem value="linear">{t('Dégradé linéaire')}</SelectItem>
                  <SelectItem value="radial">{t('Dégradé radial')}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {snapshotBackground !== 'transparent' && (
              <div className="photo-dock-colors">
                <ColorField
                  label={snapshotBackground === 'solid' ? 'Couleur' : 'Départ'}
                  value={snapshotColorFrom}
                  onChange={setSnapshotColorFrom}
                />
                {(snapshotBackground === 'linear' || snapshotBackground === 'radial') && (
                  <ColorField
                    label="Arrivée"
                    value={snapshotColorTo}
                    onChange={setSnapshotColorTo}
                  />
                )}
              </div>
            )}

            <Separator className="photo-dock-separator" />

            <Field className="photo-dock-field" orientation="horizontal">
              <FieldTitle>{t('Format d’export')}</FieldTitle>
              <Select
                value={snapshotFormat}
                items={[
                  { value: 'png', label: 'PNG' },
                  { value: 'svg', label: 'SVG' },
                ]}
                onValueChange={next => next && setSnapshotFormat(next as SnapshotFormat)}
              >
                <SelectTrigger aria-label={t('Format d’export du mode photo')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="photo-dock-field" orientation="horizontal">
              <FieldTitle>{t('Définition')}</FieldTitle>
              <Select
                value={snapshotSize}
                items={['512', '1024', '2048'].map(value => ({
                  value,
                  label: `${value} px`,
                }))}
                onValueChange={next => next && setSnapshotSize(next)}
              >
                <SelectTrigger aria-label={t('Définition du mode photo')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="512">512 px</SelectItem>
                  <SelectItem value="1024">1024 px</SelectItem>
                  <SelectItem value="2048">2048 px</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="photo-dock-capture">
            <p className="photo-dock-meta">
              <strong>{activeAvatar.name}</strong>
              <span className="photo-dock-size">
                {snapshotSize} × {snapshotSize} · {snapshotFormat.toUpperCase()}
              </span>
            </p>
            <Button
              className="photo-dock-capture-button"
              type="button"
              aria-label={t('Capturer')}
              onClick={takePicture}
            >
              <Camera />
              {t('Capturer')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
