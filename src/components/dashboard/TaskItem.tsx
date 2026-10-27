import React from 'react';
import { UserTask, TaskStatus } from '../../types/task';
import { formatDisplayDate, getDeadlineState } from '../../utils/dates';
import { PriorityBadge, CategoryBadge, DeadlineBadge } from '../common/Badge';
import { Check, Edit2, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: UserTask;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'Completed';
  const displayDate = formatDisplayDate(task.dueDate);
  const deadlineInfo = getDeadlineState(task.dueDate, task.status);

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-900/60'
      }`}
    >
      {/* Left side: checkbox + title + badges */}
      <div className="flex items-start space-x-3.5 min-w-0 flex-1">
        {/* Quick toggle checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 bg-slate-50 dark:bg-slate-800'
          }`}
          aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />}
        </button>

        {/* Content details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h3
              className={`text-sm sm:text-base font-medium break-words leading-snug ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>
          </div>

          {/* Badges row: Category, Priority, Deadline, Status */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <DeadlineBadge
              state={deadlineInfo.state}
              label={deadlineInfo.label}
              formattedDate={displayDate}
            />

            {/* Quick Status Selector */}
            <label htmlFor={`status-select-${task.id}`} className="sr-only">
              Change status for {task.title}
            </label>
            <select
              id={`status-select-${task.id}`}
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="text-[11px] font-medium py-0.5 px-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right side: Action buttons (Edit & Delete) */}
      <div className="flex items-center space-x-1 sm:self-center self-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
        >
          <Edit2 className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(task)}
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
