import React from 'react';
import type { ChatMessage } from '@/shared/types/chat';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-codex-accent text-white rounded-br-md'
            : 'bg-codex-surface border border-codex-border rounded-bl-md'
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Attached screenshot"
            className="max-w-full rounded-lg mb-2"
          />
        )}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-codex-border">
            {message.toolCalls.map((tc) => (
              <div
                key={tc.id}
                className="text-xs text-codex-muted flex items-center gap-1.5 py-0.5"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tc.status === 'executed'
                      ? 'bg-green-500'
                      : tc.status === 'rejected'
                      ? 'bg-red-500'
                      : tc.status === 'error'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }`}
                />
                <span>{tc.name}</span>
                <span className="text-2xs">
                  {tc.status === 'executed' ? 'Done' : tc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
