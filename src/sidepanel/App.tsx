import React, { useState, useEffect } from 'react';
import { ChatContainer } from './components/Chat/ChatContainer';
import { WorkflowList } from './components/Workflows/WorkflowList';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { useSettingsStore } from './store/settingsStore';
import { useChatStore } from './store/chatStore';

type Tab = 'chat' | 'workflows' | 'history' | 'settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const { loadConversations, setActiveConversation, conversations } = useChatStore();

  useEffect(() => {
    // Load settings
    chrome.runtime.sendMessage({ type: 'GET_API_KEY' }, (response) => {
      if (response?.key) {
        loadSettings({ apiKey: response.key });
      }
    });
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
      if (settings) {
        loadSettings(settings);
      }
    });
    // Load conversations
    chrome.runtime.sendMessage({ type: 'GET_CONVERSATIONS' }, (response) => {
      if (response?.conversations) {
        // Load full conversations
        const convSummaries = response.conversations as Array<{
          id: string;
          title: string;
          updatedAt: number;
        }>;
        // For the history we just use summaries; full load happens on select
        loadConversations(
          convSummaries.map((c) => ({
            id: c.id,
            title: c.title,
            messages: [],
            createdAt: c.updatedAt,
            updatedAt: c.updatedAt,
            model: 'gpt-4o',
          }))
        );
      }
    });
  }, [loadSettings, loadConversations]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen bg-codex-bg">
      {/* Tab bar */}
      <div className="flex border-b border-codex-border bg-codex-bg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-codex-accent border-b-2 border-codex-accent'
                : 'text-codex-muted hover:text-codex-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatContainer />}
        {activeTab === 'workflows' && <WorkflowList />}
        {activeTab === 'history' && (
          <div className="flex flex-col h-full overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center text-codex-muted text-sm py-8">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    // Load full conversation
                    chrome.runtime.sendMessage(
                      { type: 'GET_CONVERSATION', conversationId: conv.id },
                      (response) => {
                        if (response?.conversation) {
                          const allConvs = useChatStore.getState().conversations;
                          const updated = allConvs.map((c) =>
                            c.id === conv.id ? response.conversation : c
                          );
                          loadConversations(updated);
                        }
                        setActiveConversation(conv.id);
                        setActiveTab('chat');
                      }
                    );
                  }}
                  className="w-full text-left bg-codex-surface border border-codex-border rounded-lg p-3 hover:border-codex-accent/50 transition-colors"
                >
                  <h3 className="text-sm text-codex-text truncate">{conv.title}</h3>
                  <p className="text-xs text-codex-muted mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
            <button
              onClick={() => {
                useChatStore.getState().createConversation();
                setActiveTab('chat');
              }}
              className="w-full bg-codex-accent hover:bg-codex-accent-hover text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors mt-2"
            >
              New Conversation
            </button>
          </div>
        )}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};
