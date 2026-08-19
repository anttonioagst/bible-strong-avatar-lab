import { STUDIO_GITHUB_REPO_URL } from '@/features/studio/studioBrand'

type SiteFooterProps = {
  t: (text: string) => string
}

export function SiteFooter({ t }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <p className="site-footer-copy">
        {t('AntX Pets est publié sous licence AGPL-3.0. Fork de Bible Strong Avatar Lab.')}{' '}
        <a href={STUDIO_GITHUB_REPO_URL} target="_blank" rel="noreferrer">
          {t('Code source')}
        </a>
      </p>
    </footer>
  )
}
