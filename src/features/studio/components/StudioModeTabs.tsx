import { Download, Move3D, PawPrint, Play, Smile } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Mode } from '@/app/studio-utils'
import { AvatarThumb } from '@/features/avatar/components/AvatarThumb'
import { defaultExpression } from '@/features/avatar/presets'
import type { StudioController } from '@/features/studio/useStudioController'

const MODE_ITEMS = [
  ['avatars', 'Pets', PawPrint],
  ['manual', 'Pose', Move3D],
  ['expressions', 'Expressions', Smile],
  ['states', 'Animations', Play],
  ['export', 'Export', Download],
] as const

const isMode = (value: string | null): value is Mode =>
  value === 'avatars' ||
  value === 'manual' ||
  value === 'expressions' ||
  value === 'states' ||
  value === 'export'

type StudioModeTabsProps = {
  controller: Pick<
    StudioController,
    'activeAvatar' | 'baseBehavior' | 'expressions' | 'expression' | 'mode' | 'setMode' | 't'
  >
  placement: 'rail' | 'dock'
}

export function StudioModeTabs({ controller, placement }: StudioModeTabsProps) {
  const { activeAvatar, baseBehavior, expressions, expression, mode, setMode, t } = controller

  return (
    <Tabs
      className={`studio-mode-tabs studio-mode-tabs-${placement}`}
      value={mode}
      onValueChange={next => {
        if (isMode(next)) setMode(next)
      }}
    >
      <TabsList aria-label={t('Mode d’édition')} className="studio-mode-tabs-list">
        {MODE_ITEMS.map(([value, label, Icon]) => (
          <TabsTrigger
            className={`studio-mode-tab${value === 'avatars' ? ' studio-pet-tab' : ''}`}
            key={value}
            value={value}
          >
            {value === 'avatars' && placement === 'dock' ? (
              <AvatarThumb
                avatar={activeAvatar}
                baseBehavior={baseBehavior}
                expression={expressions[0] ?? expression ?? defaultExpression}
                id={`active-avatar-tab-${placement}-${activeAvatar.id}`}
              />
            ) : (
              <Icon />
            )}
            <span>
              {value === 'avatars' && placement === 'dock' ? activeAvatar.name : t(label)}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
