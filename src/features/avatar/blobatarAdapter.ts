import { blobatar } from 'blobatar'
import {
  happy,
  love,
  mad,
  sad,
  scared,
  shy,
  sleepy,
  smug,
  surprised,
  thinking,
  unsure,
  wink,
  type Expression as BlobatarExpression,
} from 'blobatar/expression'

import { avatarStyleSeed } from './avatarStyle'
import type { Expression } from './geometry'

const blobatarPoses: Array<BlobatarExpression | undefined> = [
  undefined,
  happy,
  sad,
  mad,
  surprised,
  wink,
  sleepy,
  smug,
  unsure,
  scared,
  love,
  shy,
  thinking,
]

export const blobatarNameForAvatar = (avatar: { id: string; name: string; styleSeed?: string }) =>
  avatarStyleSeed(avatar)

export const renderBlobatarSvg = (
  seed: string,
  options?: { background?: 'squircle' | false; expression?: Expression }
) =>
  blobatar(seed, {
    background: options?.background === false ? false : 'squircle',
    title: seed,
    expression: blobatarExpressionForStudio(options?.expression),
  })

export const blobatarExpressionForStudio = (
  expression: Expression | undefined
): BlobatarExpression | undefined => {
  if (!expression) return undefined
  const index = Number.parseInt(expression.id.replace(/\D/g, ''), 10)
  if (!Number.isFinite(index)) return happy
  return blobatarPoses[Math.abs(index) % blobatarPoses.length]
}
