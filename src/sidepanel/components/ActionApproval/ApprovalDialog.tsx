import React from 'react';
import type { ToolCallInfo } from '@/shared/types/chat';

interface ApprovalDialogProps {
  toolCall: ToolCallInfo;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  toolCall,
  onApprove,
  onReject,
}) => {
  let params: Record<string, unknown> = {};
  try {
    params = JSON.parse(toolCall.arguments);
  } catch {
    // invalid JSON
  }

  return (
    <div className="mx-4 mb-2 p-3 bg-codex-surface border border-codex-warning/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-codex-warning text-sm font-medium">Action Approval Required</span>
      </div>
      <div className="text-sm text-codex-text mb-1">
        <span className="font-mono text-codex-accent">{toolCall.name}</span>
      </div>
      <div className="text-xs text-codex-muted mb-3 font-mono bg-codex-bg rounded p-2 overflow-x-auto">
        {Object.entries(params).map(([key, val]) => (
          <div key={key}>
            {key}: {JSON.stringify(val)}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-codex-accent hover:bg-codex-accent-hover text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-codex-surface hover:bg-codex-border border border-codex-border text-codex-text rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
};
