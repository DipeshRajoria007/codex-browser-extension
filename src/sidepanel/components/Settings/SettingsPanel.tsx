import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { AVAILABLE_MODELS } from '@/shared/constants';
import { ModelSelector } from './ModelSelector';
import { SitePermissions } from './SitePermissions';

export const SettingsPanel: React.FC = () => {
  const {
    apiKey,
    model,
    autoApproveReadOnly,
    setApiKey,
    setModel,
    setAutoApproveReadOnly,
  } = useSettingsStore();

  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey]);

  const handleSaveKey = () => {
    setApiKey(keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
      {/* API Key */}
      <section>
        <h3 className="text-sm font-medium text-codex-text mb-2">API Key</h3>
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-codex-surface border border-codex-border rounded-lg px-3 py-2 text-sm text-codex-text pr-16 focus:outline-none focus:border-codex-accent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-codex-muted hover:text-codex-text"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            className="w-full bg-codex-accent hover:bg-codex-accent-hover text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            {saved ? 'Saved!' : 'Save API Key'}
          </button>
        </div>
      </section>

      {/* Model */}
      <section>
        <h3 className="text-sm font-medium text-codex-text mb-2">Default Model</h3>
        <ModelSelector
          value={model}
          onChange={setModel}
          models={[...AVAILABLE_MODELS]}
        />
      </section>

      {/* Auto-approve */}
      <section>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoApproveReadOnly}
            onChange={(e) => setAutoApproveReadOnly(e.target.checked)}
            className="w-4 h-4 rounded border-codex-border text-codex-accent focus:ring-codex-accent bg-codex-surface"
          />
          <div>
            <span className="text-sm text-codex-text">Auto-approve read-only actions</span>
            <p className="text-xs text-codex-muted">
              Automatically approve safe actions like screenshots, scrolling, and page content retrieval
            </p>
          </div>
        </label>
      </section>

      {/* Site Permissions */}
      <section>
        <h3 className="text-sm font-medium text-codex-text mb-2">Site Permissions</h3>
        <SitePermissions />
      </section>
    </div>
  );
};
