import type { AvatarPose } from './geometry'

export const avatarStyleFamilies = ['classic', 'blob', 'ip-logo'] as const
export type AvatarStyleFamily = (typeof avatarStyleFamilies)[number]

export const avatarProjections = ['perspective', 'flat'] as const
export type AvatarProjection = (typeof avatarProjections)[number]

export const defaultAvatarStyleFamily: AvatarStyleFamily = 'classic'
export const defaultAvatarProjection: AvatarProjection = 'perspective'

export const parseAvatarStyleFamily = (value: unknown): AvatarStyleFamily =>
  value === 'blob' || value === 'ip-logo' ? value : defaultAvatarStyleFamily

export const parseAvatarProjection = (value: unknown): AvatarProjection =>
  value === 'flat' ? 'flat' : defaultAvatarProjection

export const parseAvatarStyleSeed = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const seed = value.trim()
  return seed ? seed : undefined
}

export const parseAvatarMarkSvg = (value: unknown): string | undefined =>
  typeof value === 'string' && /<svg[\s>]/i.test(value) ? value : undefined

export const isClassicAvatarStyle = (family: AvatarStyleFamily) => family === 'classic'

export const applyAvatarProjection = (
  pose: AvatarPose,
  projection: AvatarProjection
): AvatarPose => {
  if (projection !== 'flat') return pose
  if (pose.expression.perspective === 0) return pose
  return {
    ...pose,
    expression: { ...pose.expression, perspective: 0 },
  }
}

export const avatarStyleSeed = (avatar: { id: string; name: string; styleSeed?: string }) =>
  avatar.styleSeed?.trim() || avatar.name.trim() || avatar.id
