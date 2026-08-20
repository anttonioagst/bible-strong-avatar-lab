# AntX Pets — UI tokens and anatomy

Visual law for the hosted Lab + Studio. Composer restyles from this file, not
from taste. Product map: [`PETS-SITE.md`](./PETS-SITE.md). Photo v2 chrome on
`#/photo` is the addendum at the bottom plus [`PETS-PHOTO.md`](./PETS-PHOTO.md).

## Decision: split habitat, not a theme toggle

**Not a light app. Not a dark app.** The product is creatures in a den, with a
workbench beside them.

| Zone        | Role                                                          | Why                                                                        |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Habitat** | Lab hero, Studio stage, Photo stage, Radar default page       | Radar’s world: warm charcoal, amber eyes, cream dust. Pets read as living. |
| **Bench**   | Inspector, dialogs, create forms, Photo dock, Lab footer copy | Tools need parchment contrast and readable fields.                         |

This split already exists in the Studio (dark `#1a2422` stage, paper inspector).
PR #9 kept shadcn `base-nova` leftovers (teal-olive primary, generic Inter).
The reform **names** the split and ties it to Radar, not to a dashboard kit.

No theme switch in Phases 1–4. `prefers-color-scheme` does not flip the Lab.
`prefers-reduced-motion` does mute motion.

**Why not full dark?** `#0A0A0A` / Geist is the personal system this fork must
not become. Cool near-black (`#111` / `#171717`) is the same family.

**Why not full light?** All-parchment is Bible Strong’s inspector wearing a new
header. The public site would still feel like a form.

## Brand material (from Radar, not from a kit)

Radar is the flagship pet: body `#1c1c1c`, eyes `#e8a54b`, dish node, charcoal /
cream / bronze / amber. Wiipo coral `#F4A6A3` is a **creature accent**, never
the chrome primary. Antonio stone `#353535` / `#e4e0d6` is a pet, not a token.

## Type

Load variable fonts in the Vite app (fontsource or `index.html` links). No Geist.
No Inter as the hero face. System stacks are fallbacks only.

| Role    | Face                           | Use                                         |
| ------- | ------------------------------ | ------------------------------------------- |
| Display | **Fraunces** (soft opsz serif) | Lab headlines, wordmark _Pets_, Photo title |
| UI      | **Source Sans 3**              | Chrome, inspector, buttons, fields          |
| Mono    | **IBM Plex Mono**              | Seeds, ids, `512×512`, JSON hints           |

Wordmark: `AntX` in UI sans, medium; `Pets` in Fraunces italic. Keep
`STUDIO_PRODUCT_MARK` / `STUDIO_PRODUCT_EMPHASIS`. Do not letter-space the
wordmark like a luxury brand.

Sizes: display 40–56 / 1.1; section 22–28; UI 14–16; meta 12; mono 12–13.
Line length on Lab copy ≤ 42em.

## Tokens

Map these onto the existing shadcn slots in `src/app/styles.css` (`--background`,
`--primary`, `--ring`, …). Add habitat variables. Do not add a second theme file
and do not import Estel / Glide / personal DESIGN.md tokens.

### Habitat

| Token                | Value     | Use                           |
| -------------------- | --------- | ----------------------------- |
| `--habitat`          | `#1C1914` | Stage, Lab hero, Photo canvas |
| `--habitat-elevated` | `#2A241C` | Header on habitat, chips      |
| `--habitat-rule`     | `#3A3228` | Hairlines on dark             |
| `--cream`            | `#F3E6C8` | Type on habitat, dust         |
| `--cream-dim`        | `#C9B89A` | Meta on habitat               |
| `--amber`            | `#E8A54B` | Signal, focus, living CTA     |
| `--amber-deep`       | `#C47A2C` | Amber pressed / ring on paper |
| `--bronze`           | `#8A5A28` | Secondary dark accent         |
| `--coral`            | `#F4A6A3` | Wiipo / creature chip only    |

Hero wash: radial cream dust at ~18% opacity, not a teal glow, not a grid.

### Bench

| Token              | Value     | Use                             |
| ------------------ | --------- | ------------------------------- |
| `--parchment`      | `#F4EFE6` | Inspector + Lab page below hero |
| `--parchment-card` | `#FFFBF4` | Cards, dialogs, Photo dock      |
| `--ink`            | `#241C14` | Primary text on paper           |
| `--ink-muted`      | `#6B6156` | Help, counts                    |
| `--rule`           | `#D9D0C2` | Borders, inputs                 |
| `--danger`         | `#B42318` | Delete only                     |

shadcn mapping: `--background` = parchment; `--foreground` = ink; `--card` =
parchment-card; `--primary` on bench = `#1C1914` with cream foreground;
`--ring` = amber-deep; `--destructive` = danger. On habitat surfaces, ignore
`--background` and paint with `--habitat`.

### Radius, space, hit

Pets are round. Chrome is softly round, not 6px SaaS.

