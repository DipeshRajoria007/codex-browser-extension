import React from 'react';
import { useChat } from '../../hooks/useChat';
import { useSettingsStore } from '../../store/settingsStore';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ApprovalDialog } from '../ActionApproval/ApprovalDialog';

export const ChatContainer: React.FC = () => {
  const {
    conversation,
    isStreaming,
    streamingText,
    streamingToolCalls,
    error,
    sendMessage,
    cancelStream,
    approveAction,
  } = useChat();

  const { isApiKeySet } = useSettingsStore();

  const pendingApproval = streamingToolCalls.find((tc) => tc.status === 'pending');

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={conversation?.messages ?? []}
        streamingText={streamingText}
        isStreaming={isStreaming}
      />

      {pendingApproval && (
        <ApprovalDialog
          toolCall={pendingApproval}
          onApprove={() => approveAction(pendingApproval.id, true)}
          onReject={() => approveAction(pendingApproval.id, false)}
        />
      )}

      {error && (
        <div className="mx-4 mb-2 p-3 bg-codex-danger/10 border border-codex-danger/30 rounded-lg text-sm text-codex-danger">
          {error}
        </div>
      )}

      <InputArea
        onSend={sendMessage}
        onCancel={cancelStream}
        isStreaming={isStreaming}
        disabled={!isApiKeySet}
      />
    </div>
  );
};
