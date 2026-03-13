import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import type { ChatMessage, ToolCallInfo } from '@/shared/types/chat';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useChat() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const {
    activeConversationId,
    isStreaming,
    streamingText,
    streamingToolCalls,
    error,
    createConversation,
    addMessage,
    setStreaming,
    appendStreamingText,
    resetStreamingText,
    setStreamingToolCalls,
    setError,
    getActiveConversation,
  } = useChatStore();

  const { model, includePageContext } = useSettingsStore();

  // Setup port connection
  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'chat-stream' });
    portRef.current = port;

    port.onMessage.addListener((msg) => {
      switch (msg.type) {
        case 'STREAM_CHUNK':
          if (msg.chunk) {
            appendStreamingText(msg.chunk);
          }
          if (msg.toolCalls) {
            setStreamingToolCalls(msg.toolCalls as ToolCallInfo[]);
          }
          break;

        case 'STREAM_DONE':
          setStreaming(false);
          if (msg.message) {
            addMessage(msg.conversationId, msg.message as ChatMessage);
          }
          resetStreamingText();
          // Save conversation
          const conv = useChatStore.getState().getActiveConversation();
          if (conv) {
            chrome.runtime.sendMessage({ type: 'SAVE_CONVERSATION', conversation: conv });
          }
          break;

        case 'STREAM_ERROR':
          setStreaming(false);
          setError(msg.error);
          resetStreamingText();
          break;

        case 'APPROVAL_REQUEST':
          // Store approval request for UI to handle
          useChatStore.setState({
            streamingToolCalls: [{
              id: msg.requestId,
              name: msg.action.type,
              arguments: JSON.stringify(msg.action.params),
              status: 'pending',
            }],
          });
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      portRef.current = null;
    });

    return () => {
      port.disconnect();
    };
  }, []);

  const sendMessage = useCallback(
    (content: string, imageUrl?: string) => {
      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      const message: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        imageUrl,
      };

      addMessage(convId, message);
      setStreaming(true);
      setError(null);
      resetStreamingText();

      portRef.current?.postMessage({
        type: 'SEND_CHAT',
        conversationId: convId,
        message,
        model,
        includePageContext,
      });
    },
    [activeConversationId, model, includePageContext, createConversation, addMessage, setStreaming, setError, resetStreamingText]
  );

  const cancelStream = useCallback(() => {
    if (activeConversationId) {
      portRef.current?.postMessage({
        type: 'CANCEL_STREAM',
        conversationId: activeConversationId,
      });
      setStreaming(false);
      resetStreamingText();
    }
  }, [activeConversationId, setStreaming, resetStreamingText]);

  const approveAction = useCallback(
    (requestId: string, approved: boolean) => {
      chrome.runtime.sendMessage({
        type: 'APPROVAL_RESPONSE',
        requestId,
        approved,
        approveAll: false,
      });
    },
    []
  );

  return {
    conversation: getActiveConversation(),
    isStreaming,
    streamingText,
    streamingToolCalls,
    error,
    sendMessage,
    cancelStream,
    approveAction,
  };
}
