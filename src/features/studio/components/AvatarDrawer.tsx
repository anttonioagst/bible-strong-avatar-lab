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
import { type AvatarStyleFamily } from '@/features/avatar/avatarStyle'
import { LAB_SHELF_PRIORITY_IDS } from '@/features/studio/studioBrand'
import type { StudioController } from '@/features/studio/useStudioController'

const familyLabel = (family: AvatarStyleFamily) =>
  family === 'classic' ? 'Classic' : family === 'blob' ? 'Blob' : 'Mark'

const sortShelfPets = <T extends { id: string }>(pets: T[]): T[] => {
  const priority = new Map<string, number>(LAB_SHELF_PRIORITY_IDS.map((id, index) => [id, index]))
  return [...pets].sort((left, right) => {
    const leftRank = priority.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightRank = priority.get(right.id) ?? Number.MAX_SAFE_INTEGER
    if (leftRank !== rightRank) return leftRank - rightRank
    return left.id.localeCompare(right.id)
  })
}

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
    setDeleteAvatarOpen,
    setDraggingAvatarId,
    setFocusAvatarName,
    t,
  } = controller
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const shelfPets = sortShelfPets(avatars)

  return (
    <div className="panel-stack avatar-page">
      <section className="avatar-shelf pet-shelf" aria-label={t('Choisir un pet')}>
        <header className="pet-shelf-header">
          <div>
            <h2 className="pet-shelf-title">{t('Vos pets')}</h2>
            <p className="pet-shelf-lead">{t('Survolez une carte pour lire l’animation.')}</p>
          </div>
          <span className="pet-shelf-count">{shelfPets.length}</span>
        </header>
        {shelfPets.length === 0 ? (
          <div className="studio-empty-state" role="status">
            <p>{t('Aucun pet pour l’instant.')}</p>
            <p>{t('Créez un pet Classic, Blob ou Mark.')}</p>
          </div>
        ) : (
          <div className="avatar-grid pet-shelf-grid">
            {shelfPets.map(avatar => (
              <motion.div
                className="avatar-sort-item pet-shelf-item"
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
                        className="avatar-card pet-shelf-card"
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
                        <span className="pet-shelf-thumb">
                          <AvatarThumb
                            avatar={avatar}
                            baseBehavior={baseBehavior}
                            expression={activeAvatarId === avatar.id ? expression : undefined}
                            hoverPlaying={hoveredId === avatar.id}
                            reduceMotion={Boolean(reduceMotion)}
                            id={`avatar-${avatar.id}`}
                          />
                        </span>
                        <span className="pet-shelf-meta">
                          <strong className="pet-shelf-name">{avatar.name}</strong>
                          <small className="pet-shelf-family">
                            {t(familyLabel(avatar.styleFamily))}
                          </small>
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
          </div>
        )}
        <div className="pet-shelf-create">
          <p className="pet-shelf-create-label">{t('Ajouter un pet')}</p>
          <div className="pet-shelf-create-grid">
            <Button
              variant="outline"
              className="avatar-add creation-card pet-create-card"
              onClick={createNewAvatar}
              aria-label={t('Nouveau pet Classic')}
            >
              <Plus />
              <span>{t('Classic')}</span>
            </Button>
            <Button
              variant="outline"
              className="avatar-add creation-card pet-create-card"
              nativeButton={false}
              render={<a href="#/create/blob" />}
              aria-label={t('Nouveau pet Blob')}
            >
              <Plus />
              <span>{t('Blob')}</span>
            </Button>
            <Button
              variant="outline"
              className="avatar-add creation-card pet-create-card"
              nativeButton={false}
              render={<a href="#/create/ip" />}
              aria-label={t('Nouveau pet Mark')}
            >
              <Plus />
              <span>{t('Mark')}</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
