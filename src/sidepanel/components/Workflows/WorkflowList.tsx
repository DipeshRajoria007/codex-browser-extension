import React from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';

export const WorkflowList: React.FC = () => {
  const {
    workflows,
    isRecording,
    recordingSteps,
    replayingWorkflowId,
    startRecording,
    stopRecording,
    deleteWorkflow,
    replayWorkflow,
  } = useWorkflows();

  const [saveName, setSaveName] = React.useState('');
  const [showSave, setShowSave] = React.useState(false);
  const { saveWorkflow } = useWorkflows();

  const handleStopAndSave = () => {
    stopRecording();
    setShowSave(true);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveWorkflow(saveName.trim(), '');
    setSaveName('');
    setShowSave(false);
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Recording controls */}
      <div className="mb-4">
        {!isRecording && !showSave ? (
          <button
            onClick={startRecording}
            className="w-full bg-codex-accent hover:bg-codex-accent-hover text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Start Recording
          </button>
        ) : isRecording ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-codex-text">
                Recording... ({recordingSteps.length} steps)
              </span>
            </div>
            <button
              onClick={handleStopAndSave}
              className="w-full bg-codex-danger hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              Stop Recording
            </button>
          </div>
        ) : showSave ? (
          <div className="space-y-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Workflow name..."
              className="w-full bg-codex-surface border border-codex-border rounded-lg px-3 py-2 text-sm text-codex-text focus:outline-none focus:border-codex-accent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 bg-codex-accent hover:bg-codex-accent-hover disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                Save ({recordingSteps.length} steps)
              </button>
              <button
                onClick={() => setShowSave(false)}
                className="bg-codex-surface border border-codex-border text-codex-text rounded-lg px-3 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Workflow list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {workflows.length === 0 ? (
          <div className="text-center text-codex-muted text-sm py-8">
            <p>No workflows yet.</p>
            <p className="mt-1">Start recording to create one.</p>
          </div>
        ) : (
          workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-codex-surface border border-codex-border rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-codex-text">{wf.name}</h3>
                  <p className="text-xs text-codex-muted mt-0.5">
                    {wf.steps.length} steps
                    {wf.schedule?.enabled && ' | Scheduled'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => replayWorkflow(wf.id)}
                    disabled={replayingWorkflowId === wf.id}
                    className="text-xs bg-codex-accent/20 text-codex-accent hover:bg-codex-accent/30 rounded px-2 py-1 transition-colors disabled:opacity-50"
                  >
                    {replayingWorkflowId === wf.id ? 'Running...' : 'Run'}
                  </button>
                  <button
                    onClick={() => deleteWorkflow(wf.id)}
                    className="text-xs text-codex-danger hover:bg-codex-danger/20 rounded px-2 py-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
