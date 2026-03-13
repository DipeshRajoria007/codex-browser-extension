import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/shared/types/chat';
import type { ToolCallInfo } from '@/shared/types/chat';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingText: string;
  streamingToolCalls: ToolCallInfo[];
  error: string | null;

  createConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  updateMessage: (conversationId: string, messageId: string, update: Partial<ChatMessage>) => void;
  setStreaming: (streaming: boolean) => void;
  appendStreamingText: (text: string) => void;
  resetStreamingText: () => void;
  setStreamingToolCalls: (calls: ToolCallInfo[]) => void;
  setError: (error: string | null) => void;
  loadConversations: (conversations: Conversation[]) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isStreaming: false,
  streamingText: '',
  streamingToolCalls: [],
  error: null,

  createConversation: () => {
    const id = generateId();
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: 'gpt-4o',
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
              title: c.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                : c.title,
            }
          : c
      ),
    })),

  updateMessage: (conversationId, messageId, update) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...update } : m
              ),
            }
          : c
      ),
    })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  appendStreamingText: (text) => set((state) => ({ streamingText: state.streamingText + text })),
  resetStreamingText: () => set({ streamingText: '', streamingToolCalls: [] }),
  setStreamingToolCalls: (calls) => set({ streamingToolCalls: calls }),
  setError: (error) => set({ error }),
  loadConversations: (conversations) => set({ conversations }),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
    })),
  getActiveConversation: () => {
    const state = get();
    return state.conversations.find((c) => c.id === state.activeConversationId);
  },
}));
