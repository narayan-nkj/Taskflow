import React, { useState } from 'react';
import { UserTask, TaskStatus } from '../../types/task';
import { getTaskDeadlineStatus, formatDisplayDate } from '../../utils/dates';
import { getSubtaskProgress } from '../../utils/subtasks';
import { CategoryBadge, PriorityBadge, DeadlineBadge } from '../common/Badge';
import { CategoryIcon } from '../common/CategoryIcon';
import { TaskChecklist } from './TaskChecklist';
import { Check, Edit2, Trash2, CheckSquare, ChevronDown, Star } from 'lucide-react';

interface TaskItemProps {
  task: UserTask;
  isSelected?: boolean;
  onSelectTask?: (task: UserTask) => void;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onSelectTask,
  onToggleStatus,
  onStatusChange,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = task.status === 'Completed';
  const deadlineInfo = getTaskDeadlineStatus(task.dueDate, isCompleted);
  const displayDate = formatDisplayDate(task.dueDate);

  const hasSubtasks = Boolean(task.subtasks && task.subtasks.length > 0);
  const subtaskProgress = getSubtaskProgress(task.subtasks);

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
      className={`group relative p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111111] border transition-all duration-150 flex flex-col justify-between gap-3 shadow-sm hover:shadow cursor-pointer min-h-[76px] ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20 dark:bg-[#24140E] dark:border-brand-500'
          : 'border-slate-200/80 dark:border-[#292929] hover:border-slate-300 dark:hover:border-[#383838]'
      }`}
      aria-label={`Task: ${task.title}`}
    >
      {/* Top Main Row: Icon, metadata & action buttons */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Left side: Category tile + details */}
        <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
          {/* Category tile */}
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
              {task.favorite && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40"
                  title="Starred favorite"
                >
                  <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                  Starred
                </span>
              )}
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

          {/* Favorite toggle button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(task.id);
              }}
              className={`p-1.5 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 min-w-[36px] min-h-[36px] flex items-center justify-center ${
                task.favorite
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                  : 'text-slate-400 hover:text-amber-500 dark:text-[#808080] dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#202020]'
              }`}
              aria-label={
                task.favorite
                  ? `Remove "${task.title}" from favorites`
                  : `Add "${task.title}" to favorites`
              }
              aria-pressed={Boolean(task.favorite)}
              title={task.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 transition-transform ${
                  task.favorite
                    ? 'fill-amber-500 text-amber-500 scale-105'
                    : 'fill-none text-current'
                }`}
                aria-hidden="true"
              />
            </button>
          )}

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
      </div>

      {/* Subtasks Summary Strip (Only when at least one subtask exists) */}
      {hasSubtasks && (
        <div className="pt-2 border-t border-slate-100 dark:border-[#1E1E1E] flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              aria-expanded={isExpanded}
              aria-label={`${subtaskProgress.summaryLabel} for "${task.title}". Click to ${
                isExpanded ? 'collapse' : 'expand'
              } checklist`}
              className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#181818] hover:bg-slate-200 dark:hover:bg-[#222222] text-slate-700 dark:text-[#C0C0C0] border border-slate-200/80 dark:border-[#262626] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <CheckSquare className="w-3 h-3 text-brand-500" aria-hidden="true" />
              <span>{subtaskProgress.summaryLabel}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Subtle Progress Bar */}
            <div
              className="w-20 h-1.5 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={subtaskProgress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Subtask completion: ${subtaskProgress.summaryLabel}`}
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  subtaskProgress.isAllCompleted ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${subtaskProgress.percentage}%` }}
              />
            </div>
          </div>

          {/* Expanded Checklist View inside card */}
          {isExpanded && onAddSubtask && onToggleSubtask && onUpdateSubtask && onDeleteSubtask && (
            <div
              className="pt-2 border-t border-dashed border-slate-200 dark:border-[#262626] animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <TaskChecklist
                taskId={task.id}
                subtasks={task.subtasks}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
                compact={true}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default TaskItem;
