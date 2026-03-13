export const STORAGE_KEYS = {
  API_KEY: 'codex:apiKey',
  CONVERSATIONS: 'codex:conversations',
  SETTINGS: 'codex:settings',
  WORKFLOWS: 'codex:workflows',
  SLASH_COMMANDS: 'codex:slashCommands',
  SITE_PERMISSIONS: 'codex:sitePermissions',
  APPROVED_ACTIONS: 'codex:approvedActions',
} as const;

export const DEFAULT_MODEL = 'gpt-4o';
export const FALLBACK_MODEL = 'gpt-4o-mini';
export const AVAILABLE_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;

export const MAX_TOOL_ITERATIONS = 10;
export const MAX_CONSOLE_ENTRIES = 100;
export const MAX_ACCESSIBILITY_NODES = 2000;
export const MAX_TREE_DEPTH = 15;
export const ELEMENT_CACHE_TTL = 5000;

export const ACTION_RATE_LIMIT = 10; // max actions per second
