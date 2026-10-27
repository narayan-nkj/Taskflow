import React from 'react';
import { UserTask, TaskStatus } from '../../types/task';
import { getTaskDeadlineStatus, formatDisplayDate } from '../../utils/dates';
import { CategoryBadge, PriorityBadge, DeadlineBadge } from '../common/Badge';
import { CategoryIcon } from '../common/CategoryIcon';
import { Check, Edit2, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: UserTask;
  isSelected?: boolean;
  onSelectTask?: (task: UserTask) => void;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onSelectTask,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === 'Completed';
  const deadlineInfo = getTaskDeadlineStatus(task.dueDate, isCompleted);
  const displayDate = formatDisplayDate(task.dueDate);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only select if not clicking interactive controls
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input')
    ) {
      return;
    }
    if (onSelectTask) {
      onSelectTask(task);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111111] border transition-all duration-150 flex items-center justify-between gap-3 shadow-sm hover:shadow cursor-pointer min-h-[76px] ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-[#24140E] dark:border-brand-500'
          : 'border-slate-200/80 dark:border-[#292929] hover:border-slate-300 dark:hover:border-[#383838]'
      }`}
      aria-label={`Task: ${task.title}`}
    >
      {/* Left side: Dark rounded-square category tile + details */}
      <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
        {/* Dark rounded-square category tile */}
        <div
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#141517] dark:bg-[#181818] border border-transparent dark:border-[#292929] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          <CategoryIcon category={task.category} className="w-5 h-5" />
        </div>

        {/* Content Details */}
        <div className="min-w-0 flex-1">
          {/* Metadata badges row */}
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <DeadlineBadge
              state={deadlineInfo.state}
              label={deadlineInfo.label}
              formattedDate={displayDate}
            />
          </div>

          {/* Task Title */}
          <h3
            className={`text-sm font-semibold truncate leading-tight ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-[#808080]'
                : 'text-charcoal-900 dark:text-[#F5F5F5]'
            }`}
          >
            {task.title}
          </h3>
        </div>
      </div>

      {/* Right side: Status checkbox & action buttons */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Quick status selector */}
        <label htmlFor={`status-select-${task.id}`} className="sr-only">
          Change status for {task.title}
        </label>
        <select
          id={`status-select-${task.id}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="hidden sm:block text-xs font-medium py-1 px-2 bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-lg text-slate-700 dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer min-h-[34px]"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Quick toggle checkbox button */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
              : 'border-slate-300 dark:border-[#383838] hover:border-brand-500 bg-slate-50 dark:bg-[#181818] text-transparent'
          }`}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as completed`
          }
        >
          <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-brand-500 dark:text-[#808080] dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-[#202020] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
        >
          <Edit2 className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-[#808080] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
