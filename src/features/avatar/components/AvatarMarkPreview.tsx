import { Blobatar } from 'blobatar/react'
import 'blobatar/motion.css'

import { resolveAvatarMarkSvg } from '@/features/avatar/avatarMark'
import type { StudioAvatar } from '@/features/avatar/avatars'
import {
  blobatarExpressionForStudio,
  blobatarNameForAvatar,
} from '@/features/avatar/blobatarAdapter'
import type { Expression } from '@/features/avatar/geometry'

export function AvatarMarkPreview({
  avatar,
  animate = false,
  expression,
  className = 'avatar-preview',
}: {
  avatar: StudioAvatar
  animate?: false | 'hover' | 'always'
  expression?: Expression
  className?: string
}) {
  if (avatar.styleFamily === 'blob') {
    const name = blobatarNameForAvatar(avatar)
    const expressionPose = blobatarExpressionForStudio(expression)
    if (animate) {
      return (
        <Blobatar
          className={className}
          name={name}
          background="squircle"
          animate={animate}
          expression={expressionPose}
          title={avatar.name}
        />
      )
    }
    return (
      <Blobatar
        className={className}
        name={name}
        background="squircle"
        expression={expressionPose}
        title={avatar.name}
      />
    )
  }
  const markSvg = resolveAvatarMarkSvg(avatar) ?? ''
  return (
    <div
      className={`${className} ip-logo-mark${animate ? ' is-playing' : ''}`}
      dangerouslySetInnerHTML={{ __html: markSvg }}
    />
  )
}
