import React, { useState } from 'react';
import type { WorkflowSchedule } from '@/shared/types/workflows';

interface ScheduleManagerProps {
  schedule?: WorkflowSchedule;
  onSave: (schedule: WorkflowSchedule) => void;
  onDisable: () => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedule,
  onSave,
  onDisable,
}) => {
  const [frequency, setFrequency] = useState<WorkflowSchedule['frequency']>(
    schedule?.frequency ?? 'daily'
  );
  const [time, setTime] = useState(schedule?.time ?? '09:00');
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1);

  const handleSave = () => {
    onSave({
      frequency,
      time,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      nextRun: 0, // Will be calculated by alarm handler
      enabled: true,
    });
  };

  return (
    <div className="space-y-3 p-3 bg-codex-surface border border-codex-border rounded-lg">
      <h4 className="text-sm font-medium text-codex-text">Schedule</h4>

      <div className="space-y-2">
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as WorkflowSchedule['frequency'])}
          className="w-full bg-codex-bg border border-codex-border rounded px-2 py-1.5 text-sm text-codex-text"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-codex-bg border border-codex-border rounded px-2 py-1.5 text-sm text-codex-text"
        />

        {frequency === 'weekly' && (
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full bg-codex-bg border border-codex-border rounded px-2 py-1.5 text-sm text-codex-text"
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        )}

        {frequency === 'monthly' && (
          <input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            className="w-full bg-codex-bg border border-codex-border rounded px-2 py-1.5 text-sm text-codex-text"
            placeholder="Day of month"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-codex-accent hover:bg-codex-accent-hover text-white rounded px-3 py-1.5 text-sm transition-colors"
        >
          {schedule?.enabled ? 'Update' : 'Enable'}
        </button>
        {schedule?.enabled && (
          <button
            onClick={onDisable}
            className="bg-codex-surface border border-codex-border text-codex-text rounded px-3 py-1.5 text-sm transition-colors"
          >
            Disable
          </button>
        )}
      </div>
    </div>
  );
};
