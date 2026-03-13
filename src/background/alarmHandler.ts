import { storage } from '@/shared/storage';

export function setupAlarms(): void {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('workflow:')) return;

    const workflowId = alarm.name.replace('workflow:', '');
    const workflows = await storage.getWorkflows();
    const workflow = workflows.find((w) => w.id === workflowId);

    if (!workflow?.schedule?.enabled) return;

    // Execute workflow by sending replay message
    chrome.runtime.sendMessage({
      type: 'REPLAY_WORKFLOW',
      workflowId,
    });

    // Schedule next run
    await scheduleWorkflow(workflowId);
  });
}

export async function scheduleWorkflow(workflowId: string): Promise<void> {
  const workflows = await storage.getWorkflows();
  const workflow = workflows.find((w) => w.id === workflowId);

  if (!workflow?.schedule?.enabled) {
    await chrome.alarms.clear(`workflow:${workflowId}`);
    return;
  }

  const nextRun = calculateNextRun(workflow.schedule);
  workflow.schedule.nextRun = nextRun;
  await storage.saveWorkflow(workflow);

  await chrome.alarms.create(`workflow:${workflowId}`, {
    when: nextRun,
  });
}

function calculateNextRun(schedule: {
  frequency: string;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}): number {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    switch (schedule.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'annually':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
  }

  if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined) {
    while (next.getDay() !== schedule.dayOfWeek) {
      next.setDate(next.getDate() + 1);
    }
  }

  if (schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined) {
    next.setDate(schedule.dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next.getTime();
}
