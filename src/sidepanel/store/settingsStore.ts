import { create } from 'zustand';

interface SettingsState {
  apiKey: string;
  model: string;
  autoApproveReadOnly: boolean;
  sitePermissions: Record<string, 'allow' | 'ask' | 'deny'>;
  includePageContext: boolean;
  isApiKeySet: boolean;

  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setAutoApproveReadOnly: (value: boolean) => void;
  setSitePermission: (site: string, permission: 'allow' | 'ask' | 'deny') => void;
  setIncludePageContext: (value: boolean) => void;
  loadSettings: (settings: {
    apiKey?: string;
    model?: string;
    autoApproveReadOnly?: boolean;
    sitePermissions?: Record<string, 'allow' | 'ask' | 'deny'>;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: '',
  model: 'gpt-4o',
  autoApproveReadOnly: true,
  sitePermissions: {},
  includePageContext: true,
  isApiKeySet: false,

  setApiKey: (key) => {
    set({ apiKey: key, isApiKeySet: key.length > 0 });
    chrome.runtime.sendMessage({ type: 'SET_API_KEY', key });
  },

  setModel: (model) => {
    set({ model });
    chrome.runtime.sendMessage({ type: 'SET_SETTINGS', settings: { model } });
  },

  setAutoApproveReadOnly: (value) => {
    set({ autoApproveReadOnly: value });
    chrome.runtime.sendMessage({ type: 'SET_SETTINGS', settings: { autoApproveReadOnly: value } });
  },

  setSitePermission: (site, permission) => {
    set((state) => {
      const newPerms = { ...state.sitePermissions, [site]: permission };
      chrome.runtime.sendMessage({ type: 'SET_SETTINGS', settings: { sitePermissions: newPerms } });
      return { sitePermissions: newPerms };
    });
  },

  setIncludePageContext: (value) => set({ includePageContext: value }),

  loadSettings: (settings) => {
    set({
      apiKey: settings.apiKey ?? '',
      isApiKeySet: (settings.apiKey?.length ?? 0) > 0,
      model: settings.model ?? 'gpt-4o',
      autoApproveReadOnly: settings.autoApproveReadOnly ?? true,
      sitePermissions: settings.sitePermissions ?? {},
    });
  },
}));
