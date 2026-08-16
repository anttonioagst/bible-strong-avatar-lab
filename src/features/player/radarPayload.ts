import { applyAvatarEyeDefaults, type StudioAvatar } from '@/features/avatar/avatars'
import type { Expression } from '@/features/avatar/geometry'
import type { AvatarSequence } from '@/features/animation/sequences'
import { loadStudioDocument } from '@/features/studio/studioDocument'

export const RADAR_AVATAR_ID = 'radar'
export const RADAR_IDLE_SEQUENCE_ID = 'idle'

export type RadarPlayerDocument = {
  avatar: StudioAvatar
  sequence: AvatarSequence
  expressions: Record<string, Expression>
}

export const createRadarPlayerDocument = (): RadarPlayerDocument => {
  const document = loadStudioDocument({ getItem: () => null })
  const avatar = document.library.avatars.find(item => item.id === RADAR_AVATAR_ID)
  if (!avatar) throw new Error('Bundled Radar avatar is missing.')
  const sequence = document.sequences.find(item => item.id === RADAR_IDLE_SEQUENCE_ID)
  if (!sequence?.steps.length) throw new Error('Bundled idle animation is missing.')
  const expressions = Object.fromEntries(
    sequence.steps.flatMap(step => {
      const expression = document.expressions.find(item => item.id === step.expressionId)
      return expression
        ? [[step.expressionId, applyAvatarEyeDefaults(expression, avatar.eyes)] as const]
        : []
    })
  )
  if (Object.keys(expressions).length === 0) {
    throw new Error('Bundled idle animation has no usable expressions.')
  }
  return { avatar, sequence, expressions }
}
