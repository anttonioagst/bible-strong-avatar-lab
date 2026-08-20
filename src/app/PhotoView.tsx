import '@fontsource-variable/geist'
import '@fontsource/geist-mono/400.css'

import { Camera, Move3D, RotateCcw, Scan, Shuffle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'

import { InspectorCard, PanelTitle } from '@/app/components/common'
import { ColorField, NumericField } from '@/app/components/controls'
import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'
import { type PhotoTool, type SnapshotFormat } from '@/app/studio-utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { ExpressionCard } from '@/features/avatar/components/ExpressionWorkspace'
import { isClassicAvatarStyle } from '@/features/avatar/avatarStyle'
import { type SnapshotBackground } from '@/features/export/snapshotExporter'
import { AvatarCanvas } from '@/features/rendering/components/AvatarCanvas'
import { PhotoStageFrame } from '@/features/studio/components/PhotoStageFrame'
import type { StudioController } from '@/features/studio/useStudioController'

export function PhotoView(controller: StudioController) {
  const activeSurface = useNavSurface()
  const {
    activeAvatar,
    activeAvatarEyes,
    activeAvatarId,
    activeExpression,
    avatars,
    bodyNodes,
    canvasExpression,
    enterPhotoMode,
    language,
    photoFlash,
    photoPanelSections,
    photoTool,
    reduceMotion,
    renderedColors,
    renderedRotationGizmo,
    renderedScene,
    resetPhotoFraming,
    resetPhotoSetup,
    selectPhotoPet,
    setLanguage,
    setPhotoPanelSections,
    setPhotoTool,
    setSnapshotBackground,
    setSnapshotColorFrom,
    setSnapshotColorTo,
    setSnapshotComposition,
    setSnapshotFormat,
    setSnapshotSize,
    shuffleSnapshotColors,
    snapshotBackground,
    snapshotColorFrom,
    snapshotColorTo,
    snapshotComposition,
    snapshotFormat,
    snapshotSize,
    surface,
    t,
    takePicture,
    transitionToExpression,
    updateSnapshotComposition,
  } = controller

  useEffect(() => {
    enterPhotoMode()
    // Enter Photo once when the surface mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activatePhotoTool = (tool: PhotoTool) => {
    setPhotoTool(tool)
    setPhotoPanelSections(current => (current.includes(tool) ? current : [...current, tool]))
  }

  const avatarCanvas = isClassicAvatarStyle(activeAvatar.styleFamily) ? (
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
        background={false}
        expression={canvasExpression}
        className="avatar-preview stage-mark-preview"
      />
    </div>
  )

  return (
    <div className="photo-root" lang={language}>
      <SiteHeader
        activeSurface={activeSurface}
        activeAvatarId={activeAvatarId}
        variant="grok"
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      <motion.section
        className="photo-stage"
        style={
          {
            '--avatar-body-color': renderedColors.body,
            '--avatar-eye-color': renderedColors.eyes,
          } as CSSProperties
        }
        aria-label={t('Mode photo')}
      >
        <PhotoStageFrame
          background={snapshotBackground}
          colorFrom={snapshotColorFrom}
          colorTo={snapshotColorTo}
          composition={snapshotComposition}
          tool={photoTool}
          onCompositionChange={setSnapshotComposition}
        >
          {avatarCanvas}
        </PhotoStageFrame>

        <div className="photo-tool-bar" role="toolbar" aria-label={t('Outils du mode photo')}>
          <Button
            variant="outline"
            type="button"
            aria-pressed={photoTool === 'pose'}
            onClick={() => activatePhotoTool('pose')}
          >
            <Move3D />
            {t('Pose')}
          </Button>
          <Button
            variant="outline"
            type="button"
            aria-pressed={photoTool === 'frame'}
            onClick={() => activatePhotoTool('frame')}
          >
            <Scan />
            {t('Cadrage')}
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label={t('Réinitialiser la pose et le cadrage')}
            onClick={resetPhotoSetup}
          >
            <RotateCcw />
          </Button>
        </div>

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
      </motion.section>

      <footer className="photo-dock" aria-label={t('Réglages photo')}>
        <div className="photo-dock-inner">
          <div className="photo-dock-controls">
            <Field className="photo-dock-field" orientation="horizontal">
              <FieldTitle>{t('Choisir un pet')}</FieldTitle>
              <Select
                value={activeAvatarId}
                items={avatars.map(avatar => ({ value: avatar.id, label: avatar.name }))}
                onValueChange={next => next && selectPhotoPet(next)}
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

            <Accordion
              className="photo-tool-accordion"
              multiple
              value={photoPanelSections}
              onValueChange={nextSections => {
                const sections = nextSections as PhotoTool[]
                const currentSections = new Set(photoPanelSections)
                const openedSection = sections.find(section => !currentSections.has(section))
                setPhotoPanelSections(sections)
                if (openedSection) setPhotoTool(openedSection)
              }}
            >
              <AccordionItem
                className="photo-tool-accordion-item"
                value="pose"
                data-active-tool={photoTool === 'pose' || undefined}
              >
                <AccordionTrigger className="photo-tool-accordion-trigger">
                  <span className="photo-tool-accordion-heading">
                    <span className="photo-tool-accordion-icon" aria-hidden="true">
                      <Move3D />
                    </span>
                    <span>
                      <strong>{t('Pose')}</strong>
                      <small>{t('Orientation, regard, couleurs et perspective.')}</small>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="photo-tool-accordion-content">
                  <InspectorCard className="photo-expression-card">
                    <PanelTitle
                      title="Expression"
                      subtitle={t('Choisis l’expression visible sur la photo.')}
                    />
                    <div className="expression-grid photo-expression-grid">
                      {controller.expressions.map((preset, index) => (
                        <ExpressionCard
                          key={preset.id}
                          expression={preset}
                          index={index}
                          active={activeExpression === index}
                          surface={surface}
                          bodyNodes={bodyNodes}
                          colors={activeAvatar.colors}
                          avatarEyes={activeAvatarEyes}
                          renderStyle={activeAvatar.renderStyle}
                          previewId={`photo-${preset.id}`}
                          onSelect={() => transitionToExpression(preset, index)}
                        />
                      ))}
                    </div>
                  </InspectorCard>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                className="photo-tool-accordion-item"
                value="frame"
                data-active-tool={photoTool === 'frame' || undefined}
              >
                <AccordionTrigger className="photo-tool-accordion-trigger">
                  <span className="photo-tool-accordion-heading">
                    <span className="photo-tool-accordion-icon" aria-hidden="true">
                      <Scan />
                    </span>
                    <span>
                      <strong>{t('Cadrage')}</strong>
                      <small>{t('Position, zoom et coins du cadre photo.')}</small>
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="photo-tool-accordion-content">
                  <div className="photo-frame-settings">
                    <div className="snapshot-composition-fields">
                      <NumericField
                        label={t('Position X')}
                        value={snapshotComposition.x}
                        min={-180}
                        max={180}
                        step={1}
                        onChange={x => updateSnapshotComposition({ x })}
                      />
                      <NumericField
                        label={t('Position Y')}
                        value={snapshotComposition.y}
                        min={-180}
                        max={180}
                        step={1}
                        onChange={y => updateSnapshotComposition({ y })}
                      />
                      <NumericField
                        label={t('Zoom')}
                        value={snapshotComposition.scale * 100}
                        min={40}
                        max={300}
                        step={1}
                        unit="%"
                        onChange={zoom => updateSnapshotComposition({ scale: zoom / 100 })}
                      />
                      <NumericField
                        label={t('Coins arrondis')}
                        value={snapshotComposition.cornerRadius}
                        min={0}
                        max={50}
                        step={1}
                        unit="%"
                        onChange={cornerRadius => updateSnapshotComposition({ cornerRadius })}
                      />
                    </div>
                    <Button
                      className="photo-reset-frame"
                      variant="outline"
                      type="button"
                      onClick={resetPhotoFraming}
                    >
                      <RotateCcw />
                      {t('Recentrer le cadrage')}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <InspectorCard>
              <PanelTitle
                title="Arrière-plan"
                subtitle={t('Choisis un fond transparent, uni ou en dégradé.')}
              />
              <Field
                className="snapshot-background-field photo-dock-field"
                orientation="horizontal"
              >
                <FieldTitle>{t('Style')}</FieldTitle>
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
                <Button
                  className="snapshot-random-button"
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={snapshotBackground === 'transparent'}
                  onClick={shuffleSnapshotColors}
                >
                  <Shuffle />
                  {t('Aléatoire')}
                </Button>
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
            </InspectorCard>

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
