import { useEffect, useState } from 'react'

import { AvatarMarkPreview } from '@/features/avatar/components/AvatarMarkPreview'
import { ExpressionPreview } from '@/features/avatar/components/ExpressionWorkspace'
import {
  defaultAvatarEyes,
  resolveAvatarBehavior,
  type AvatarBehaviorLibrary,
  type StudioAvatar,
} from '@/features/avatar/avatars'
import { isClassicAvatarStyle } from '@/features/avatar/avatarStyle'
import { defaultExpression } from '@/features/avatar/presets'
import type { Expression } from '@/features/avatar/geometry'

export function AvatarThumb({
  avatar,
  baseBehavior,
  expression,
  hoverPlaying = false,
  reduceMotion = false,
  id,
}: {
  avatar: StudioAvatar
  baseBehavior: AvatarBehaviorLibrary
  expression?: Expression
  hoverPlaying?: boolean
  reduceMotion?: boolean
  id: string
}) {
  const behavior = resolveAvatarBehavior(avatar, baseBehavior)
  const idle = behavior.sequences.find(sequence => sequence.id === 'idle')
  const idleExpressions = (idle?.steps ?? [])
    .map(step => behavior.expressions.find(item => item.id === step.expressionId))
    .filter((item): item is Expression => Boolean(item))
  const fallback = expression ?? idleExpressions[0] ?? behavior.expressions[0] ?? defaultExpression
  const [playIndex, setPlayIndex] = useState(0)
  const playing = hoverPlaying && !reduceMotion && idleExpressions.length > 1
  useEffect(() => {
    if (!playing) {
      setPlayIndex(0)
      return
    }
    const timer = window.setInterval(
      () => setPlayIndex(current => (current + 1) % idleExpressions.length),
      720
    )
    return () => window.clearInterval(timer)
  }, [playing, idleExpressions.length])
  const shown = playing ? (idleExpressions[playIndex] ?? fallback) : fallback
  if (!isClassicAvatarStyle(avatar.styleFamily)) {
    return (
      <AvatarMarkPreview
        avatar={avatar}
        animate={hoverPlaying && !reduceMotion ? 'hover' : false}
        expression={shown}
      />
    )
  }
  return (
    <ExpressionPreview
      expression={shown}
      surface={avatar.body.primary}
      bodyNodes={avatar.body.nodes}
      colors={avatar.colors}
      avatarEyes={avatar.eyes ?? defaultAvatarEyes}
      renderStyle={avatar.renderStyle}
      projection={avatar.projection}
      id={id}
    />
  )
}
