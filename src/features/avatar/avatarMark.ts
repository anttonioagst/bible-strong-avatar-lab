import { avatarStyleSeed, type AvatarStyleFamily } from './avatarStyle'
import { blobatarNameForAvatar, renderBlobatarSvg } from './blobatarAdapter'
import { generateIpLogoSvg } from './ipLogoMark'

export const resolveAvatarMarkSvg = (avatar: {
  id: string
  name: string
  styleFamily: AvatarStyleFamily
  styleSeed?: string
  markSvg?: string
}) => {
  if (avatar.styleFamily === 'classic') return undefined
  if (avatar.styleFamily === 'ip-logo') {
    return avatar.markSvg?.trim() || generateIpLogoSvg(avatarStyleSeed(avatar))
  }
  return renderBlobatarSvg(blobatarNameForAvatar(avatar))
}
