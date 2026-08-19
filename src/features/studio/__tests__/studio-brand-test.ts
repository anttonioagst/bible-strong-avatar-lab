import { readFileSync } from 'node:fs'
import path from 'node:path'

import {
  STUDIO_AUTHOR_HANDLE,
  STUDIO_AUTHOR_PROFILE_URL,
  STUDIO_GITHUB_REPO_URL,
  STUDIO_PRODUCT_NAME,
  STUDIO_PUBLIC_SITE_URL,
} from '@/features/studio/studioBrand'

const root = process.cwd()

describe('Studio chrome branding', () => {
  it('credits Antonio on GitHub and names the fork AntX Pets', () => {
    expect(STUDIO_PRODUCT_NAME).toBe('AntX Pets')
    expect(STUDIO_AUTHOR_HANDLE).toBe('@anttonioagst')
    expect(STUDIO_AUTHOR_PROFILE_URL).toBe('https://github.com/anttonioagst')
    expect(STUDIO_GITHUB_REPO_URL).toBe('https://github.com/anttonioagst/bible-strong-avatar-lab')
    expect(STUDIO_PUBLIC_SITE_URL).toBe('https://anttonioagst.github.io/bible-strong-avatar-lab/')
    expect(STUDIO_AUTHOR_HANDLE).not.toContain('smontlouis')
    expect(STUDIO_GITHUB_REPO_URL).not.toContain('smontlouis/')
  })

  it('keeps the canvas footer and header pointed at this fork', () => {
    const stage = readFileSync(
      path.join(root, 'src/features/studio/components/StudioStage.tsx'),
      'utf8'
    )
    const identity = readFileSync(
      path.join(root, 'src/features/studio/components/StudioIdentity.tsx'),
      'utf8'
    )

    expect(stage).toContain('STUDIO_AUTHOR_HANDLE')
    expect(stage).toContain('STUDIO_AUTHOR_PROFILE_URL')
    expect(stage).not.toContain('@_smontlouis')
    expect(stage).not.toContain('x.com/_smontlouis')
    expect(identity).toContain('STUDIO_GITHUB_REPO_URL')
    expect(identity).toContain('STUDIO_PRODUCT_NAME')
    expect(identity).not.toContain('Bible Strong')
    expect(identity).not.toContain('Radar Avatar Lab')
    expect(identity).not.toContain('smontlouis/bible-strong-avatar-lab')
  })

  it('rebrands document title and Open Graph tags without dropping the player Radar title', () => {
    const indexHtml = readFileSync(path.join(root, 'index.html'), 'utf8')
    const radarHtml = readFileSync(path.join(root, 'radar.html'), 'utf8')
    const manifest = readFileSync(path.join(root, 'public/site.webmanifest'), 'utf8')

    expect(indexHtml).toContain(STUDIO_PRODUCT_NAME)
    expect(indexHtml).toContain(STUDIO_PUBLIC_SITE_URL)
    expect(indexHtml).not.toContain('Bible Strong')
    expect(indexHtml).not.toContain('Radar Avatar Lab')
    expect(indexHtml).not.toContain('avatars.bible-strong.app')
    expect(indexHtml).not.toContain('Stéphane Montlouis-Calixte')
    expect(radarHtml).toContain('<title>AntX Pets · Radar</title>')
    expect(radarHtml).not.toContain('Bible Strong')
    expect(manifest).toContain(STUDIO_PRODUCT_NAME)
    expect(manifest).not.toContain('Bible Strong')
    expect(manifest).not.toContain('Radar Avatar Lab')
  })

  it('uses shadcn chrome primitives for identity, tabs, and dialogs', () => {
    const identity = readFileSync(
      path.join(root, 'src/features/studio/components/StudioIdentity.tsx'),
      'utf8'
    )
    const inspector = readFileSync(
      path.join(root, 'src/features/studio/components/StudioInspector.tsx'),
      'utf8'
    )
    const tabs = readFileSync(
      path.join(root, 'src/features/studio/components/StudioModeTabs.tsx'),
      'utf8'
    )
    const dialogs = readFileSync(
      path.join(root, 'src/features/studio/components/StudioDialogs.tsx'),
      'utf8'
    )
    const gallery = readFileSync(
      path.join(root, 'src/features/studio/components/AvatarDrawer.tsx'),
      'utf8'
    )

    expect(identity).toContain('@/components/ui/button')
    expect(identity).toContain('@/components/ui/dropdown-menu')
    expect(tabs).toContain('@/components/ui/tabs')
    expect(inspector).toContain('StudioModeTabs')
    expect(dialogs).toContain('@/components/ui/dialog')
    expect(gallery).toContain('@/components/ui/tabs')
  })

  it('keeps AGPL fork attribution in LICENSE and README', () => {
    const license = readFileSync(path.join(root, 'LICENSE'), 'utf8')
    const readme = readFileSync(path.join(root, 'README.md'), 'utf8')

    expect(license).toContain('GNU AFFERO GENERAL PUBLIC LICENSE')
    expect(license).toContain('Copyright (C) 2007 Free Software Foundation, Inc.')
    expect(readme).toContain('Bible Strong Avatar Lab')
    expect(readme).toContain('Stéphane Montlouis-Calixte')
    expect(readme).toContain('smontlouis/bible-strong-avatar-lab')
    expect(readme).toContain('AGPL-3.0')
    expect(readme).toContain(STUDIO_PRODUCT_NAME)
    expect(readme).toContain(STUDIO_AUTHOR_HANDLE)
  })
})
