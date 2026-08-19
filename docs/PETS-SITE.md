# AntX Pets — hosted site map

This is the product map of the **hosted site**. Composer implements from
[`PETS-REFORM.md`](./PETS-REFORM.md). Visual law is [`PETS-UI.md`](./PETS-UI.md).
Domain law stays in [`CONTEXT.md`](../CONTEXT.md).

## What is live today

The deployable app is a Vite SPA. `src/app/App.tsx` mounts only `StudioView`.
There is no router. The public face is the Studio header plus a dark stage.

| URL | What a visitor actually gets |
| --- | --- |
| [bible-strong-avatar-lab.vercel.app](https://bible-strong-avatar-lab.vercel.app) | Upstream-looking Studio (Bible Strong chrome, Strobi first). This is the “done badly” public face Antonio called out. |
| [anttonioagst.github.io/bible-strong-avatar-lab](https://anttonioagst.github.io/bible-strong-avatar-lab/) | This fork’s intended host. Same architecture: Studio is the site. |
| `/radar.html` | Player-only Radar. Idle + blink. `?bg=transparent` for embeds. No Studio chrome. |

PR #9 renamed and restyled Studio chrome as AntX Pets (shadcn `base-nova`). It did
not add a site. Photo Mode exists as **Export → snapshot accordion** plus a stage
shutter that tells you to change settings in Export. Blob and IP-as-logo exist as
`styleFamily` plus gallery `+` cards and small dialogs. They are not create paths.

The engine, `geometry.ts`, localStorage document, and JSON export/import are
correct. Do not replace them.

## Decision: one app, three public faces

The Studio **is** the site in code. A second marketing tree (separate package,
separate tokens, separate persistence) would rot.

Keep **one Vite app** and **one Studio document**. Add a **Lab Home** as the
default surface of that same app. Studio remains the authoring tool. Photo and
the Blob / Mark create paths become named surfaces, not buried inspector state.

`radar.html` stays a **second HTML entry**. It is the wiip.club embed contract.
Do not fold it into the SPA and do not put Lab chrome on it.

GitHub Pages is served with `base: './'` and no rewrite. Path routes like
`/studio` 404 on refresh. **Hash surfaces** are the only allowed IA:

| Hash | Surface | Job |
| --- | --- | --- |
| `#/` or empty | **Lab** | Public home. Pets, Radar, enter Studio / Photo / create. |
| `#/studio` | **Studio** | The existing tool (stage + inspector). |
| `#/photo` | **Photo** | First-class capture: size, background, SVG/PNG. |
| `#/create/blob` | **Create Blob** | Seed string → pet. |
| `#/create/ip` | **Create Mark** | Name or square import → pet. |
| `radar.html` | **Radar embed** | Out of the SPA. Do not hash this. |

Optional query on Photo / Studio: `?pet=<avatarId>` selects that pet in the
existing document. Do not add a router library.

## Vocabulary

Code and JSON keep CONTEXT terms: Avatar, Neutral appearance, Expression,
Animation, Playback, `styleFamily`.

Visitor-facing copy on the hosted site uses **product** words:

| Say | Do not say on the site |
| --- | --- |
| Pet | Avatar, character prefab, styleFamily |
| Lab | Landing, marketing, playground |
| Studio | Avatar Lab, Bible Strong, Radar Avatar Lab |
| Photo | Snapshot accordion, Mode photo buried in Export |
| Blob | “hidden blob style” |
| Mark | IP logo as a filter chip only |
| Family | Theme, renderer, skin |

**Mascot-as-character:** a mark or logo that becomes a creature you can keep,
photograph, and open in Studio. The gallery is a shelf of pets, not a tweet
screenshot and not a logo dump.

## What a visitor does in 60 seconds

1. **0–10s — Lab.** Habitat hero with Radar alive (same idle/blink as the
   player). Wordmark **AntX Pets**. One line: pets you can make, photograph,
   and take with you. No Bible Strong chrome.
2. **10–25s — Shelf.** Hover Radar, Wiipo, Antonio, then a bundled Classic pet.
   Each tile is a creature. Actions: Photograph · Open in Studio.
3. **25–40s — One create path.** “Make a Blob” or “Turn a mark into a pet.”
   Seed or name, live preview, Create. Lands in Studio with that pet selected.
4. **40–55s — Photo.** Full pet, controls on the surface: transparent / solid /
   linear / radial, 512 / 1024 / 2048, SVG or PNG. Capture downloads locally.
5. **55–60s — Leave with a file.** Photo download or Export → Studio project
   JSON. No account. Closing the tab keeps the local document.

If they only came for the embed, they never see this: `radar.html` is enough.

## Surfaces

### Lab (`#/`)

Public home. Same `src/app` shell, same tokens, same document.

- Site header (shared): wordmark, Lab / Studio / Photo, GitHub, language.
- Habitat hero: Radar in-page (reuse player mount or the bundled Radar avatar
  preview). CTAs: Open Studio · Photograph Radar · Make a Blob · Make a Mark.
- Pet shelf: bundled pets first (Radar, Antonio, Wiipo, then Classic library).
  User-created pets from localStorage append. Hover-to-play stays.
- Short “how it stays yours” note: local only, JSON backup, AGPL source.
- Footer: AGPL + “fork of Bible Strong Avatar Lab” + source link. That is the
  **only** Bible Strong appearance on the hosted site.

Lab does not author geometry. It only selects pets and sends people to Studio,
Photo, or a create surface.

### Studio (`#/studio`)

The current tool. Left: stage. Right: inspector. Modes stay:

`Pets · Pose · Expressions · Animations · Export`

- **Pets** is the shelf inside the tool (create, reorder, duplicate, delete).
- **Export** keeps React ZIP, JavaScript ZIP, and Studio project JSON.
- Photo settings **leave** Export once Phase 2 ships. Export may link to Photo.
- Stage shutter may jump to `#/photo` or keep a one-shot capture. After Phase 2,
  settings must be visible on Photo, not only in a tooltip.

### Photo (`#/photo`)

First-class product surface. This is the feature saved from
[avatars.bible-strong.app](https://avatars.bible-strong.app) — make it obvious.

Reuse `snapshotExporter` and the controller’s `takePicture` / snapshot state.
Do not add a server, a gallery host, or new formats.

| Control | Allowed values |
| --- | --- |
| Background | `transparent` · `solid` · `linear` · `radial` |
| Colors | `colorFrom` / `colorTo` when not transparent |
| Size | 512 · 1024 · 2048 |
| Format | SVG · PNG |

Capture writes a local file (`snapshotFileName`). Flash on the stage may stay.
Photo is not a social share sheet.

### Create Blob (`#/create/blob`)

`createBlobAvatar(seed)` already exists. The site must feel like **type a seed,
get a pet**.

- Seed field (name or id). Live blobatar preview.
- Create inserts into the Studio document and opens `#/studio` with that pet
  active (Pets mode).
- Studio dialog may remain as a shortcut from the Pets shelf.

### Create Mark (`#/create/ip`)

`createIpLogoAvatar` + `generateIpLogoSvg` / square import already exist.

- Path A: type a name → generated square mark.
- Path B: import square SVG or raster (`sanitizeImportedSvg` / `wrapRasterMark`).
- Preview the **mark**, then the **pet** (mascot-as-character).
- Create inserts and opens Studio. Not a favicon factory.

### Radar embed (`radar.html`)

Unchanged contract:

- Only Radar. Idle + blink. No header, no language picker, no capture bar.
- Default dark page. `?bg=transparent` for wiip.club.
- Client-only. No analytics.

Lab may iframe or mount the same payload for the hero. The embed URL stays
stable.

### Export (Studio only)

Three jobs after Photo moves out:

1. React / TypeScript package (ZIP).
2. Framework-free JavaScript + HTML demo (ZIP).
3. Full Studio project JSON download / import.

No backend. Import replaces the local document after confirm.

## Persistence (do not invent)

- Document key: `bible-strong-avatar-studio-v2` (do not rename).
- Language key: `avatar-studio-language`.
- Portable backup: Export → Studio project JSON.
- Additive avatar fields stay: `styleFamily`, `projection`, `styleSeed`, `markSvg`.
- Missing fields still mean Classic + perspective.
- A saved local project stays authoritative. Bundled pets append by id when
  missing (PR #6). Do not overwrite user edits.

## Out of the hosted site

- Accounts, cloud sync, comments, likes.
- A second Next.js / marketing repo.
- Replacing `geometry.ts` or the standalone engine.
- Bible Strong, Estel, Glide, or personal Geist/#0A0A0A chrome.
- Portuguese UI (keep EN / FR / zh-CN in sync).
- Interaction sounds, unless a later named phase in `PETS-REFORM.md`.
