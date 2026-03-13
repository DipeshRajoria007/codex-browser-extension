import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/shared/types/chat';
import { MessageBubble } from './MessageBubble';
import { StreamingMessage } from './StreamingMessage';

interface MessageListProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  streamingText,
  isStreaming,
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingText]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">{'</>'}</div>
          <h2 className="text-lg font-semibold text-codex-text mb-2">Codex</h2>
          <p className="text-sm text-codex-muted max-w-[260px]">
            Your AI browser assistant. Ask me to navigate, click, extract data, or automate workflows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && <StreamingMessage text={streamingText} />}
      <div ref={endRef} />
    </div>
  );
};
