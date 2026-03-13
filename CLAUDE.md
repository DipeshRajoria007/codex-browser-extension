# CLAUDE.md

Instructions for Claude Code when working on this project.

## Quick Reference

- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Clean**: `npm run clean`
- No test suite yet — validate with `npm run build`

## Project Overview

Codex is a Chrome browser extension (Manifest V3) that provides AI-powered browser automation via OpenAI's GPT API. It features a side panel chat interface, page understanding via accessibility trees, browser action execution through function calling, workflow recording/replay, and scheduling.

## Stack

- React 18 + TypeScript (strict) + Vite + Tailwind CSS
- Chrome Extension Manifest V3
- OpenAI API (`openai` npm package) with GPT-4o / GPT-4o-mini
- Zustand for state management
- react-markdown + remark-gfm + rehype-highlight for rendering

## Build System

Three-pass Vite build via `scripts/build.js`:
1. HTML pages (sidepanel, popup, options) — standard Vite React build
2. Content script — IIFE bundle (`vite.config.content.ts`)
3. Service worker — IIFE bundle (`vite.config.background.ts`)

IIFE format is required because MV3 service workers and content scripts cannot use ES module imports.

## Code Style

- Use `@/` path alias for imports from `src/`
- Tailwind for all styling — use `codex-*` custom color tokens
- Discriminated union types for all message passing
- WeakRef-based element maps in content scripts
- Prefer `chrome.runtime.connect` Ports for streaming over `sendMessage`
- No `any` types without justification

## Architecture Boundaries

- **Service worker** (`src/background/`): No DOM access. Handles API calls, message routing, tool orchestration.
- **Content script** (`src/content/`): No `chrome.storage.session`. Handles DOM reading/manipulation.
- **UI pages** (`src/sidepanel/`, `src/popup/`, `src/options/`): React components with Zustand stores.

These contexts communicate via Chrome message passing only.

## Adding Features

### New OpenAI Tool
1. Add schema to `src/tools/definitions.ts`
2. Add handler to appropriate `src/tools/*Tools.ts`
3. Register in `src/background/messageRouter.ts` tool execution switch

### New Message Type
1. Add to discriminated union in `src/shared/types/messages.ts`
2. Handle in `src/background/messageRouter.ts`

### New UI Component
1. Add to appropriate `src/sidepanel/components/` directory
2. Use existing Zustand stores or create new one in `src/sidepanel/store/`

## Security

- Never auto-fill passwords or auto-submit payments
- Never execute `eval` without user approval
- API key stored in `chrome.storage.session`
- Action rate limit: 10/second, max 10 tool iterations per message
- Risk levels gate all actions: safe (auto-approve read-only), moderate (ask), dangerous (always ask)
