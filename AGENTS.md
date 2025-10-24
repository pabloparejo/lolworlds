# Repository Guidelines

## Project Structure & Module Organization
The app follows a four-layer architecture under `src/...`: `domain` holds entities, services, and business rules; `application` wraps use cases/hooks; `infrastructure` handles theme, data loading, and persistence; `presentation` hosts UI components, contexts, hooks, and pages. Shared assets reside in `src/assets`, with test scaffolding in `src/test`. Static files live in `public/`. Planning, specs, and research live in `specs/###-*` for onboarding context.

## Build, Test, and Development Commands
- `npm install` bootstraps dependencies; rerun after pulling Tailwind or tooling updates.
- `npm run dev` starts the Vite dev server on port 5173 with hot reload.
- `npm run build` performs a TypeScript project build (via `tsc -b`) and generates the production bundle under `dist/`.
- `npm run lint` runs ESLint using the project config; address warnings before opening PRs.
- `npm exec vitest -- --run` executes the Vitest suite once; omit `--run` to launch watch mode.

## Coding Style & Naming Conventions
TypeScript + React is the default. Use 2-space indentation, trailing semicolons, and Tailwind utility classes for styling. Components and context providers use `PascalCase` filenames (`TournamentPage.tsx`), hooks use `useCamelCase` (`useBracketState.ts`), and helpers prefer `camelCase`. Keep imports aligned with the Vite path aliases (e.g. `import { Layout } from 'presentation/components/layout/Layout'`). Run `npm run lint` before commits; no auto-format script is provided, so rely on editor support.

## Testing Guidelines
Vitest is configured in `vite.config.ts` with a `jsdom` environment and setup file at `src/test/setup.ts`. Co-locate unit tests beside the implementation using `*.test.ts`/`*.test.tsx`. Prefer Testing Library for UI behavior and mock network access through infrastructure services. Aim for meaningful coverage on domain rules and tournament pairing logic; document gaps in the PR description when tests are pending.

## Commit & Pull Request Guidelines
Commit messages follow a short imperative summary (`Fix KnockoutRound enum import`). Group related changes and avoid mixing refactors with feature work. For pull requests, include: goal-oriented summary, links to relevant spec folder (e.g. `specs/003-drag-and-drop/spec.md`), screenshots or GIFs for UI updates, test commands executed, and any follow-up TODOs. Request review once lint/test pass locally and ensure merge conflicts are resolved.
