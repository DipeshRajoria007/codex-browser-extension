export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
  schedule?: WorkflowSchedule;
}

export interface WorkflowStep {
  id: string;
  actionType: string;
  selector?: string;
  value?: string;
  url?: string;
  description: string;
  screenshot?: string;
  timestamp: number;
}

export interface WorkflowSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  time: string; // HH:MM
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  nextRun: number; // epoch ms
  enabled: boolean;
}

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  prompt: string;
}
