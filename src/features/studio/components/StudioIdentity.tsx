import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  STUDIO_GITHUB_REPO_URL,
  STUDIO_PRODUCT_EMPHASIS,
  STUDIO_PRODUCT_MARK,
  STUDIO_PRODUCT_NAME,
} from '@/features/studio/studioBrand'
import type { StudioController } from '@/features/studio/useStudioController'
import { type StudioLanguage } from '@/i18n'

type StudioIdentityProps = Pick<StudioController, 'language' | 'setLanguage' | 't'> & {
  className?: string
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  )
}

const LANGUAGE_ITEMS: { value: StudioLanguage; flag: string; label: string }[] = [
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'fr', flag: '🇫🇷', label: 'Français' },
  { value: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
]

export function StudioIdentity({ className = '', language, setLanguage, t }: StudioIdentityProps) {
  const activeLanguage = LANGUAGE_ITEMS.find(item => item.value === language) ?? LANGUAGE_ITEMS[0]

  return (
    <div className={`studio-identity ${className}`.trim()}>
      <div className="brand" aria-label={STUDIO_PRODUCT_NAME}>
        <span className="brand-mark" />
        {STUDIO_PRODUCT_MARK} <em>{STUDIO_PRODUCT_EMPHASIS}</em>
      </div>
      <div className="language-picker">
        <Button
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="source-link"
          render={
            <a href={STUDIO_GITHUB_REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub" />
          }
        >
          <GitHubLogo />
          <span>GitHub</span>
        </Button>
        <Separator orientation="vertical" className="identity-divider" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="lg"
                className="language-menu-trigger"
                aria-label={t('Langue de l’interface')}
              />
            }
          >
            <span aria-hidden="true">{activeLanguage.flag}</span>
            <span className="language-menu-code">{activeLanguage.value}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="language-menu">
            <DropdownMenuRadioGroup
              value={language}
              onValueChange={next => next && setLanguage(next as StudioLanguage)}
            >
              {LANGUAGE_ITEMS.map(item => (
                <DropdownMenuRadioItem key={item.value} value={item.value}>
                  <span aria-hidden="true">{item.flag}</span>
                  {item.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
