# AntX Pets — Photo v2 (Composer law)

This file is the law for **Phase 6**. Composer implements it in a **separate**
PR. This documentation PR does not touch `src/`.

Read with [`PETS-REFORM.md`](./PETS-REFORM.md) Phase 6, [`PETS-SITE.md`](./PETS-SITE.md)
(IA), and the Photo addendum in [`PETS-UI.md`](./PETS-UI.md). Domain invariants
stay in [`CONTEXT.md`](../CONTEXT.md).

P1–P4 already shipped. `#/photo` exists. What shipped in P2 is a **thin dock**
(pet, background, size, format, Capture) around a raw `AvatarCanvas` /
`AvatarMarkPreview`. That is not Photo Mode. Phase 6 ports the **working**
upstream Photo Mode onto `#/photo` and paints the chrome with Antonio’s Grok
tokens. Do not invent a third Photo.

---

## Product fact (do not re-derive)

Photographing a pet is a first-class hash surface. Visitors must not hunt an
inspector tab.

On `#/photo` the visitor gets the **smontlouis Photo Mode**:

1. Square live frame of the active pet (classic / blob / mark).
2. Tools: **Pose** (pick expression / still pose from existing expression
   state) and **Frame** (pan, wheel zoom, corner radius). Same `PhotoTool`.
3. Background: transparent / solid / linear / radial + colors.
4. Size 512 / 1024 / 2048. Format SVG / PNG.
5. Capture downloads locally (`takePicture` / `snapshotFileName`). Flash may
   stay.
6. Pet picker stays. `?pet=` hash query stays.

Studio shutter may still jump to `#/photo`. Export accordion stays packages +
JSON, with a link to Photo.

Blob and Mark go through the **same** frame + capture path. A mark preview
that ignores composition is a bug.

---

## Copy 1:1 from smontlouis

