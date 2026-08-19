import { Camera, Settings2 } from 'lucide-react'
import { motion } from 'motion/react'
import { type CSSProperties } from 'react'

import { Button } from '@/components/ui/button'

import { AvatarMarkPreview } from '@/features/avatar/components/AvatarMarkPreview'
import { isClassicAvatarStyle } from '@/features/avatar/avatarStyle'
import { AvatarCanvas } from '@/features/rendering/components/AvatarCanvas'
import { StudioIdentity } from '@/features/studio/components/StudioIdentity'
import { STUDIO_AUTHOR_HANDLE, STUDIO_AUTHOR_PROFILE_URL } from '@/features/studio/studioBrand'
import type { StudioController } from '@/features/studio/useStudioController'

export function StudioStage({ controller }: { controller: StudioController }) {
  const {
    activeAvatar,
    activeAvatarEyes,
    activeSequenceLabel,
    bodyEditing,
    canvasExpression,
    commitBodyNode,
    editing,
    expression,
    freezeLivePreviewForManipulation,
    highlight,
    linked,
    mode,
    persistEditedEyeExpression,
    photoFlash,
    playbackStatus,
    previewCanvasExpression,
    previewExpressionDraft,
    previewSelectedBodyNode,
    reduceMotion,
    renderedColors,
    renderedRotationGizmo,
    renderedScene,
    selectBodyNode,
    selectedBodyNode,
    selectedBodyNodeId,
    selectedEyeSide,
    setEditing,
    setSelectedEyeSide,
    showWire,
    surface,
    t,
    takePicture,
    transitionToExpression,
    updateHighlight,
    updateImmediate,
  } = controller
  return (
    <motion.section
      className="stage-column"
      style={
        {
          '--avatar-body-color': renderedColors.body,
          '--avatar-eye-color': renderedColors.eyes,
        } as CSSProperties
      }
    >
      <StudioIdentity
        className="stage-identity"
        language={controller.language}
        setLanguage={controller.setLanguage}
        t={t}
      />
      {isClassicAvatarStyle(activeAvatar.styleFamily) ? (
        <AvatarCanvas
          expression={canvasExpression}
          avatarEyes={activeAvatarEyes}
          surface={surface}
          scene={renderedScene}
          colors={renderedColors}
          renderStyle={activeAvatar.renderStyle}
          rotationGizmo={renderedRotationGizmo}
          showWire={showWire}
          bodyEditing={bodyEditing}
          selectedBodyNodeId={selectedBodyNodeId}
          selectedBodyNode={selectedBodyNode}
          selectedSide={selectedEyeSide}
          linked={linked}
          highlight={highlight}
          onHighlightChange={updateHighlight}
          onBodyNodeSelect={selectBodyNode}
          onBodyNodePreview={previewSelectedBodyNode}
          onBodyNodeChange={commitBodyNode}
          onEyeSelect={setSelectedEyeSide}
          onPreview={previewCanvasExpression}
          onChange={editing ? previewExpressionDraft : updateImmediate}
          onReset={next => {
            if (editing) {
              setEditing(current => (current ? { ...current, draft: next } : current))
            }
            transitionToExpression(next)
          }}
          onEyeChange={
            editing ? previewExpressionDraft : bodyEditing ? persistEditedEyeExpression : undefined
          }
          playback={
            activeSequenceLabel && playbackStatus !== 'stopped'
              ? { name: activeSequenceLabel, status: playbackStatus }
              : null
          }
          onManipulationStart={freezeLivePreviewForManipulation}
        />
      ) : (
        <div className="avatar-wrap avatar-wrap-mark">
          <AvatarMarkPreview
            avatar={activeAvatar}
            animate={reduceMotion ? false : 'always'}
            expression={canvasExpression}
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
      <div className="photo-capture-bar">
        <Button
          className="photo-capture-button"
          type="button"
          aria-label={t('Prendre une photo')}
          onClick={takePicture}
        >
          <Camera />
          <span className="photo-capture-label">{t('Prendre une photo')}</span>
        </Button>
        <Button
          nativeButton={false}
          className="photo-settings-button"
          variant="secondary"
          size="sm"
          render={
            <a
              href={`#/photo?pet=${encodeURIComponent(activeAvatar.id)}`}
              aria-label={t('Ouvrir Photo')}
            />
          }
        >
          <Settings2 />
          <span className="photo-settings-label">{t('Photo')}</span>
        </Button>
      </div>
      <p className="stage-credit">
        Made with ❤️ by{' '}
        <a href={STUDIO_AUTHOR_PROFILE_URL} target="_blank" rel="noreferrer">
          {STUDIO_AUTHOR_HANDLE}
        </a>
        .
      </p>
    </motion.section>
  )
}
