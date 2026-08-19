# AntX Pets — reform allowlists

Composer implements **one phase per PR**. This file is law. Do not invent
architecture, backends, or extra surfaces. Read [`PETS-SITE.md`](./PETS-SITE.md)
and [`PETS-UI.md`](./PETS-UI.md) before touching UI.

Domain, persistence, and engine invariants stay in [`CONTEXT.md`](../CONTEXT.md)
and `docs/adr/`.

## Hard locks (every phase)

| Lock                  | Meaning                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| No engine rewrite     | Do not edit `src/features/avatar/geometry.ts` or hand-edit `standaloneEngine.generated.ts`.                                    |
| No new backend        | No auth, API, database, analytics, or hosted asset store.                                                                      |
| Persistence stays     | `bible-strong-avatar-studio-v2` + JSON export/import. Do not rename the key.                                                   |
| Schema stays additive | `styleFamily` / `projection` / `styleSeed` / `markSvg` already exist. Do not invent a v3 document.                             |
| AGPL credit stays     | README + LICENSE + Lab footer. No Bible Strong **chrome**.                                                                     |
| No second tree        | No extra Vite app, no Next.js marketing site, no parallel design system.                                                       |
| No banned visuals     | No Geist, `#0A0A0A`, Estel, Glide teal, personal DESIGN.md.                                                                    |
| UI primitives         | Reuse `src/components/ui/`. No `useMemo` / `useCallback` / `memo`.                                                             |
| i18n                  | EN / FR / zh-CN stay in sync. No extra locale.                                                                                 |
| Pages-safe URLs       | Hash surfaces only. `base: './'` stays. `radar.html` stays a build input.                                                      |
| Tests                 | Focused tests for new surface/IA behavior. `pnpm typecheck` + the touched test file while working; `pnpm check` before commit. |

## Hypothesis (resolved)

A separate public home **as a second product** would rot: one document, one
token file, one controller.

A **Lab surface in this same app** is required. “Studio with a renamed header”
is the thing to kill. Lab Home is default (`#/`). Studio is `#/studio`.
`radar.html` remains the embed.

## Phase 0 — this documentation PR

Already the job of this change: the three docs + pointers in README / AGENTS.md.
No `src/` application code.

---

## Phase 1 — Information architecture + site chrome

**Goal:** Visitors land on a Lab, not inside the inspector. Studio is one hop.
Tokens and shared header exist. Features are linked, even if create/photo still
use today’s dialogs and Export accordion.

### Allow

- `src/app/App.tsx` — choose surface from hash; keep `StudioLanguageProvider`.
- New files under `src/app/` only: hash/surface helper, `LabHome`, shared
  `SiteHeader` / `SiteFooter`. No `src/features/site/` package.
- `src/features/studio/components/StudioIdentity.tsx` — replace or wrap with
  the shared header so Studio matches Lab.
- `src/features/studio/studioBrand.ts` — constants only if a Lab label is
  needed. Do not rename `STUDIO_PRODUCT_NAME`.
- `src/app/styles.css` + `index.html` (theme-color, color-scheme, font links)
  to apply [`PETS-UI.md`](./PETS-UI.md).
- Fontsource (or equivalent) for Fraunces, Source Sans 3, IBM Plex Mono.
- `src/i18n/index.ts` + `src/i18n/zh.ts` for Lab / nav copy.
- `src/features/studio/__tests__/studio-brand-test.ts` and a **new** focused
  test for hash surfaces (`#/`, `#/studio`, unknown hash → Lab).
- Optional: mount Radar in the Lab hero via existing
  `createRadarPlayerDocument` / `mountRadarPlayer` or `AvatarThumb` of `radar`.
  Do not change player behavior.
- `radar.html` theme-color / background may move to `--habitat` **only if**
  `?bg=transparent` and the no-chrome contract stay.

### Do not

- Photo surface, create surfaces, or moving snapshot controls.
- `react-router`, history API paths, extra HTML entries.
- Edits under `src/features/avatar/geometry.ts`, `src/features/export/`
  (except tests that only read titles), playback, document parse.
- Changing `defaultStudioDocument.json` pets.
- Interaction sounds.

### Done when

- `#/` is a real Lab (hero + shelf + CTAs). `#/studio` is the current tool.
- Header is shared. Bible Strong is absent from chrome.
- Refresh on GitHub Pages-style `./` still loads (hash, not `/studio`).
- `radar.html` embed still works. `pnpm check` passes.

---

## Phase 2 — Photo as a first-class surface

**Goal:** Photographing a pet is an obvious flow. Settings live on Photo, not
in Export.

