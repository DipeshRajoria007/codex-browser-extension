import React from 'react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { LoadingIndicator } from '../common/LoadingIndicator';

interface StreamingMessageProps {
  text: string;
}

export const StreamingMessage: React.FC<StreamingMessageProps> = ({ text }) => {
  if (!text) {
    return <LoadingIndicator />;
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[90%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-codex-surface border border-codex-border">
        <div className="text-sm prose prose-invert prose-sm max-w-none">
          <MarkdownRenderer content={text} />
        </div>
        <span className="inline-block w-2 h-4 bg-codex-accent animate-pulse ml-0.5" />
      </div>
    </div>
  );
};
