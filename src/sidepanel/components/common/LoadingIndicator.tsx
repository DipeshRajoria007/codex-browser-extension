import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 py-2 px-4">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-codex-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-codex-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-codex-accent rounded-full animate-bounce" />
      </div>
      <span className="text-sm text-codex-muted ml-2">Thinking...</span>
    </div>
  );
};