### Allow

- New Photo view under `src/app/` (or `src/features/studio/components/` if it
  must share the controller). Hash `#/photo`.
- `useStudioController` — expose existing snapshot state / `takePicture`;
  add `?pet=` selection if cheap. Do not new-file a second document.
- `StudioStage.tsx` shutter: jump to `#/photo` and/or keep capture. Tooltip
  must not be the only way to find settings.
- `StudioInspector.tsx` Export accordion: **remove** the Photo/snapshot
  section or replace it with a control that opens `#/photo`. Keep React /
  JS ZIP and JSON project.
- `src/i18n/*` for Photo chrome.
- Tests: existing `snapshot-exporter-test.ts` stay green; add a surface test
  that Photo hash shows background / size / format / capture.

### Do not

- New exporters, sizes, formats, or upload.
- Change `snapshotExporter.ts` behavior unless a bug blocks PNG/SVG parity
  for blob / mark (those paths already exist).
- Backend, share URLs, or watermarks.
- Create-path work (Phase 3).

### Done when

- Lab and header “Photo” open `#/photo`.
- Transparent / solid / linear / radial, 512 / 1024 / 2048, SVG / PNG are
  on that surface. Capture downloads locally.
- Export is packages + JSON, not a Photo burial ground.

---

## Phase 3 — Blob and Mark as create paths

**Goal:** Seed → pet and mark → pet are first-class. `styleFamily` stays an
implementation detail.

### Allow

- Surfaces `#/create/blob` and `#/create/ip` under `src/app/`.
- Reuse `createBlobAvatar`, `createIpLogoAvatar`, `generateIpLogoSvg`,
  `readSquareMarkFile`. Wire through the existing controller insert helpers.
- Lab CTAs and Studio Pets `+` cards open those hashes (dialogs may remain
  as thin wrappers).
- Product copy: Blob, Mark, pet. Gallery meta may say Classic / Blob / Mark.
- `src/i18n/*`. Tests for “seed creates a blob pet and activates it.”

### Do not

- New `styleFamily` values or a second blob renderer.
- Copy MetalForge / commercial shaders.
- Change blobatar MIT vendoring or IP-as-logo recipe scope.
- Cloud logo search. Auth. Engine edits.

### Done when

- A visitor can make a Blob from a seed without hunting a filter chip.
- A visitor can generate or import a square mark and get a pet in the shelf.
- Opening that pet in Studio / Photo works for classic, blob, and mark.

---

## Phase 4 — Studio bench + shelf language

**Goal:** Studio looks like the same product as Lab. The Pets shelf is a
gallery of creatures, not a style-family admin.

### Allow

- `StudioView`, `StudioInspector`, `StudioStage`, `AvatarDrawer`,
  `StudioModeTabs`, `StudioDialogs`, `src/app/styles.css`, `src/app/components/*`.
- Empty states, selection / hover / focus / destroy alignment with PETS-UI.
- Copy: Pets, not Avatars, in visitor-facing Studio chrome (ids in JSON stay).

### Do not

- New modes beyond Pets / Pose / Expressions / Animations / Export.
- Layout animation as the default interaction.
- Persistence or engine changes.

### Done when

- Habitat stage + parchment bench match Lab tokens.
- Shelf reads as pets. Destructive actions still confirm.

---

## Phase 5 — Optional interaction sounds

**Only after Phases 1–4.** Skip if it fights the Lab.

### Allow

- A small Web Audio helper (no MP3, no asset pipeline). Cue on create,
  capture, and destructive confirm — not on every hover.
- Respect `prefers-reduced-motion` and a one-click mute if added.
- Contract: in-memory oscillators / buffers only (cuelume-style). No CDN.

### Do not

- Sound on `radar.html` (embed stays silent unless wiip.club asks later).
- Autoplay before a user gesture.

---

## Explicitly never (unless a new docs PR says so)

- Rewriting the procedural engine or adding three.js.
- Accounts, multiplayer, comments, hosted pet CDN.
- Migrating off `bible-strong-avatar-studio-v2` without an ADR.
- Portuguese UI strings.
- Replacing AGPL with a different license.
- Shipping Phase 5 as part of Phase 1 “polish.”

## Composer checklist (copy onto each implementation PR)

- [ ] Phase number in the title (`Pets reform P1`, `P2`, …)
- [ ] Only paths in that phase’s Allow list
- [ ] Hard locks untouched
- [ ] i18n EN / FR / zh-CN synced
- [ ] Focused tests added or updated
- [ ] `pnpm check`
- [ ] `radar.html` embed contract still true
