import React from 'react';
import type { WorkflowStep } from '@/shared/types/workflows';

interface WorkflowRecorderProps {
  steps: WorkflowStep[];
  isRecording: boolean;
}

export const WorkflowRecorder: React.FC<WorkflowRecorderProps> = ({ steps, isRecording }) => {
  if (!isRecording && steps.length === 0) return null;

  return (
    <div className="p-3 bg-codex-surface border border-codex-border rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {isRecording && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        <span className="text-xs font-medium text-codex-text">
          {isRecording ? 'Recording' : 'Recorded'} Steps ({steps.length})
        </span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 text-xs text-codex-muted">
            <span className="text-codex-accent font-mono w-5">{i + 1}.</span>
            <span className="truncate">{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
