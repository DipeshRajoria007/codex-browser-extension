import React, { useState, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/shared/constants';

export const Options: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [autoApprove, setAutoApprove] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (response) => {
      if (response?.key) setApiKey(response.key);
    });
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
      if (settings) {
        setModel(settings.model || 'gpt-4o');
        setAutoApprove(settings.autoApproveReadOnly ?? true);
      }
    });
  }, []);

  const validateKey = async () => {
    if (!apiKey.trim()) return;
    setValidating(true);
    setValidationResult(null);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (response.ok) {
        setValidationResult('Valid API key');
      } else if (response.status === 401) {
        setValidationResult('Invalid API key');
      } else {
        setValidationResult(`API returned status ${response.status}`);
      }
    } catch {
      setValidationResult('Could not connect to OpenAI');
    }
    setValidating(false);
  };

  const handleSave = () => {
    chrome.runtime.sendMessage({ type: 'SET_API_KEY', key: apiKey });
    chrome.runtime.sendMessage({
      type: 'SET_SETTINGS',
      settings: { model, autoApproveReadOnly: autoApprove },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    chrome.runtime.sendMessage({ type: 'GET_CONVERSATIONS' }, (response) => {
      const data = JSON.stringify(response?.conversations ?? [], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codex-conversations.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="min-h-screen bg-codex-bg text-codex-text">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-8">Codex Settings</h1>

        {/* API Key */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">API Key</h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-codex-surface border border-codex-border rounded-lg px-4 py-3 text-sm pr-20 focus:outline-none focus:border-codex-accent"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-codex-muted hover:text-codex-text"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={validateKey}
                disabled={validating || !apiKey.trim()}
                className="bg-codex-surface border border-codex-border text-codex-text rounded-lg px-4 py-2 text-sm hover:border-codex-accent transition-colors disabled:opacity-50"
              >
                {validating ? 'Validating...' : 'Validate'}
              </button>
              {validationResult && (
                <span
                  className={`text-sm py-2 ${
                    validationResult.includes('Valid') && !validationResult.includes('Invalid')
                      ? 'text-green-400'
                      : 'text-codex-danger'
                  }`}
                >
                  {validationResult}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Model */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Default Model</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-codex-surface border border-codex-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-codex-accent"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </section>

        {/* Auto-approve */}
        <section className="mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-codex-border text-codex-accent bg-codex-surface"
            />
            <div>
              <span className="text-sm font-medium">Auto-approve read-only actions</span>
              <p className="text-sm text-codex-muted mt-1">
                Automatically approve safe actions like taking screenshots, scrolling, and reading page content.
              </p>
            </div>
          </label>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-codex-accent hover:bg-codex-accent-hover text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors mb-4"
        >
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </button>

        {/* Export */}
        <section className="pt-4 border-t border-codex-border">
          <h2 className="text-lg font-semibold mb-3">Data</h2>
          <button
            onClick={handleExport}
            className="bg-codex-surface border border-codex-border text-codex-text rounded-lg px-4 py-2 text-sm hover:border-codex-accent transition-colors"
          >
            Export Conversations
          </button>
        </section>
      </div>
    </div>
  );
};
