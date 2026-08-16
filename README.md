# Radar · Bible Strong Avatar Lab fork

This repository is [Antonio Augusto](https://github.com/anttonioagst)'s public fork of [Bible Strong Avatar Lab](https://github.com/smontlouis/bible-strong-avatar-lab) (AGPL-3.0). It keeps the original Studio and procedural engine, and turns the project into the home of **Radar**, the AI-news mascot of the [WIP](https://wiip.club) community (`@radar`).

The geometry engine, playback, expressions, and Studio UI were written by [Stéphane Montlouis-Calixte](https://github.com/smontlouis) for Bible Strong Avatar Lab. This fork does not replace that engine. Significant changes in this fork are listed below.

Website of the upstream Studio: [avatars.bible-strong.app](https://avatars.bible-strong.app) · Upstream source: [smontlouis/bible-strong-avatar-lab](https://github.com/smontlouis/bible-strong-avatar-lab)

The application still runs entirely in the browser. Projects are stored locally and can be moved between browsers with JSON export/import; no account or backend is required.

## Significant changes in this fork

- **Radar is the default bundled avatar.** Opening the Studio on a fresh document selects Radar (`id: radar`) first. The character is a charcoal procedural sphere with amber eyes and a small dish node, matching Radar's charcoal / cream / bronze / amber palette without pasting the icon raster. Existing bundled avatars (Strobi, Freddy, Grok bot, and the rest) remain in the library.
- **Player-only page** at [`radar.html`](./radar.html) (`/radar.html` in dev and in the production build). It renders only Radar, playing the bundled idle loop with blink, with no Studio chrome. The page is sized for a feed or profile embed and can later be iframed into wiip.club. Use `?bg=transparent` for a transparent background; the default is a dark charcoal page. The player is client-only and does not use a backend.

## What you can do

- Create, rename, duplicate, reorder, and delete avatars.
- Build a body from a primary facial surface and additional 3D-inspired primitives.
- Adjust dimensions, roundness, position, local rotation, perspective, colors, and wireframe guides.
- Edit each eye independently or link their size, proportions, and position.
- Manipulate the avatar directly on the canvas with translation and rotation controls.
- Save, duplicate, reorder, and delete reusable expressions.
- Add temporary body and eye color overrides to an expression.
- Add subtle ambient movement to the body and eyes.
- Build animations from expression steps with custom hold times and transitions.
- Choose loop, play-once, or ping-pong playback and configure automatic blinking.
- Preview, play, pause, and stop animations inside the Studio.
- Take SVG or PNG snapshots with transparent, solid, linear-gradient, or radial-gradient backgrounds.
- Export a standalone React package or a framework-free JavaScript/HTML package.
- Export and import the complete Studio project as JSON.
- Use the interface in English, French, or Simplified Chinese.

## How the Studio works

The workspace has a live canvas on the left and an inspector on the right. Start by selecting an avatar, then move through the four main areas:

1. **Pose** — inspect a temporary pose or open the avatar editor to change the character's durable body, colors, and neutral eyes.
2. **Expressions** — create named visual presets. Expression eye values are relative to the avatar's neutral appearance, so the same behavior remains compatible with different body surfaces.
3. **Animations** — arrange expressions on a timeline, tune step duration and transition style, choose a playback mode, and configure blinking.
4. **Export** — choose animations to include, download an integration package, configure Photo Mode, or back up the full Studio project.

Changes to the Studio document are saved automatically in browser local storage. Unsaved edits inside an avatar, expression, or animation editor can still be cancelled. Use **Export → Studio project** to create a portable JSON backup before clearing browser data or moving to another device.

If a previous Studio document is already saved in local storage, that project stays authoritative. Clear site data or import a fresh project to see the bundled Radar default.

## Avatars and behavior libraries

An avatar owns its body geometry, colors, and neutral eye appearance. Expressions and animations initially come from the bundled base behavior library.

When an avatar's expressions or animations are edited for the first time, the Studio copies both collections into an avatar-specific behavior library. From that point on, behavior changes affect only that avatar. Duplicating an avatar also duplicates its custom behavior, and transferring an animation includes every expression it references.

This copy-on-write model lets multiple avatars share the defaults without accidental cross-avatar edits while keeping customized characters fully independent.

## Export formats

### React package

The React export is a local ZIP package containing a reusable TypeScript/React avatar component and the selected animations. It is intended for integration into React applications without shipping the Avatar Lab interface.

### JavaScript package

The JavaScript export is a self-contained ZIP project with an ES module, the selected avatar data and animations, and an HTML demo. It can be used without React.

### Photo Mode

Photo Mode exports the currently rendered avatar as SVG or PNG. You can choose the resolution and use a transparent, solid, linear-gradient, or radial-gradient background.

### Studio project

The JSON project file contains the complete current document: avatars, base and avatar-specific behavior libraries, expressions, animations, and playback selection. Importing a project replaces the current local document after confirmation.

## Getting started

### Requirements

- Node.js 22.12 or newer
- pnpm 10.34 (declared by the repository's `packageManager` field)

### Install and run

```bash
pnpm install
pnpm dev
```

Open the Studio at [http://localhost:5173](http://localhost:5173) and the Radar player at [http://localhost:5173/radar.html](http://localhost:5173/radar.html).

## Available commands

| Command             | Purpose                                                                           |
| ------------------- | --------------------------------------------------------------------------------- |
| `pnpm dev`          | Regenerate the standalone engine and start Vite in development mode.              |
| `pnpm typecheck`    | Run TypeScript in strict, no-emit mode.                                           |
| `pnpm test`         | Run the Vitest suite once.                                                        |
| `pnpm test:watch`   | Run Vitest in watch mode.                                                         |
| `pnpm engine`       | Regenerate the standalone engine used by exported packages.                       |
| `pnpm engine:check` | Verify that the committed generated engine is current.                            |
| `pnpm build`        | Regenerate the engine and create a production build in `dist/`.                   |
| `pnpm preview`      | Serve the production build locally.                                               |
| `pnpm format`       | Format the repository with Prettier.                                              |
| `pnpm check`        | Run engine freshness, formatting, type checking, tests, and the production build. |

## Validation

Before opening a pull request, run the complete local check:

```bash
pnpm check
```

The GitHub Actions workflow runs the same command on every push and pull request.

## Production build and deployment

Create the static production bundle:

```bash
pnpm build
```

The deployable site is written to `dist/`. Serve it locally before publishing:

```bash
pnpm preview
```

The application is a client-only Vite site with no server runtime or environment variables. The build uses relative asset paths, so the contents of `dist/` can be hosted at a domain root or a subpath, including a GitHub Pages project URL. Any static host that serves `index.html` can deploy it. The Radar player is emitted as `dist/radar.html`.

## Technical overview

- **React 19** coordinates the editor UI and durable application state.
- **TypeScript** is configured in strict mode.
- **Vite 8** provides the development server and production build, including a second HTML entry for the Radar player.
- **Motion** owns high-frequency rendering and playback values in the Studio.
- **SVG** renders the procedural avatar geometry.
- **Tailwind CSS 4** and reusable components under `src/components/ui/` provide the Studio interface layer.
- **Vitest** covers geometry, playback, editing, persistence, rendering, export, and Radar player document behavior.

Geometry, playback, document operations, and the standalone runtime remain framework-independent. React state stores durable editor data; Motion values handle frame-by-frame visual updates without forcing React renders. The Radar player mounts the same geometry and idle sequence without the Studio shell.

## Repository map

| Path                                     | Responsibility                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `src/app/`                               | Application shell, shared controls, utilities, and global styles.        |
| `src/components/ui/`                     | Reusable interface primitives.                                           |
| `src/features/avatar/`                   | Avatar identity, body, geometry, expressions, manipulation, and tests.   |
| `src/features/animation/`                | Animation sequences, framework-independent playback, and tests.          |
| `src/features/rendering/`                | Stable SVG scene, canvas preview, rotation gizmo, and rendering tests.   |
| `src/features/export/`                   | Packages, snapshots, ZIPs, standalone runtime, and export tests.         |
| `src/features/player/`                   | Radar player document, SVG mount, idle/blink playback, and tests.        |
| `src/features/studio/`                   | Studio controller, composed views, persistence, bundled data, and tests. |
| `src/player/`                            | Radar player HTML entry (no Studio chrome, no analytics).                |
| `src/i18n/`                              | Localized interface copy and translation tests.                          |
| `src/lib/`                               | Small shared utilities without product-domain ownership.                 |
| `scripts/generate-standalone-engine.mjs` | Standalone-engine generator.                                             |
| `docs/adr/`                              | Accepted architecture decisions.                                         |
| `legacy/`                                | Self-contained HTML prototypes that preceded the React application.      |
| `radar.html`                             | Player-only page for Radar idle playback and embeds.                     |

## Persistence and privacy

There is no remote backend in this repository. The complete Studio document and interface language preference are stored in the browser's local storage. Exported files are generated locally in the browser. Clearing site data removes the local project, so JSON export is the recommended backup mechanism.

The current project format is a pre-release schema. Compatibility is maintained with the current schema only unless an explicit migration is introduced.

## Contributing

Keep domain calculations outside React components, preserve the separation between durable React state and high-frequency Motion values, and add focused tests for domain changes. Do not edit `src/features/export/standaloneEngine.generated.ts` directly; run `pnpm engine` after changing its source modules.

English, French, and Simplified Chinese interface copy must stay synchronized across `src/i18n/index.ts` and `src/i18n/zh.ts`.

For the domain vocabulary, invariants, and architecture boundaries, read [CONTEXT.md](./CONTEXT.md).

## License

This fork remains licensed under the [GNU Affero General Public License v3.0](./LICENSE), the same license as Bible Strong Avatar Lab.

You may use, study, modify, and redistribute the project. If you distribute the application or a modified version, you must notably:

- make the corresponding source code available;
- preserve the copyright and license notices;
- distribute derivative work under the GNU AGPL v3.0;
- make the corresponding source available when a modified version is offered to users over a network, including as a hosted web service;
- document significant changes made to the project.

See the `LICENSE` file for the complete and legally authoritative terms.
