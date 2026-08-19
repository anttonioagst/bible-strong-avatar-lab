import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { AvatarThumb } from '@/features/avatar/components/AvatarThumb'
import { type AvatarStyleFamily } from '@/features/avatar/avatarStyle'
import { createRadarPlayerDocument } from '@/features/player/radarPayload'
import { mountRadarPlayer } from '@/features/player/mountRadarPlayer'
import { LAB_SHELF_PRIORITY_IDS } from '@/features/studio/studioBrand'
import type { StudioController } from '@/features/studio/useStudioController'
import { SiteFooter } from '@/app/SiteFooter'
import { SiteHeader } from '@/app/SiteHeader'
import { useNavSurface } from '@/app/surface'

type LabHomeProps = Pick<
  StudioController,
  'avatars' | 'baseBehavior' | 'language' | 'reduceMotion' | 'setLanguage' | 't'
>

const sortLabPets = <T extends { id: string }>(pets: T[]): T[] => {
  const priority = new Map<string, number>(LAB_SHELF_PRIORITY_IDS.map((id, index) => [id, index]))
  return [...pets].sort((left, right) => {
    const leftRank = priority.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightRank = priority.get(right.id) ?? Number.MAX_SAFE_INTEGER
    if (leftRank !== rightRank) return leftRank - rightRank
    return left.id.localeCompare(right.id)
  })
}

const styleFamilyLabel = (family: AvatarStyleFamily | undefined, t: (text: string) => string) => {
  if (family === 'blob') return t('Blob')
  if (family === 'ip-logo') return t('Mark')
  return t('Classic')
}

function LabRadarHero({ reduceMotion }: { reduceMotion: boolean | null }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = mountRef.current
    if (!root || reduceMotion) return
    const player = mountRadarPlayer(root, createRadarPlayerDocument())
    player.play()
    return () => player.destroy()
  }, [reduceMotion])

  return (
    <div
      className="lab-hero-radar"
      ref={mountRef}
      aria-label="Radar"
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
    />
  )
}

function LabPetTile({
  avatar,
  baseBehavior,
  reduceMotion,
  t,
}: {
  avatar: LabHomeProps['avatars'][number]
  baseBehavior: LabHomeProps['baseBehavior']
  reduceMotion: boolean | null
  t: LabHomeProps['t']
}) {
  const [hoverPlaying, setHoverPlaying] = useState(false)

  return (
    <article className="lab-pet-tile">
      <div
        className="lab-pet-thumb"
        onMouseEnter={() => setHoverPlaying(true)}
        onMouseLeave={() => setHoverPlaying(false)}
        onFocus={() => setHoverPlaying(true)}
        onBlur={() => setHoverPlaying(false)}
      >
        <AvatarThumb
          avatar={avatar}
          baseBehavior={baseBehavior}
          hoverPlaying={hoverPlaying}
          reduceMotion={Boolean(reduceMotion)}
          id={`lab-pet-${avatar.id}`}
        />
      </div>
      <div className="lab-pet-meta">
        <h3 className="lab-pet-name">{avatar.name}</h3>
        <p className="lab-pet-family">{styleFamilyLabel(avatar.styleFamily, t)}</p>
      </div>
      <div className="lab-pet-actions">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={<a href={`#/photo?pet=${encodeURIComponent(avatar.id)}`} />}
        >
          {t('Photographier')}
        </Button>
        <Button
          nativeButton={false}
          variant="default"
          size="sm"
          render={<a href={`#/studio?pet=${encodeURIComponent(avatar.id)}`} />}
        >
          {t('Ouvrir dans le Studio')}
        </Button>
      </div>
    </article>
  )
}

export function LabHome({
  avatars,
  baseBehavior,
  language,
  reduceMotion,
  setLanguage,
  t,
}: LabHomeProps) {
  const activeSurface = useNavSurface()
  const shelfPets = sortLabPets(avatars)

  return (
    <div className="lab-root">
      <section className="lab-hero">
        <SiteHeader
          activeSurface={activeSurface}
          variant="habitat"
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
        <div className="lab-hero-inner">
          <LabRadarHero reduceMotion={reduceMotion} />
          <div className="lab-hero-copy">
            <h1 className="lab-hero-title">
              {t('Des pets à créer, photographier et emporter avec vous.')}
            </h1>
            <p className="lab-hero-lead">
              {t('Créez des créatures procédurales dans votre navigateur. Tout reste local.')}
            </p>
            <div className="lab-hero-actions">
              <Button
                nativeButton={false}
                variant="default"
                size="lg"
                className="lab-cta-primary"
                render={<a href="#/studio" />}
              >
                {t('Ouvrir le Studio')}
              </Button>
              <Button
                nativeButton={false}
                variant="outline"
                size="lg"
                className="lab-cta-secondary"
                render={<a href="#/photo?pet=radar" />}
              >
                {t('Photographier Radar')}
              </Button>
            </div>
            <div className="lab-hero-secondary-actions">
              <Button
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<a href="#/create/blob" />}
              >
                {t('Créer un Blob')}
              </Button>
              <Button
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<a href="#/create/ip" />}
              >
                {t('Créer un Mark')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="lab-shelf-section">
        <div className="lab-shelf-inner">
          <header className="lab-shelf-header">
            <h2 className="lab-section-title">{t('Vos pets')}</h2>
            <p className="lab-section-lead">{t('Survolez une carte pour lire l’animation.')}</p>
          </header>
          <div className="lab-pet-grid">
            {shelfPets.map(avatar => (
              <LabPetTile
                key={avatar.id}
                avatar={avatar}
                baseBehavior={baseBehavior}
                reduceMotion={reduceMotion}
                t={t}
              />
            ))}
          </div>
          <p className="lab-privacy-note">
            {t(
              'Vos pets restent sur cet appareil. Exportez un projet JSON pour les sauvegarder ou les déplacer.'
            )}
          </p>
        </div>
      </section>

      <SiteFooter t={t} />
    </div>
  )
}
