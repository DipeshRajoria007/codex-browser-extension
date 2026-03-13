import React from 'react';
import type { BrowserAction } from '@/shared/types/actions';

interface ActionPreviewProps {
  action: BrowserAction;
}

export const ActionPreview: React.FC<ActionPreviewProps> = ({ action }) => {
  const riskColors = {
    safe: 'text-green-400 bg-green-400/10',
    moderate: 'text-yellow-400 bg-yellow-400/10',
    dangerous: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="bg-codex-surface border border-codex-border rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-codex-accent">{action.type}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${riskColors[action.riskLevel]}`}
        >
          {action.riskLevel}
        </span>
      </div>
      <p className="text-codex-muted text-xs">{action.description}</p>
    </div>
  );
};
