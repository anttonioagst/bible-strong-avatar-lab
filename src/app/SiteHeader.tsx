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
import { type StudioLanguage } from '@/i18n'
import { type NavSurface, photoPetHash } from '@/app/surface'

type SiteHeaderProps = {
  activeSurface: NavSurface
  activeAvatarId?: string
  variant: 'habitat' | 'bench' | 'grok'
  language: StudioLanguage
  setLanguage: (language: StudioLanguage) => void
  t: (text: string) => string
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

const NAV_ITEMS: { surface: NavSurface; hash: (petId?: string) => string; labelKey: string }[] = [
  { surface: 'lab', hash: () => '#/', labelKey: 'Lab' },
  { surface: 'studio', hash: () => '#/studio', labelKey: 'Studio' },
  { surface: 'photo', hash: petId => (petId ? photoPetHash(petId) : '#/photo'), labelKey: 'Photo' },
]

export function SiteHeader({
  activeSurface,
  activeAvatarId,
  variant,
  language,
  setLanguage,
  t,
  className = '',
}: SiteHeaderProps) {
  const activeLanguage = LANGUAGE_ITEMS.find(item => item.value === language) ?? LANGUAGE_ITEMS[0]

  return (
    <header
      className={`site-header site-header-${variant} ${className}`.trim()}
      aria-label={STUDIO_PRODUCT_NAME}
    >
      <a className="site-wordmark" href="#/" aria-label={STUDIO_PRODUCT_NAME}>
        <span className="site-wordmark-mark" aria-hidden="true" />
        <span className="site-wordmark-antx">{STUDIO_PRODUCT_MARK}</span>{' '}
        <em className="site-wordmark-pets">{STUDIO_PRODUCT_EMPHASIS}</em>
      </a>

      <nav className="site-nav" aria-label={t('Navigation du site')}>
        {NAV_ITEMS.map(item => (
          <a
            key={item.surface}
            className={`site-nav-link${activeSurface === item.surface ? ' site-nav-link-active' : ''}`}
            href={item.hash(item.surface === 'photo' ? activeAvatarId : undefined)}
            aria-current={activeSurface === item.surface ? 'page' : undefined}
          >
            {t(item.labelKey)}
          </a>
        ))}
      </nav>

      <div className="site-header-actions">
        <Button
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="site-github-link"
          render={
            <a href={STUDIO_GITHUB_REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub" />
          }
        >
          <GitHubLogo />
          <span>GitHub</span>
        </Button>
        <Separator orientation="vertical" className="site-header-divider" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="lg"
                className="site-language-trigger"
                aria-label={t('Langue de l’interface')}
              />
            }
          >
            <span aria-hidden="true">{activeLanguage.flag}</span>
            <span className="site-language-code">{activeLanguage.value}</span>
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
    </header>
  )
}
