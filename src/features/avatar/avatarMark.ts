import { avatarStyleSeed, type AvatarStyleFamily } from './avatarStyle'
import { blobatarNameForAvatar, renderBlobatarSvg } from './blobatarAdapter'
import type { Expression } from './geometry'
import { generateIpLogoSvg } from './ipLogoMark'

export type AvatarMarkCaptureOptions = {
  background?: 'squircle' | false
  expression?: Expression
}

export const resolveAvatarMarkSvg = (
  avatar: {
    id: string
    name: string
    styleFamily: AvatarStyleFamily
    styleSeed?: string
    markSvg?: string
  },
  options?: AvatarMarkCaptureOptions
) => {
  if (avatar.styleFamily === 'classic') return undefined
  if (avatar.styleFamily === 'ip-logo') {
    return avatar.markSvg?.trim() || generateIpLogoSvg(avatarStyleSeed(avatar))
  }
  return renderBlobatarSvg(blobatarNameForAvatar(avatar), {
    background: options?.background,
    expression: options?.expression,
  })
}
