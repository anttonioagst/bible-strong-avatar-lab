# AntX Pets — Photo v2 (Composer law)

This file is the law for **Phase 6**. Composer implements it in a **separate**
PR. This documentation PR does not touch `src/`.

Read with [`PETS-REFORM.md`](./PETS-REFORM.md) Phase 6, [`PETS-SITE.md`](./PETS-SITE.md)
(IA), and the Photo addendum in [`PETS-UI.md`](./PETS-UI.md). Domain invariants
stay in [`CONTEXT.md`](../CONTEXT.md).

P1–P4 already shipped. `#/photo` exists. What shipped in P2 is a **thin dock**
(pet, background, size, format, Capture) around a raw `AvatarCanvas` /
`AvatarMarkPreview`. That is not Photo Mode. Phase 6 ports the **working**
upstream Photo Mode onto `#/photo`, paints the chrome with Antonio’s Grok
tokens, **and** closes the must-fix list (P2 Photo is buggy, not just
frameless). Do not invent a third Photo. Porting the frame without those
fixes is not done.

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

Studio shutter **opens** `#/photo?pet=` (must-fix #7). It does not capture.
Export accordion stays packages + JSON, with a link to Photo.

Blob and Mark go through the **same** frame + capture path. A mark preview
that ignores composition is a bug.

Porting `PhotoStageFrame` without closing the bugs below is **not** P6.

---

## Must fix (current `#/photo` — Composer closes all of these)

Confirmed on this fork’s P2 Photo. Line numbers are `main` at plan time.
Do not “port the frame and ship.” Every item has a done-when.

### 1. MotionValues on a plain `<section>` — classic stage can look empty

`PhotoView.tsx` (~68–76) sets `--avatar-body-color` / `--avatar-eye-color` to
`renderedColors.body` / `.eyes` (MotionValues) on a plain `<section>`.
Studio uses `motion.section` so those vars actually bind. On Photo the CSS
fills drop; the classic pet can render empty. Capture still works because
`serializeAvatarSnapshot` calls `.get()`.

**Fix:** wrap the Photo stage (or the `PhotoStageFrame` host) in
`motion.section` / `motion.div` the same way `StudioStage` does. Classic
must be visible on screen, not only in the downloaded file.

### 2. Blob / Mark pose is `expressions[0]`, not the live pose

`PhotoView.tsx` stage (~107–114) and dock preview (~142–147) pass
`expression={expressions[0] ?? defaultExpression}`. Classic correctly uses
`canvasExpression`. `currentSnapshotSvg` → `resolveAvatarMarkSvg` →
`renderBlobatarSvg(seed)` bakes **no** expression. Pose on a blob/mark is
dead; Capture of blob SVG has no expression.

**Fix:** preview **and** capture use `canvasExpression` (or
`blobatarExpressionForStudio(canvasExpression)`). `renderBlobatarSvg` /
`resolveAvatarMarkSvg` may take an optional expression; default stays
today’s no-pose SVG for Lab / create. Pose tool on Photo must change what
you see and what you download.

### 3. Pet picker does not write `?pet=`

Select only calls `activateAvatar`. `applyPetFromHash` is read-only
(`useStudioController` ~1786–1796). `SiteHeader` Photo nav is bare
`#/photo`. Refresh after changing pet restores the stale query (or the
document’s last active pet vs the URL).

**Fix:** add `photoPetHash(petId)` next to `studioPetHash` in
`src/app/surface.ts`. Photo Select writes `#/photo?pet=<id>` then
activates. Header Photo link is `photoPetHash(activeAvatarId)` (pass the
id into `SiteHeader` — smallest prop). `applyPetFromHash` stays the
reader. Refresh after a picker change keeps that pet.

### 4. Blob “Transparent / Uni / dégradé” is a lie

`AvatarMarkPreview` and `renderBlobatarSvg` hardcode `background="squircle"`.
`currentSnapshotSvg` wraps that markup. Transparent still has the squircle
plate. Solid / linear / radial stack a second fill on top of it.

**Fix (Photo only):** optional `background` on `AvatarMarkPreview` and
`renderBlobatarSvg`, default `'squircle'` so Lab / Studio / create do not
change. On Photo, blob preview + capture use **no** baked squircle;
`PhotoStageFrame` / `serializeMarkSnapshot` paint the chosen snapshot
background (checkerboard in the live frame when transparent). Mark
(`ip-logo`) keeps its own artwork field; do not double-paint.

Do not change `createBlobAvatar` / blobatar recipe / create surfaces.

### 5. Stage never shows the chosen snapshot background

`.photo-stage` is always `--habitat`. Only the 96px dock
`SnapshotPreview` reflects bg, and that preview is `display: none` under
900px.

**Fix:** the square `PhotoStageFrame` **is** the background preview
(upstream already does this: solid / linear / radial / checkerboard).
Do not rely on the dock thumbnail. After P6 the dock preview is optional
chrome, not the only place the bg is true.

### 6. `downloadSnapshotPng` silent fail + killed alpha

`downloadSnapshotPng` (~1701–1725): `Image.onerror` only revokes the
object URL. `takePicture` always increments `photoFlash` first. SVG→
`Image`→canvas often flattens transparent pixels to an opaque plate.

**Fix:**

- Flash may stay, but a failed rasterize must **not** be silent: fall
  back to SVG download or skip the flash until `downloadBlob` succeeds.
- Transparent PNG must keep an alpha channel (no white/black plate). Do
  not `fillRect` an opaque default. If the `Image` path cannot preserve
  alpha, use a raster path that can. Classic, blob, and mark.

### 7. Studio shutter still `takePicture`s with in-memory defaults

`StudioStage.tsx` shutter `onClick={takePicture}` (~128–136). Settings
already links to `#/photo?pet=`. The shutter captures whatever session
defaults are (transparent / 1024 / png, no framing) and skips Photo.

**Fix:** shutter **opens** `#/photo?pet=<activeId>` (`photoPetHash`). It
does **not** call `takePicture`. Capture lives on Photo. Do not mount
`PhotoStageFrame` in Studio.

### 8. Tests do not prove Photo works

`photo-surface-test.ts` only checks hashes and i18n keys. No PhotoView
mount, no `takePicture` / PNG / `?pet=` write, no frame / bg / pose
contract.

**Fix:**

- Port upstream `snapshot-composition-test.ts` + `snapshot-palette-test.ts`
  wholesale.
- Update `snapshot-exporter-test.ts` for clip + transform + mark/blob
  composition; transparent blob SVG must **not** contain the squircle
  plate when Photo asks for transparent; pose/expression must appear in
  blob capture when `canvasExpression` is set.
- Extend `photo-surface-test.ts` and/or add `photo-view-test.ts`:
  - `photoPetHash` write + picker updates the hash
  - Pose / Frame / cadrage copy in EN + zh-CN
  - Frame / bg / pose are **real**: mount PhotoView (or the extracted
    stage + hash writer) with a stub controller. `@testing-library/react`
    is allowed for this test only if needed.
  - PNG path: failed `Image` is not silent; transparent canvas is not
    pre-filled opaque (extract `rasterizeSnapshotPng` / error handling
    if that keeps the test off the DOM).

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
expression. Preview and capture read `canvasExpression` (must-fix #2). Do
not extract the whole Studio inspector. `PoseControls` does not exist in
this fork; do not invent it.

**Frame:** `PhotoStageFrame` interaction + numeric X / Y / Zoom% /
corner-radius (reuse `NumericField`). Random palette button from upstream
is allowed (`randomSnapshotPalette`).

Pet picker writes `photoPetHash` (must-fix #3). `?pet=` is read and written.

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

PNG rasterizes that SVG through the **fixed** `downloadSnapshotPng` path
(must-fix #6). Do not add a second renderer. Blob capture must omit the
baked squircle when Photo background is transparent / solid / linear /
radial (must-fix #4) and must include the mapped blobatar expression from
`canvasExpression` (must-fix #2).

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
4. Must-fix #4 / #2 on the mark/blob SVG path: optional background +
   expression on `renderBlobatarSvg` / `AvatarMarkPreview` /
   `resolveAvatarMarkSvg`. Defaults keep today’s Lab/create behavior.
5. Add `PhotoTool` to `studio-utils.ts` and `photoPetHash` to `surface.ts`.
   Do not add `Mode = 'photo'`.
6. Controller: session `snapshotComposition`, `photoTool`,
   `photoPanelSections`; pass composition + expression into SVG + pixel
   capture; port their pixel `roundRect` clip + translate/scale; fix
   `downloadSnapshotPng` (must-fix #6).
7. Copy `PhotoStageFrame.tsx` wholesale.
8. Rebuild `PhotoView`: `motion` host (must-fix #1); frame wraps classic
   **and** mark/blob; frame **is** the bg (must-fix #5); Pose / Frame
   toolbar; `canvasExpression` on blob/mark; pet picker writes
   `photoPetHash`; `SiteHeader variant="grok"` + Photo href with pet;
   one filled Capture pill.
9. Studio shutter → `photoPetHash` only (must-fix #7). No `takePicture`.
10. Grok tokens on `.photo-root` / `.site-header-grok`. Copy frame CSS
    selectors, restyle only. Optional Geist fontsource scoped to Photo.
11. i18n EN / FR / zh-CN.
12. Tests in must-fix #8 + below. `pnpm typecheck` + touched tests while
    working; `pnpm check` before commit.

---

## Files Composer may touch

### New (copy)

- `src/features/studio/components/PhotoStageFrame.tsx`
- `src/features/export/snapshotComposition.ts`
- `src/features/export/snapshotPalette.ts`
- `src/features/export/__tests__/snapshot-composition-test.ts`
- `src/features/export/__tests__/snapshot-palette-test.ts`

### Existing

- `src/app/PhotoView.tsx` — framed Photo Mode + all PhotoView must-fixes.
- `src/app/SiteHeader.tsx` — `'grok'` variant + Photo href `photoPetHash`.
- `src/app/surface.ts` — add `photoPetHash`.
- `src/app/styles.css` — Photo + grok header + frame selectors. No Lab
  restyle.
- `src/app/studio-utils.ts` — `PhotoTool` only.
- `src/app/__tests__/photo-surface-test.ts` and/or
  `src/app/__tests__/photo-view-test.ts` — must-fix #8 (not hash/i18n only).
- `src/features/export/snapshotExporter.ts` — composition + mark wrap.
- `src/features/export/__tests__/snapshot-exporter-test.ts` — update
  transparent-rect assertion; add clip / transform / mark composition cases.
- `src/features/studio/useStudioController.ts` — session Photo state +
  capture plumbing. No document schema change.
- `src/features/studio/components/StudioStage.tsx` — shutter **opens**
  `photoPetHash(activeId)`. Do not call `takePicture`. Do not mount
  `PhotoStageFrame` in Studio. Do not add `mode === 'photo'`.
- `src/features/avatar/components/AvatarMarkPreview.tsx` — optional
  `background` (default `'squircle'`).
- `src/features/avatar/blobatarAdapter.ts` — optional `background` +
  expression on `renderBlobatarSvg` only. Default stays squircle / no pose.
- `src/features/avatar/avatarMark.ts` — `resolveAvatarMarkSvg` may take
  Photo capture options (background, expression). Create paths unchanged.
- `src/features/avatar/__tests__/avatar-style-test.ts` — keep default
  `renderBlobatarSvg` callers green; add Photo bg/expression cases if
  the helper grows.
- `src/features/studio/components/StudioInspector.tsx` — Export stays
  packages + JSON + link to `#/photo`. No Photo accordion in Studio.
- `src/i18n/index.ts` + `src/i18n/zh.ts` + `src/i18n/__tests__/i18n-test.ts`
- `src/app/components/common.tsx` / `controls.tsx` — only if
  `SnapshotPreview` must honor composition. Prefer the live frame as the
  preview.
- `src/main.tsx` + `package.json` + `pnpm-lock.yaml` — Geist for Photo
  only. `@testing-library/react` only if a PhotoView mount test needs it.
- `src/app/__tests__/hash-surface-test.ts` — `photoPetHash` if added.

### Optional tiny reuse

- `src/features/studio/components/ExpressionCard` (or equivalent already
  used in the inspector) for the Pose grid. Import; do not duplicate.

---

## Files Composer must not touch

- `src/features/avatar/geometry.ts`
- `src/features/export/standaloneEngine.generated.ts` (no `pnpm engine`
  unless a listed source of the generator actually changes — it should not)
- `createBlobAvatar` / `createIpLogoAvatar` / `generateIpLogoSvg` /
  `readSquareMarkFile` / blobatar **recipe** (seed → pet). Optional
  background / expression args on the existing adapter are allowed
  (must-fix #2 / #4).
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
- Classic stage is **visible** (`motion` host; must-fix #1).
- Frame tool: drag pan, wheel zoom (page does not scroll), keyboard nudge.
- Pose tool: picking an expression updates the framed pet **and** the
  file for classic, blob, and mark (must-fix #2).
- The live frame shows the chosen snapshot background (must-fix #5).
  Blob transparent has no squircle plate (must-fix #4).
- Classic, blob, and mark all sit inside `PhotoStageFrame`.
- Background / 512 / 1024 / 2048 / SVG / PNG / Capture work as labeled.
- Capture SVG contains `snapshot-frame-clip` and
  `translate(x y) scale(s)` matching session composition.
- Mark / blob capture uses that same transform, not an unframed embed.
- PNG matches the framed picture, keeps transparent alpha, and does not
  fail silently (must-fix #6).
- Capture is the only filled white pill. Header is `grok` (no habitat amber).
- Lab / Studio look unchanged. Studio Export still links to Photo.
- Pet picker writes `?pet=`; header Photo includes the active pet;
  refresh keeps it (must-fix #3).
- Studio shutter opens Photo settings; it does not capture (must-fix #7).
- Flash may stay. Download is local.

Tests + check:

```bash
pnpm test -- src/features/export/__tests__/snapshot-composition-test.ts
pnpm test -- src/features/export/__tests__/snapshot-palette-test.ts
pnpm test -- src/features/export/__tests__/snapshot-exporter-test.ts
pnpm test -- src/app/__tests__/photo-surface-test.ts
pnpm test -- src/i18n/__tests__/i18n-test.ts
pnpm check
```

`photo-surface-test.ts` / `photo-view-test.ts` must keep hash / `?pet=`
read tests **and** close must-fix #8 (write hash, mount or stub that
proves frame / bg / pose, PNG error/alpha). Pose / Frame / cadrage
strings exist in EN and zh-CN.

`snapshot-exporter-test.ts` must assert composition clip + transform for
classic and mark, blob-without-squircle when transparent, expression in
blob capture, and keep filename / gradient / pixel-SVG cases green.

---

## Out of scope (will not ship in P6)

- Hosted gallery, share URLs, watermarks, auth, backend
- Geometry / engine rewrite
- Renaming the persistence key
- Phase 5 sounds
- Restyling Lab or Studio to Grok
- Making Photo only a Studio inspector mode
- A second Photo implementation “inspired by” the upstream one
