import { useEffect, useCallback } from 'react';
import { useWorkflowStore } from '../store/workflowStore';

export function useWorkflows() {
  const {
    workflows,
    isRecording,
    recordingSteps,
    replayingWorkflowId,
    startRecording,
    stopRecording,
    saveWorkflow,
    loadWorkflows,
    deleteWorkflow,
    setReplaying,
  } = useWorkflowStore();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_WORKFLOWS' }, (response) => {
      if (response?.workflows) {
        loadWorkflows(response.workflows);
      }
    });

    // Listen for recorded steps from content script
    const listener = (message: { type: string; step?: unknown }) => {
      if (message.type === 'RECORDED_STEP' && message.step) {
        useWorkflowStore.getState().addRecordedStep(message.step as never);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [loadWorkflows]);

  const replayWorkflow = useCallback(
    (workflowId: string) => {
      setReplaying(workflowId);
      chrome.runtime.sendMessage({ type: 'REPLAY_WORKFLOW', workflowId }, () => {
        setReplaying(null);
      });
    },
    [setReplaying]
  );

  return {
    workflows,
    isRecording,
    recordingSteps,
    replayingWorkflowId,
    startRecording,
    stopRecording,
    saveWorkflow,
    deleteWorkflow,
    replayWorkflow,
  };
}
