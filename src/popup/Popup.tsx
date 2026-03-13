import React, { useState, useEffect } from 'react';
import { getQuickActions } from '@/shared/siteKnowledge';

export const Popup: React.FC = () => {
  const [input, setInput] = useState('');
  const [quickActions, setQuickActions] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setQuickActions(getQuickActions(tabs[0].url));
      }
    });
  }, []);

  const openSidePanel = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    window.close();
  };

  const sendQuickChat = (message: string) => {
    // Open side panel and send message
    chrome.runtime.sendMessage({ type: 'QUICK_CHAT', message });
    window.close();
  };

  const toggleRecording = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const type = isRecording ? 'STOP_RECORDING' : 'START_RECORDING';
        chrome.tabs.sendMessage(tabs[0].id, { type });
        setIsRecording(!isRecording);
      }
    });
  };

  return (
    <div className="w-80 bg-codex-bg p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-semibold text-codex-text">Codex</h1>
        <button
          onClick={openSidePanel}
          className="text-xs text-codex-accent hover:text-codex-accent-hover"
        >
          Open Panel
        </button>
      </div>

      {/* Quick input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Codex..."
          className="flex-1 bg-codex-surface border border-codex-border rounded-lg px-3 py-2 text-sm text-codex-text focus:outline-none focus:border-codex-accent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              sendQuickChat(input.trim());
            }
          }}
        />
        <button
          onClick={() => input.trim() && sendQuickChat(input.trim())}
          disabled={!input.trim()}
          className="bg-codex-accent hover:bg-codex-accent-hover disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm transition-colors"
        >
          Go
        </button>
      </div>

      {/* Recording toggle */}
      <button
        onClick={toggleRecording}
        className={`w-full mb-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isRecording
            ? 'bg-codex-danger text-white'
            : 'bg-codex-surface border border-codex-border text-codex-text hover:border-codex-accent/50'
        }`}
      >
        {isRecording ? 'Stop Recording' : 'Record Workflow'}
      </button>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div>
          <h3 className="text-xs text-codex-muted mb-1.5">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendQuickChat(action)}
                className="w-full text-left bg-codex-surface border border-codex-border rounded-lg px-3 py-2 text-xs text-codex-text hover:border-codex-accent/50 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
