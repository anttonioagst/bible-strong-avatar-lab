# AGENTS.md

## Project

AntX Pets is a standalone React 19 + Vite 8 application for procedural SVG avatars (AGPL-3.0 fork of Bible Strong Avatar Lab).
Read `CONTEXT.md` before changing behavior or persistence semantics.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## Engineering rules

- Use TypeScript in strict mode.
- Keep geometry, playback and document operations framework-independent.
- Preserve the split between durable React state and high-frequency Motion values.
- Do not use `useMemo`, `useCallback` or `memo`; React Compiler handles memoization.
- Add or update focused tests for domain behavior.
- Run `pnpm typecheck` and the relevant test file while working, then `pnpm check` before committing.
- `src/features/export/standaloneEngine.generated.ts` is generated. Update it with `pnpm engine`, never by hand.
- Keep English, French and Simplified Chinese copy synchronized across `src/i18n/index.ts` and `src/i18n/zh.ts`.
- Preserve project JSON compatibility only with the current pre-release schema unless a migration is explicitly requested.

## UI conventions

- Reuse components under `src/components/ui/` rather than adding one-off controls.
- Keep selection, hover, focus and destructive actions visually consistent across avatars, expressions and animations.
- Prefer transform/opacity animation over layout animation for continuous interactions.

## Hosted site reform

The public product is **AntX Pets** (Lab + Studio + Photo + `radar.html`), not a renamed Studio header. Before changing hosted IA, chrome, Photo Mode, or Blob/Mark create paths, read:

- [`docs/PETS-SITE.md`](./docs/PETS-SITE.md) — pages, IA, visitor flow
- [`docs/PETS-UI.md`](./docs/PETS-UI.md) — tokens and anatomy
- [`docs/PETS-REFORM.md`](./docs/PETS-REFORM.md) — one phase per PR; allowlists are law

Do not invent a backend, a second app tree, or a new document schema. Engine and AGPL attribution stay.
