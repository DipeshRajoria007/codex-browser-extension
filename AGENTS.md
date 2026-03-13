# Agents

This document describes how AI coding agents should work with this codebase.

## Build & Development

- **Build**: `npm run build` — runs the three-pass Vite build (`scripts/build.js`)
- **Dev/Watch**: `npm run dev` — same build in watch mode
- **Clean**: `npm run clean` — removes `dist/`
- There are no tests configured yet. Validate changes by running `npm run build` and confirming zero errors.
- TypeScript strict mode is enabled. Do not introduce `any` types without justification.

## Architecture

The project is a Chrome Manifest V3 browser extension with three isolated execution contexts:

1. **Service Worker** (`src/background/`) — message routing, OpenAI API calls, tool execution loop, alarm scheduling. Built as an IIFE bundle via `vite.config.background.ts`. Cannot access DOM.
2. **Content Script** (`src/content/`) — injected into web pages. Handles accessibility tree generation, DOM action execution, console capture, workflow recording. Built as an IIFE bundle via `vite.config.content.ts`. Cannot use `chrome.storage.session`.
3. **React UI Pages** (`src/sidepanel/`, `src/popup/`, `src/options/`) — side panel is the main interface. Built as standard Vite React bundles via `vite.config.ts`.

Communication between contexts uses `chrome.runtime.sendMessage` for one-shot messages and `chrome.runtime.connect` Ports for streaming.

## Key Conventions

- **Path aliases**: Use `@/` to reference `src/` (e.g., `import { storage } from '@/shared/storage'`)
- **State management**: Zustand stores in `src/sidepanel/store/`. No Redux.
- **Styling**: Tailwind CSS with custom `codex-*` color tokens defined in `tailwind.config.js`
- **Types**: Shared types live in `src/shared/types/`. Use discriminated unions for message types.
- **Element tracking**: Use `WeakRef<Element>` maps in content scripts to avoid memory leaks in SPAs.
- **OpenAI streaming**: Always use Port connections, never `sendMessage` (which expects a single response).

## File Organization

| Directory | Purpose |
|-----------|---------|
| `src/shared/` | Types, storage wrapper, OpenAI client, constants — imported by all contexts |
| `src/tools/` | OpenAI function calling tool definitions and handlers |
| `src/background/` | Service worker: message router, tab manager, alarm handler |
| `src/content/` | Content script: accessibility tree, action executor, page extractor |
| `src/sidepanel/` | Main React UI: chat, workflows, settings, history |
| `src/popup/` | Extension popup: quick chat, quick actions |
| `src/options/` | Options page: API key setup, model config, data export |
| `public/` | Static assets copied to `dist/`: manifest.json, icons, offscreen.html |
| `scripts/` | Build orchestrator |

## Security Rules

- API key is stored in `chrome.storage.session` (not local) for runtime access
- Never auto-fill password fields, auto-submit payment forms, or run `eval` without explicit user approval
- Action execution has risk levels: `safe` (read-only), `moderate` (navigation/clicks), `dangerous` (close tabs, password fields)
- Max 10 tool iterations per user message to prevent runaway loops
- Max 10 actions per second rate limit

## Making Changes

- When adding a new tool, define it in `src/tools/definitions.ts` and add the handler in the appropriate `*Tools.ts` file. Register it in `src/background/messageRouter.ts`.
- When adding a new message type, add it to `src/shared/types/messages.ts` and handle it in `src/background/messageRouter.ts`.
- When modifying the content script, ensure changes work across SPAs (React, Vue, Angular) — use native event dispatching for input compatibility.
- Run `npm run build` after every change to verify the three-pass build succeeds.
