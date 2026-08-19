import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarThumb } from '@/features/avatar/components/AvatarThumb'
import { avatarStyleFamilies, type AvatarStyleFamily } from '@/features/avatar/avatarStyle'
import type { StudioController } from '@/features/studio/useStudioController'

const familyLabel = (family: AvatarStyleFamily) =>
  family === 'classic' ? 'Classic' : family === 'blob' ? 'Blob' : 'IP logo'

type StyleFilter = 'all' | AvatarStyleFamily

const isStyleFilter = (value: string | null): value is StyleFilter =>
  value === 'all' || value === 'classic' || value === 'blob' || value === 'ip-logo'

export function AvatarPage({ controller }: { controller: StudioController }) {
  const {
    activateAvatar,
    activeAvatarId,
    avatarDragOrigin,
    avatarDragPreview,
    avatars,
    avatarsRef,
    baseBehavior,
    cancelAvatarMove,
    commitAvatarMove,
    createNewAvatar,
    draggedAvatarId,
    draggingAvatarId,
    duplicateAvatar,
    expression,
    previewAvatarMove,
    reduceMotion,
    setCreateBlobOpen,
    setCreateIpOpen,
    setDeleteAvatarOpen,
    setDraggingAvatarId,
    setFocusAvatarName,
    t,
  } = controller
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const visibleAvatars =
    styleFilter === 'all' ? avatars : avatars.filter(avatar => avatar.styleFamily === styleFilter)

  return (
    <div className="panel-stack avatar-page">
      <section className="avatar-shelf" aria-label={t('Choisir un pet')}>
        <div className="avatar-shelf-heading">
          <strong>{t('Famille')}</strong>
          <span>{visibleAvatars.length}</span>
        </div>
        <Tabs
          className="style-family-tabs"
          value={styleFilter}
          onValueChange={next => {
            if (isStyleFilter(next)) setStyleFilter(next)
          }}
        >
          <TabsList aria-label={t('Famille')} className="style-family-picker">
            <TabsTrigger value="all">{t('Toutes')}</TabsTrigger>
            {avatarStyleFamilies.map(family => (
              <TabsTrigger key={family} value={family}>
                {t(familyLabel(family))}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="style-family-hint">{t('Survolez une carte pour lire l’animation.')}</p>
        {visibleAvatars.length === 0 && (
          <div className="studio-empty-state" role="status">
            <p>{t('Aucun pet dans cette famille.')}</p>
            <p>{t('Créez un pet Classic, Blob ou IP logo.')}</p>
          </div>
        )}
        <div className="avatar-grid">
          {visibleAvatars.map(avatar => (
            <motion.div
              className="avatar-sort-item"
              data-dragging={draggingAvatarId === avatar.id || undefined}
              key={avatar.id}
              layout="position"
              animate={{
                opacity: draggingAvatarId === avatar.id ? 0.28 : 1,
                scale: draggingAvatarId === avatar.id ? 0.96 : 1,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }
              }
            >
              <ContextMenu>
                <ContextMenuTrigger
                  render={
                    <Button
                      className="avatar-card"
                      variant="outline"
                      aria-pressed={activeAvatarId === avatar.id}
                      type="button"
                      draggable
                      onPointerEnter={() => setHoveredId(avatar.id)}
                      onPointerLeave={() =>
                        setHoveredId(current => (current === avatar.id ? null : current))
                      }
                      onDragStart={event => {
                        avatarDragOrigin.current = avatarsRef.current
                        avatarDragPreview.current = avatarsRef.current
                        draggedAvatarId.current = avatar.id
                        setDraggingAvatarId(avatar.id)
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnter={() => previewAvatarMove(avatar.id)}
                      onDragOver={event => {
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                      }}
                      onDrop={event => {
                        event.preventDefault()
                        commitAvatarMove(avatar.id)
                      }}
                      onDragEnd={cancelAvatarMove}
                      onClick={() => activateAvatar(avatar.id, false, true)}
                      onDoubleClick={() => {
                        setFocusAvatarName(false)
                        activateAvatar(avatar.id, true)
                      }}
                    >
                      <AvatarThumb
                        avatar={avatar}
                        baseBehavior={baseBehavior}
                        expression={activeAvatarId === avatar.id ? expression : undefined}
                        hoverPlaying={hoveredId === avatar.id}
                        reduceMotion={Boolean(reduceMotion)}
                        id={`avatar-${avatar.id}`}
                      />
                      <span>
                        {avatar.name}
                        <small>{t(familyLabel(avatar.styleFamily))}</small>
                      </span>
                    </Button>
                  }
                />
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => {
                      setFocusAvatarName(false)
                      activateAvatar(avatar.id, true)
                    }}
                  >
                    <Pencil /> {t('Modifier')}
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => duplicateAvatar(avatar)}>
                    <Copy /> {t('Dupliquer')}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    disabled={avatars.length <= 1}
                    onClick={() => {
                      activateAvatar(avatar.id, false, true)
                      setDeleteAvatarOpen(true)
                    }}
                  >
                    <Trash2 /> {t('Supprimer')}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </motion.div>
          ))}
          <Button
            variant="outline"
            className="avatar-add creation-card"
            onClick={createNewAvatar}
            aria-label={t('Nouveau pet Classic')}
          >
            <Plus />
            <span>{t('Classic')}</span>
          </Button>
          <Button
            variant="outline"
            className="avatar-add creation-card"
            onClick={() => setCreateBlobOpen(true)}
            aria-label={t('Nouveau pet Blob')}
          >
            <Plus />
            <span>{t('Blob')}</span>
          </Button>
          <Button
            variant="outline"
            className="avatar-add creation-card"
            onClick={() => setCreateIpOpen(true)}
            aria-label={t('Nouveau logo IP')}
          >
            <Plus />
            <span>{t('IP logo')}</span>
          </Button>
        </div>
      </section>
    </div>
  )
}