- Pet tile / stage well: `20px` or `999px` wells for circular pets
- Cards / dialogs: `16px`
- Buttons / inputs: `12px`
- Filter pills: `999px`
- Hits: 40px minimum (keep PR #9’s tab target)
- Lab header height: 64px; Photo dock: 80–96px; page gutter: 24–32px
- Lab measure: max 1120px for shelf + copy; hero is full bleed

### Focus, selection, hover, destroy

One language across Lab tiles, Studio pets, expressions, animations.

- **Hover:** opacity / translateY(−2px) / amber hairline. No layout shift.
- **Selected:** 2px amber ring, cream or parchment fill. `aria-pressed` stays.
- **Focus-visible:** 2px amber ring, 2px offset. Never remove outlines.
- **Destructive:** danger text + confirm dialog. No red pet tiles.

## Anatomy

### Site header (Lab, Studio, Photo, create)

Shared chrome. Kill the Studio-only identity that pretends to be a site.

`[ AntX *Pets* ]    Lab   Studio   Photo    [ GitHub ] [ lang ]`

- Habitat header when the surface is Lab / Photo / create preview.
- Bench header (parchment, ink) is allowed on Studio if the inspector needs
  contrast — but the **nav items stay the same**.
- Active surface: amber underline or pill. Do not invent a second nav.
- GitHub points at this fork. Language: EN / FR / zh-CN only.

### Lab hero

Full-bleed habitat. Radar large, playing. Headline in Fraunces. Two primary
actions max in the first fold (Open Studio, Photograph). Blob / Mark are
secondary text buttons or shelf cards — still visible, not hidden.

### Pet tile

Square-ish card, parchment-card on bench or elevated habitat on the hero shelf.
Thumb (classic SVG / blobatar / mark). Name in UI sans. Family as a quiet meta
line (`Classic` · `Blob` · `Mark`), not as the title. Hover plays. Double-click
in Studio still edits; on Lab, a tile click selects and a button opens Studio
or Photo.

### Studio

Keep the two-column grid (`minmax(460px, 1fr) + minmax(440px, 520px)`) and the
980px stacked split. Restyle to tokens; do not redesign the domain panels in
Phase 1. Stage credit `Made with ❤️ by @anttonioagst` may stay on the canvas.
Bible Strong does not.

### Photo

P2 shipped habitat stage + parchment dock (amber Capture). **P6 replaces that
chrome on `#/photo` only** — see the addendum. Lab / Studio stay on this
file’s habitat split.

Until P6 lands, the dock remains: background, size, format, Capture. No
tooltip that sends people to Export.

### Create Blob / Mark

Habitat preview (live pet or mark) + bench form. Seed / name in mono. Primary
button: Create pet. Mark import is a secondary outline button.

### Radar embed

No header. Page `#111316` may shift to `--habitat` in a later paint pass only
if the iframe contract stays: fill, no chrome, `?bg=transparent` still works.

## Motion

Prefer transform and opacity. Gallery spring may stay
(`stiffness: 520, damping: 42`). Photo flash stays a short white fade.
`prefers-reduced-motion: reduce` → no hover-play, no flash, instant layout.

Optional UI sounds are **not** in this system until Reform Phase 5. If that
phase opens: Web Audio only, no MP3, user gesture, mute with reduced motion.

## Do

- Paint pets on habitat; paint forms on parchment.
- Use amber only for living signal (eyes, focus, primary capture / create).
- Reuse `src/components/ui/*`. Do not add one-off kits.
- Sync new copy in `src/i18n/index.ts` and `src/i18n/zh.ts`.
- Keep AGPL credit in README, LICENSE, and the Lab footer.

## Do not

- Geist, Inter-as-brand, `#0A0A0A`, `#111`, `#171717`.
- Estel tokens. Glide teal. Bible Strong blue marketing chrome.
- Personal `DESIGN.md` type ramps or “editorial noir” portfolios.
- Neon grids, glassmorphism, 3D CSS rooms, three.js.
- A second component library or a marketing-only CSS file that diverges.
- Stickers: “Blob” badges that do not open `#/create/blob`.
- MP3 / CDN sound packs.
- Replacing `geometry.ts` to “match the new look.”

---

## Addendum — Photo v2 chrome (P6)

Habitat / parchment in this file still govern **Lab, Studio, create, and
`radar.html`**. They do **not** govern `#/photo` after Phase 6.

Photo surface uses Antonio’s Grok tokens (personal DESIGN.md). That
overrides the “Photo = habitat stage + parchment dock + amber Capture”
anatomy above, **for `#/photo` only**. Do not rewrite Lab to Grok in this
phase. Do not treat this addendum as permission to restyle the whole app.

Locked Photo tokens and rules live in [`PETS-PHOTO.md`](./PETS-PHOTO.md):

| Token | Value |
| ----- | ----- |
| canvas | `#0A0A0A` |
| canvas-soft | `#1A1C20` |
| canvas-card | `#191919` |
| hairline | `#212327` |
| pill-border | `rgba(255,255,255,0.25)` |
| ink / body / mute | `#FFFFFF` / `#DADBDF` / `#7D8187` |
| CTA | white filled pill — **Capture only** |

Geist + Geist Mono, weight 400, radius pill 9999 / card 8, press 0.97, no
box-shadow, no hover lift. Shared `SiteHeader` on Photo uses
`variant="grok"` so the bar is not habitat amber.

The square stage is the **picture** (`PhotoStageFrame`), not a Grok card.
Checkerboard when the background is transparent. Frame interaction CSS
comes from upstream and is restyled to these tokens, not redesigned.

Until a later named phase, ignore the earlier “Why not full dark? /
No Geist / `#0A0A0A`” bans **only** inside `.photo-root` and
`.site-header-grok`. They still apply everywhere else.