Repo: [smontlouis/bible-strong-avatar-lab](https://github.com/smontlouis/bible-strong-avatar-lab)
(AGPL-3.0 — we are already this fork). Read **source on their `main`**, not
`https://bible-strong-avatar-lab.vercel.app` (stale Aug 15 build).

Their Photo Mode is a Studio `Mode = '... | 'photo'`. Ours is `#/photo`. Port
the **behavior and math**, not the Studio-mode IA.

Pinned from their `main` at plan time (fetch again if `main` moved; do not
redesign if it did):

| File | SHA | Copy rule |
| ---- | --- | --------- |
| `src/features/studio/components/PhotoStageFrame.tsx` | `2130fdd88548c3aab34d1357e09e71fed06d38df` | **Wholesale.** Same path. Same drag / wheel / keyboard / Motion values. |
| `src/features/export/snapshotComposition.ts` | `6b3ea4ea7f69e5520b42466a46e2264c411eac08` | **Wholesale.** |
| `src/features/export/snapshotPalette.ts` | `6681b78dba07b0b685af39f3b79edab54451ed44` | **Wholesale.** |
| `src/features/export/__tests__/snapshot-composition-test.ts` | `bc4506423fe07f4a5c574248d35ac8a83a109104` | **Wholesale.** |
| `src/features/export/__tests__/snapshot-palette-test.ts` | `8ae388fc7f96c816c254c52213315f18e802f118` | **Wholesale.** |

### Capture math (do not redesign)

`SnapshotComposition = { x, y, scale, cornerRadius }`.

```ts
export const defaultSnapshotComposition = { x: 0, y: 0, scale: 1, cornerRadius: 0 }

normalizeSnapshotComposition clamps:
  x, y          ∈ [-180, 180]
  scale         ∈ [0.4, 3]
  cornerRadius  ∈ [0, 50]

snapshotCornerRadius(r) = normalize(...).cornerRadius * 3
// 18 → 54, 50 → 150  (300-unit viewBox)
```

`PhotoStageFrame` live preview (copy as-is):

- Motion `x` / `y` / `scale`; CSS `x: ${value / 3}%`.
- Drag: `viewBoxPerPixel = 300 / bounds.width`.
- Wheel: `scale * exp(-deltaY * 0.0015)`, commit after 120 ms.
- Keys: arrows nudge 2 (Shift 10); `+`/`=` / `-` scale ±0.05.
- Background preview: solid / `linear-gradient(135deg, …)` /
  `radial-gradient(circle at 50% 42%, …)` / checkerboard when transparent.
- `--photo-corner-radius: ${cornerRadius}%`.

`serializeAvatarSnapshot` (port into our exporter; they do not have Mark):

```text
defs:
  gradients
  clipPath#snapshot-frame-clip
    rect x="-150" y="-150" width="300" height="300"
         rx={snapshotCornerRadius(cornerRadius)}
  clipPath#snapshot-head-clip  (existing)
<g clip-path="url(#snapshot-frame-clip)">
  background rect (if not transparent)
  <g transform="translate(x y) scale(s)">
    <g transform="translate(offsetX offsetY)">…existing body…</g>
  </g>
</g>
```

Pixel PNG path (their `createPixelSnapshotCanvas`): `roundRect` clip at
`(size * cornerRadius) / 100`, then

```text
translate(size/2 + (x/300)*size, size/2 + (y/300)*size)
scale(s, s)
drawImage(avatar, -size/2, -size/2, size, size)
```

Do not invent a second composition space. PNG must match the live frame.

### CSS selectors to copy, then restyle

From their `src/app/styles.css` (search `.photo-live-frame`):

- `.photo-live-frame` / `.is-transparent` / `.is-frame-tool`
- `.photo-live-avatar` (+ `.avatar-wrap` fill)
- `.photo-frame-interaction` (+ `:focus-visible`, `[data-dragging]`)
- `.photo-tool-bar` (layout only)

Keep interaction geometry (square `aspect-ratio: 1`,
`width: min(68vh, 68vw, 640px)`, grab cursor, no page scroll on wheel).
**Restyle** colors, radius chrome, and shadows to Grok tokens. The square is
the **picture**, not a card. **No `box-shadow`.** Checkerboard tiles may use
`#0A0A0A` / `#1A1C20`. Focus ring: `pill-border` / ink, not their blue.

### Controller session state (match them)

Their `useStudioController` (confirmed: `useState` only, not in the document):

```ts
snapshotComposition = { ...defaultSnapshotComposition, cornerRadius: 18 }
photoTool: PhotoTool = 'frame'
photoPanelSections: PhotoTool[] = []
```

`takePicture` / `currentSnapshotSvg` pass `composition: snapshotComposition`.
Reset framing sets `{ x: 0, y: 0, scale: 1 }` and **keeps** `cornerRadius`.
`openPhotoMode` sets tool `'frame'` and clears panel sections — on our fork
that is “navigated to `#/photo`”, not `setMode('photo')`.

### i18n keys to port (FR source, EN + zh-CN)

Copy meaning from their `src/i18n/index.ts` + `zh.ts`. Do not add Portuguese.

Required new / reused keys:

- `Cadrage` → Framing / 取景
- `Outils du mode photo`
- `Orientation, regard, couleurs et perspective.`
- `Position, zoom et coins du cadre photo.`
- `Recentrer le cadrage`
- `Réinitialiser la pose et le cadrage`
- `Choisis l’expression visible sur la photo.`
- `Utilise Pose pour orienter l’avatar et Cadrage pour le déplacer ou le zoomer.`
- `Cadre du logo. Glisse pour déplacer l’avatar et utilise la molette pour zoomer.`
- `Glisse l’avatar pour le placer. La molette zoome sans faire défiler la page.`
- `Coins arrondis`
- `Position X` / `Position Y` / `Zoom` (wrap in `t()`, unlike their raw labels)

Existing keys stay: `Mode photo`, `Prendre une photo`, `Capturer`,
`Arrière-plan`, `Définition du mode photo`, `Format d’export du mode photo`,
`Choisir un pet`, `Transparent` / `Uni` / `Dégradé linéaire` /
`Dégradé radial`.

---

## s1dashu — intent only

Repo: [s1dashu/ip-as-logo-skill](https://github.com/s1dashu/ip-as-logo-skill)
(MIT). It is `SKILL.md` + README + a wall image. **No Photo component, no
exporter, no site code.**

Take the **framing intent** (this is what `PhotoStageFrame` is for):

- Square. Logo-first. Opaque mark artwork (already true of Mark pets).
- Close crop (~82–90%). Subject peeks from a lower corner.
- Three semantic colors when the pet is a Mark (2 IP + background) — already
  decided at create time. Photo must not add a fourth paint layer.
- Reject illustration-level scenes. Photo frames one pet. No scenery.

Do **not** invent a renderer, logo CDN, skill runner, or contact-sheet UI.
Do **not** change `createIpLogoAvatar` / blobatar / `generateIpLogoSvg`.

Mark Photo default background stays **transparent** so the mark’s own opaque
field shows. Do not double-paint a second solid behind a full-bleed mark.

---

## Locked defaults (no open questions)

### 1. Composition is session state

Match upstream. `useState` on the controller. **Not** written to
`bible-strong-avatar-studio-v2`. **Not** an additive document field.

Snapshot background / colors / size / format stay session state as today.

### 2. Default composition numbers

Session init (classic + blob), same as their controller:

```ts
{ x: 0, y: 0, scale: 1, cornerRadius: 18 }
```

Mark (`styleFamily === 'ip-logo'`) starts tighter so the subject peeks from
the **lower-right** at a close crop (~83% window of a full-bleed mark):

```ts
export const defaultMarkSnapshotComposition: SnapshotComposition = {
  x: 36,   // 36/3 = 12% toward the right
  y: 48,   // 48/3 = 16% toward the bottom
  scale: 1.2,
  cornerRadius: 18,
}
```

`36` / `48` / `1.2` sit inside the upstream clamps. Reset-frame on a Mark
restores `{ x: 36, y: 48, scale: 1.2 }` and keeps `cornerRadius`. Reset on
classic / blob restores `{ x: 0, y: 0, scale: 1 }` and keeps `cornerRadius`.

Switching the active pet on Photo applies that pet’s **family default**.

### 3. Header variant name

`SiteHeader` `variant` becomes `'habitat' | 'bench' | 'grok'`.

`PhotoView` passes `variant="grok"`. CSS class `site-header-grok`. Smallest
header change. Do not restyle Lab (`habitat`) or Studio (`bench` / habitat).

### 4. Do not add Studio `Mode = 'photo'`

`src/app/studio-utils.ts` today:

```ts
export type Mode = 'avatars' | 'manual' | 'expressions' | 'states' | 'export'
```

Add only:

```ts
export type PhotoTool = 'pose' | 'frame'
```

Photo stays `#/photo`. Adding `'photo'` to `Mode` would undo P1.

### 5. Photo tool default

`photoTool = 'frame'` (match upstream `openPhotoMode`).

### 6. Type on Photo chrome

Geist + Geist Mono, weight **400 only**. Do not add Inter.

They are **not** in `package.json` today (Lab uses Fraunces / Source Sans 3 /
IBM Plex Mono). Composer may add `@fontsource-variable/geist` and
`@fontsource/geist-mono` (400) and import them for `.photo-root` only.
Lab / Studio fontsource stays.

---

## Grok tokens (Photo surface only)

Antonio’s personal DESIGN.md, applied here. These **override** PETS-UI
habitat / parchment **on `#/photo` only**. Not Estel. Not Glide. Not Wiipo
coral chrome.

| Token | Value | Use |
| ----- | ----- | --- |
| canvas | `#0A0A0A` | `.photo-root`, stage well |
| canvas-soft | `#1A1C20` | elevated chrome, checkerboard pair |
| canvas-card | `#191919` | dock / tool panels |
| hairline | `#212327` | rules |
| pill-border | `rgba(255,255,255,0.25)` | outline pills, frame outline |
| ink | `#FFFFFF` | titles, Capture label |
| body | `#DADBDF` | controls |
| mute | `#7D8187` | meta (`512 × 512 · PNG`) |
| CTA | `#FFFFFF` fill, `#0A0A0A` label | **one** filled control: Capture |

Rules:

- No `box-shadow`. Weight 400 only.
- Pill radius `9999` on standalone controls. Card radius `8`.
- Press scale `0.97`. No hover lift.
- Capture is the only filled pill. Pose / Frame / selects are outline or
  quiet.
- Stage square = the picture. Checkerboard when transparent.

CSS variables live under `.photo-root` (and `.site-header-grok`). Do not
change `--habitat` / `--parchment` globals. Do not add a second theme file.

---

## What `#/photo` looks like after P6

```
SiteHeader variant=grok
┌─────────────────────────────────────────┐
│  [ square PhotoStageFrame ]             │
│    classic → AvatarCanvas               │
│    blob/mark → AvatarMarkPreview        │
│    (both are children of the frame)     │
│  [ Pose | Frame | reset ]               │
└─────────────────────────────────────────┘
dock: pet · Pose/Frame panel · bg · size · format · Capture
```

**Pose:** expression grid from the active pet’s library. Selecting one calls
existing `transitionToExpression` / `updateImmediate`. Still pose = that
expression. Do not extract the whole Studio inspector. `PoseControls` does
not exist in this fork; do not invent it.

**Frame:** `PhotoStageFrame` interaction + numeric X / Y / Zoom% /
corner-radius (reuse `NumericField`). Random palette button from upstream
is allowed (`randomSnapshotPalette`).

Pet picker and `?pet=` stay.

---

## Mark / blob capture (fork-only extension)

Upstream `snapshotExporter.ts` has **no** `serializeMarkSnapshot`. Ours does.
Do not drop it. Apply the **same** clip + `translate(x y) scale(s)`:

1. Normalize `options.composition ??` the family default.
2. Outer SVG `viewBox="-150 -150 300 300"` at `options.size`.
3. `clipPath#snapshot-frame-clip` + optional background rect (same markup as
   classic).
4. Nested mark SVG at `x="-150" y="-150" width="300" height="300"` so the
   mark’s own `viewBox` is preserved, inside
   `<g transform="translate(x y) scale(s)">`.

PNG of a mark rasterizes that SVG (existing `downloadSnapshotPng` path).
Do not add a second rasterizer.

When composition is the identity `{0,0,1,0}`, a full-bleed mark must still
fill the square. `cornerRadius: 18` is the Photo session default — exports
are allowed to have rounded clip. Tests must not assume “no `<rect>`”
anymore: the clip path uses a rect. Assert “no background fill rect” for
transparent instead.

---

## Implementation order

1. Copy `snapshotComposition.ts` + composition tests wholesale.
2. Copy `snapshotPalette.ts` + palette tests wholesale.
3. Patch `snapshotExporter.ts`: `options.composition`, classic clip +
   transform (their markup). Extend `serializeMarkSnapshot` as above. Keep
   `serializePixelSnapshot` / `snapshotFileName`.
4. Add `PhotoTool` to `studio-utils.ts`. Do not add `Mode = 'photo'`.
5. Controller: session `snapshotComposition`, `photoTool`,
   `photoPanelSections`, `setSnapshotComposition` /
   `updateSnapshotComposition`; pass composition into SVG + pixel capture;
   port their pixel `roundRect` clip + translate/scale.
6. Copy `PhotoStageFrame.tsx` wholesale.
7. Rebuild `PhotoView`: frame wraps classic **and** mark/blob preview;
   Pose / Frame toolbar; dock controls; `SiteHeader variant="grok"`;
   one filled Capture pill.
8. Grok tokens on `.photo-root` / `.site-header-grok`. Copy frame CSS
   selectors, restyle only. Optional Geist fontsource scoped to Photo.
9. i18n EN / FR / zh-CN.
10. Tests listed below. `pnpm typecheck` + touched tests while working;
    `pnpm check` before commit.

---

## Files Composer may touch

### New (copy)

- `src/features/studio/components/PhotoStageFrame.tsx`
- `src/features/export/snapshotComposition.ts`
- `src/features/export/snapshotPalette.ts`
- `src/features/export/__tests__/snapshot-composition-test.ts`
- `src/features/export/__tests__/snapshot-palette-test.ts`

### Existing

- `src/app/PhotoView.tsx` — replace thin dock stage with framed Photo Mode.
- `src/app/SiteHeader.tsx` — add `'grok'` variant only.
- `src/app/styles.css` — Photo + grok header + frame selectors. No Lab
  restyle.
- `src/app/studio-utils.ts` — `PhotoTool` only.
- `src/app/__tests__/photo-surface-test.ts` — Pose / Frame / frame copy.
- `src/features/export/snapshotExporter.ts` — composition + mark wrap.
- `src/features/export/__tests__/snapshot-exporter-test.ts` — update
  transparent-rect assertion; add clip / transform / mark composition cases.
- `src/features/studio/useStudioController.ts` — session Photo state +
  capture plumbing. No document schema change.
- `src/features/studio/components/StudioStage.tsx` — shutter may keep jump
  to `#/photo` and/or capture with **current session** composition. Do not
  mount `PhotoStageFrame` inside Studio. Do not add `mode === 'photo'`.
- `src/features/studio/components/StudioInspector.tsx` — Export stays
  packages + JSON + link to `#/photo`. No Photo accordion in Studio.
- `src/i18n/index.ts` + `src/i18n/zh.ts` + `src/i18n/__tests__/i18n-test.ts`
- `src/app/components/common.tsx` / `controls.tsx` — only if
  `SnapshotPreview` must honor composition. Prefer the live frame as the
  preview.
- `src/main.tsx` + `package.json` + `pnpm-lock.yaml` — Geist for Photo
  only.

### Optional tiny reuse

- `src/features/studio/components/ExpressionCard` (or equivalent already
  used in the inspector) for the Pose grid. Import; do not duplicate.

---

## Files Composer must not touch

- `src/features/avatar/geometry.ts`
- `src/features/export/standaloneEngine.generated.ts` (no `pnpm engine`
  unless a listed source of the generator actually changes — it should not)
- `src/features/avatar/blobatar*` / `createBlobAvatar` / `createIpLogoAvatar`
  / `generateIpLogoSvg` / `readSquareMarkFile`
- `src/features/studio/defaultStudioDocument.json`
- Persistence key / parse / migrate
- `src/app/LabHome.tsx`, create views, `radar.html`, `src/player/`
- Lab / Studio token block in `styles.css` except unavoidable shared
  selectors (avoid)
- New Vite app, router, backend, auth, share URLs, watermarks, gallery
- Phase 5 sounds
- Portuguese strings
- This docs set, except if a fact is wrong — prefer a follow-up docs PR

---

## What does not change

| Lock | Meaning |
| ---- | ------- |
| Persistence key | `bible-strong-avatar-studio-v2` |
| Schema | Additive only. Composition is **not** persisted. |
| Engine | `geometry.ts` + generated engine stay |
| AGPL | README, LICENSE, Lab footer |
| `radar.html` | Embed contract |
| URLs | Hash only. `base: './'`. No react-router |
| i18n | EN / FR / zh-CN. No PT-BR |
| UI kit | `src/components/ui/`. No `useMemo` / `useCallback` / `memo` |
| P1 IA | `#/photo` stays first-class. Studio modes stay Pets / Pose / Expressions / Animations / Export |
| Lab / Studio look | Habitat / parchment until a later phase |
| Create paths | Blob / Mark already exist. Photo only frames them |

---

## Done when

Behavior:

- `#/photo` shows a square live frame (not a raw full-bleed canvas).
- Frame tool: drag pan, wheel zoom (page does not scroll), keyboard nudge.
- Pose tool: picking an expression updates the framed pet.
- Classic, blob, and mark all sit inside `PhotoStageFrame`.
- Background / 512 / 1024 / 2048 / SVG / PNG / Capture still work.
- Capture SVG contains `snapshot-frame-clip` and
  `translate(x y) scale(s)` matching session composition.
- Mark / blob capture uses that same transform, not an unframed embed.
- PNG matches the framed picture (including corner radius clip).
- Capture is the only filled white pill. Header is `grok` (no habitat amber).
- Lab / Studio look unchanged. Studio Export still links to Photo.
- `?pet=` still selects. Flash may stay. Download is local.

Tests + check:

```bash
pnpm test -- src/features/export/__tests__/snapshot-composition-test.ts
pnpm test -- src/features/export/__tests__/snapshot-palette-test.ts
pnpm test -- src/features/export/__tests__/snapshot-exporter-test.ts
pnpm test -- src/app/__tests__/photo-surface-test.ts
pnpm test -- src/i18n/__tests__/i18n-test.ts
pnpm check
```

`photo-surface-test.ts` must keep hash / `?pet=` / existing chrome keys and
assert Pose / Frame / cadrage strings exist in EN and zh-CN.

`snapshot-exporter-test.ts` must assert composition clip + transform for
classic and mark, and keep filename / gradient / pixel-SVG cases green.

---

## Out of scope (will not ship in P6)

- Hosted gallery, share URLs, watermarks, auth, backend
- Geometry / engine rewrite
- Renaming the persistence key
- Phase 5 sounds
- Restyling Lab or Studio to Grok
- Making Photo only a Studio inspector mode
- A second Photo implementation “inspired by” the upstream one
