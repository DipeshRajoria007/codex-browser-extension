import { create } from 'zustand';
import type { Workflow, WorkflowStep } from '@/shared/types/workflows';

interface WorkflowState {
  workflows: Workflow[];
  isRecording: boolean;
  recordingSteps: WorkflowStep[];
  replayingWorkflowId: string | null;

  startRecording: () => void;
  stopRecording: () => void;
  addRecordedStep: (step: WorkflowStep) => void;
  saveWorkflow: (name: string, description: string) => Workflow;
  loadWorkflows: (workflows: Workflow[]) => void;
  deleteWorkflow: (id: string) => void;
  setReplaying: (id: string | null) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  isRecording: false,
  recordingSteps: [],
  replayingWorkflowId: null,

  startRecording: () => {
    set({ isRecording: true, recordingSteps: [] });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'START_RECORDING' });
      }
    });
  },

  stopRecording: () => {
    set({ isRecording: false });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_RECORDING' });
      }
    });
  },

  addRecordedStep: (step) => {
    set((state) => ({ recordingSteps: [...state.recordingSteps, step] }));
  },

  saveWorkflow: (name, description) => {
    const state = get();
    const workflow: Workflow = {
      id: generateId(),
      name,
      description,
      steps: state.recordingSteps,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({
      workflows: [workflow, ...s.workflows],
      recordingSteps: [],
    }));
    chrome.runtime.sendMessage({ type: 'SAVE_WORKFLOW', workflow });
    return workflow;
  },

  loadWorkflows: (workflows) => set({ workflows }),

  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
    chrome.runtime.sendMessage({ type: 'DELETE_WORKFLOW', workflowId: id });
  },

  setReplaying: (id) => set({ replayingWorkflowId: id }),
}));
