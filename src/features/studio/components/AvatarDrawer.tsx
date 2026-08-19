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
import { AvatarThumb } from '@/features/avatar/components/AvatarThumb'
import { avatarStyleFamilies, type AvatarStyleFamily } from '@/features/avatar/avatarStyle'
import type { StudioController } from '@/features/studio/useStudioController'

const familyLabel = (family: AvatarStyleFamily) =>
  family === 'classic' ? 'Classic' : family === 'blob' ? 'Blob' : 'IP logo'

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
  const [styleFilter, setStyleFilter] = useState<'all' | AvatarStyleFamily>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const visibleAvatars =
    styleFilter === 'all' ? avatars : avatars.filter(avatar => avatar.styleFamily === styleFilter)

  return (
    <div className="panel-stack avatar-page">
      <section className="avatar-shelf" aria-label={t('Choisir un avatar')}>
        <div className="avatar-shelf-heading">
          <strong>{t('Famille')}</strong>
          <span>{visibleAvatars.length}</span>
        </div>
        <div className="style-family-picker" role="tablist" aria-label={t('Famille')}>
          <Button
            type="button"
            size="sm"
            variant={styleFilter === 'all' ? 'default' : 'outline'}
            aria-pressed={styleFilter === 'all'}
            onClick={() => setStyleFilter('all')}
          >
            {t('Toutes')}
          </Button>
          {avatarStyleFamilies.map(family => (
            <Button
              key={family}
              type="button"
              size="sm"
              variant={styleFilter === family ? 'default' : 'outline'}
              aria-pressed={styleFilter === family}
              onClick={() => setStyleFilter(family)}
            >
              {t(familyLabel(family))}
            </Button>
          ))}
        </div>
        <p className="style-family-hint">{t('Survolez une carte pour lire l’animation.')}</p>
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
            aria-label={t('Nouvel avatar')}
          >
            <Plus />
            <span>{t('Classic')}</span>
          </Button>
          <Button
            variant="outline"
            className="avatar-add creation-card"
            onClick={() => setCreateBlobOpen(true)}
            aria-label={t('Nouvel avatar Blob')}
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
