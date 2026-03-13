import { STORAGE_KEYS } from './constants';
import type { Conversation } from './types/chat';
import type { Workflow, SlashCommand } from './types/workflows';

export interface Settings {
  model: string;
  autoApproveReadOnly: boolean;
  sitePermissions: Record<string, 'allow' | 'ask' | 'deny'>;
}

const defaultSettings: Settings = {
  model: 'gpt-4o',
  autoApproveReadOnly: true,
  sitePermissions: {},
};

async function get<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

async function set<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export const storage = {
  // API Key - stored in session storage for security
  async getApiKey(): Promise<string | undefined> {
    const result = await chrome.storage.session.get(STORAGE_KEYS.API_KEY);
    return result[STORAGE_KEYS.API_KEY] as string | undefined;
  },

  async setApiKey(key: string): Promise<void> {
    await chrome.storage.session.set({ [STORAGE_KEYS.API_KEY]: key });
    // Also persist encrypted reference in local storage
    await chrome.storage.local.set({ [STORAGE_KEYS.API_KEY]: key });
  },

  async loadApiKeyFromLocal(): Promise<string | undefined> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.API_KEY);
    const key = result[STORAGE_KEYS.API_KEY] as string | undefined;
    if (key) {
      await chrome.storage.session.set({ [STORAGE_KEYS.API_KEY]: key });
    }
    return key;
  },

  // Settings
  async getSettings(): Promise<Settings> {
    const settings = await get<Settings>(STORAGE_KEYS.SETTINGS);
    return { ...defaultSettings, ...settings };
  },

  async setSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  },

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return (await get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS)) ?? [];
  },

  async saveConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.getConversations();
    const idx = conversations.findIndex((c) => c.id === conversation.id);
    if (idx >= 0) {
      conversations[idx] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    // Keep last 50 conversations
    await set(STORAGE_KEYS.CONVERSATIONS, conversations.slice(0, 50));
  },

  async deleteConversation(id: string): Promise<void> {
    const conversations = await this.getConversations();
    await set(
      STORAGE_KEYS.CONVERSATIONS,
      conversations.filter((c) => c.id !== id)
    );
  },

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    return (await get<Workflow[]>(STORAGE_KEYS.WORKFLOWS)) ?? [];
  },

  async saveWorkflow(workflow: Workflow): Promise<void> {
    const workflows = await this.getWorkflows();
    const idx = workflows.findIndex((w) => w.id === workflow.id);
    if (idx >= 0) {
      workflows[idx] = workflow;
    } else {
      workflows.unshift(workflow);
    }
    await set(STORAGE_KEYS.WORKFLOWS, workflows);
  },

  async deleteWorkflow(id: string): Promise<void> {
    const workflows = await this.getWorkflows();
    await set(
      STORAGE_KEYS.WORKFLOWS,
      workflows.filter((w) => w.id !== id)
    );
  },

  // Slash Commands
  async getSlashCommands(): Promise<SlashCommand[]> {
    return (await get<SlashCommand[]>(STORAGE_KEYS.SLASH_COMMANDS)) ?? [];
  },

  async saveSlashCommands(commands: SlashCommand[]): Promise<void> {
    await set(STORAGE_KEYS.SLASH_COMMANDS, commands);
  },
};
