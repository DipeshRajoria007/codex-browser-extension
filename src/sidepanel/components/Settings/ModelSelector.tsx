import React from 'react';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
  models: string[];
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  value,
  onChange,
  models,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-codex-surface border border-codex-border rounded-lg px-3 py-2 text-sm text-codex-text focus:outline-none focus:border-codex-accent"
    >
      {models.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
};
