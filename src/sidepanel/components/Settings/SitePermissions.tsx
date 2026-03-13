import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export const SitePermissions: React.FC = () => {
  const { sitePermissions, setSitePermission } = useSettingsStore();
  const [newSite, setNewSite] = useState('');

  const handleAdd = () => {
    const site = newSite.trim();
    if (!site) return;
    setSitePermission(site, 'ask');
    setNewSite('');
  };

  const entries = Object.entries(sitePermissions);

  return (
    <div className="space-y-2">
      {entries.length === 0 && (
        <p className="text-xs text-codex-muted">
          No site-specific permissions. All sites default to "Ask".
        </p>
      )}

      {entries.map(([site, permission]) => (
        <div
          key={site}
          className="flex items-center gap-2 bg-codex-surface border border-codex-border rounded-lg px-3 py-2"
        >
          <span className="flex-1 text-sm text-codex-text truncate">{site}</span>
          <select
            value={permission}
            onChange={(e) =>
              setSitePermission(site, e.target.value as 'allow' | 'ask' | 'deny')
            }
            className="bg-codex-bg border border-codex-border rounded px-2 py-1 text-xs text-codex-text"
          >
            <option value="allow">Allow</option>
            <option value="ask">Ask</option>
            <option value="deny">Deny</option>
          </select>
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="example.com"
          className="flex-1 bg-codex-surface border border-codex-border rounded-lg px-3 py-1.5 text-sm text-codex-text focus:outline-none focus:border-codex-accent"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newSite.trim()}
          className="bg-codex-accent hover:bg-codex-accent-hover disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};
