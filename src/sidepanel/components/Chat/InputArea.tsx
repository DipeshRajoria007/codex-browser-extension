import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { AVAILABLE_MODELS } from '@/shared/constants';

interface InputAreaProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  onCancel,
  isStreaming,
  disabled,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { model, setModel, includePageContext, setIncludePageContext } = useSettingsStore();

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    }
  }, []);

  useEffect(adjustHeight, [text, adjustHeight]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-codex-border bg-codex-bg p-3">
      {/* Controls row */}
      <div className="flex items-center gap-2 mb-2">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-codex-surface border border-codex-border rounded-md px-2 py-1 text-xs text-codex-text focus:outline-none focus:border-codex-accent"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          onClick={() => setIncludePageContext(!includePageContext)}
          className={`text-xs px-2 py-1 rounded-md border transition-colors ${
            includePageContext
              ? 'bg-codex-accent/20 border-codex-accent text-codex-accent'
              : 'border-codex-border text-codex-muted hover:text-codex-text'
          }`}
          title="Include current page context"
        >
          Page Context {includePageContext ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Set API key in settings...' : 'Ask Codex anything...'}
          disabled={disabled || isStreaming}
          rows={1}
          className="flex-1 bg-codex-surface border border-codex-border rounded-xl px-4 py-2.5 text-sm text-codex-text placeholder-codex-muted resize-none focus:outline-none focus:border-codex-accent disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={onCancel}
            className="bg-codex-danger hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="bg-codex-accent hover:bg-codex-accent-hover disabled:opacity-50 disabled:hover:bg-codex-accent text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
};
