import React from 'react';
import { UserTask } from '../../types/task';
import { getTaskDeadlineStatus, formatDisplayDate } from '../../utils/dates';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { CategoryIcon } from '../common/CategoryIcon';
import { AdviceCard } from './AdviceCard';
import { WeatherCard } from './WeatherCard';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';
import { TaskChecklist } from './TaskChecklist';

interface TaskDetailPanelProps {
  task: UserTask | null;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
  onToggleStatus: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onAddNewTask: () => void;
  // Subtasks actions
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  // Advice widget props
  advice: string | null;
  isAdviceLoading: boolean;
  adviceError: string | null;
  onRefreshAdvice: () => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFavorite,
  onAddNewTask,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  advice,
  isAdviceLoading,
  adviceError,
  onRefreshAdvice,
}) => {
  // If no task selected, show tasteful empty state
  if (!task) {
    return (
      <aside
        aria-label="Task Details Panel"
        className="h-full min-h-0 flex flex-col justify-between gap-3 lg:overflow-hidden"
      >
        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center py-10 px-6 text-center">
          {/* Decorative Vector Graphic */}
          <div className="w-12 h-12 rounded-2xl bg-peach-100 dark:bg-[#24140E] flex items-center justify-center text-brand-500 mb-2.5 shadow-sm">
            <Sparkles className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F5F5F5]">
            No Task Selected
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#808080] max-w-xs mt-1 mb-3.5 leading-relaxed">
            Choose a task to view its details.
          </p>
          <button
            type="button"
            onClick={onAddNewTask}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#292929] bg-white dark:bg-[#181818] hover:bg-slate-50 dark:hover:bg-[#202020] text-charcoal-900 dark:text-[#F5F5F5] text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>Create New Task</span>
          </button>
        </div>

        {/* Companion Utilities: Weather & Daily Advice (Standalone cards on open canvas) */}
        <div className="shrink-0 space-y-3">
          <WeatherCard />
          <AdviceCard
            advice={advice}
            isLoading={isAdviceLoading}
            error={adviceError}
            onRefresh={onRefreshAdvice}
          />
        </div>
      </aside>
    );
  }

  const isCompleted = task.status === 'Completed';
  const deadline = getTaskDeadlineStatus(task.dueDate, isCompleted);
  const displayDueDate = formatDisplayDate(task.dueDate);

  // Context-aware alert messaging derived strictly from real dates
  const getAlertContent = () => {
    if (isCompleted) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" aria-hidden="true" />,
        message: 'Task completed — commitment successfully finished.',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300',
      };
    }

    switch (deadline.state) {
      case 'overdue':
        return {
          icon: <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />,
          message: `Overdue since ${displayDueDate} — high attention required.`,
          bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300',
        };
      case 'due-today':
        return {
          icon: <Clock className="w-4 h-4 shrink-0 text-amber-500" aria-hidden="true" />,
          message: 'Due today — prioritized for immediate completion.',
          bg: 'bg-amber-50 dark:bg-[#24140E] border-amber-200 dark:border-brand-900/40 text-amber-900 dark:text-brand-300',
        };
      case 'upcoming':
        return {
          icon: <Clock className="w-4 h-4 shrink-0 text-brand-500" aria-hidden="true" />,
          message: `Due tomorrow (${displayDueDate}) — finish remaining steps.`,
          bg: 'bg-peach-100/60 dark:bg-[#24140E] border-peach-200 dark:border-brand-900/40 text-brand-700 dark:text-brand-300',
        };
      case 'normal':
      case 'none':
      default:
        return {
          icon: <Clock className="w-4 h-4 shrink-0 text-slate-400 dark:text-[#808080]" aria-hidden="true" />,
          message: task.dueDate ? `Due date scheduled for ${displayDueDate}.` : 'No due date set for this task.',
          bg: 'bg-slate-50 dark:bg-[#181818] border-slate-200/80 dark:border-[#292929] text-slate-700 dark:text-[#B0B0B0]',
        };
    }
  };

  const alertContent = getAlertContent();

  return (
    <aside
      aria-label="Selected Task Details Panel"
      className="h-full min-h-0 flex flex-col justify-between gap-3 lg:overflow-hidden"
    >
      {/* Integrated Task Detail Panel Surface */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#111111] border border-slate-200/70 dark:border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
        {/* Scrollable Main Content of Task Details */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
          {/* Integrated Category Context Strip */}
          <div className="flex items-center space-x-2.5 pb-0.5">
            <div className="w-8 h-8 rounded-xl bg-peach-100 dark:bg-[#24140E] border border-brand-200/50 dark:border-brand-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <CategoryIcon category={task.category} className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Task Workspace
              </span>
              <p className="text-[11px] text-slate-400 dark:text-[#808080] font-medium leading-none mt-0.5">
                Active Commitment
              </p>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5] leading-snug">
              {task.title}
            </h2>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <CategoryBadge category={task.category} />
              <PriorityBadge priority={task.priority} />
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                {task.status}
              </span>
              {task.favorite && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                  <span>Favorite</span>
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Context Alert */}
          <div
            className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs font-medium ${alertContent.bg}`}
          >
            {alertContent.icon}
            <span className="leading-snug">{alertContent.message}</span>
          </div>

          {/* Description / Summary block */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#262626] text-xs text-slate-600 dark:text-[#B0B0B0] space-y-1.5">
            <p className="font-semibold text-charcoal-900 dark:text-[#F5F5F5]">
              Assignment Details
            </p>
            <p className="leading-relaxed">
              Priority is set to <strong className="font-semibold text-charcoal-900 dark:text-[#F5F5F5]">{task.priority}</strong> under <strong className="font-semibold text-charcoal-900 dark:text-[#F5F5F5]">{task.category}</strong>. {task.dueDate ? `Scheduled for completion by ${displayDueDate}.` : 'No specific due date assigned.'}
            </p>
          </div>

          {/* Subtasks / Checklist Section */}
          {onAddSubtask && onToggleSubtask && onUpdateSubtask && onDeleteSubtask && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-100 dark:border-[#262626]">
              <TaskChecklist
                taskId={task.id}
                subtasks={task.subtasks}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onUpdateSubtask={onUpdateSubtask}
                onDeleteSubtask={onDeleteSubtask}
              />
            </div>
          )}

          {/* Primary Interactive Actions */}
          <div className="pt-1 flex items-center gap-2">
            {/* Quick Complete / Reopen Button */}
            <button
              type="button"
              onClick={() => onToggleStatus(task.id)}
              className={`flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                isCompleted
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-[#181818] dark:hover:bg-[#202020] text-slate-800 dark:text-[#F5F5F5] border border-slate-200 dark:border-[#292929]'
                  : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25'
              }`}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reopen Task</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Mark Completed</span>
                </>
              )}
            </button>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(task.id)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center min-w-[42px] min-h-[42px] focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  task.favorite
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                    : 'border-slate-200 dark:border-[#292929] hover:bg-slate-100 dark:hover:bg-[#181818] text-slate-700 dark:text-[#B0B0B0]'
                }`}
                title={task.favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={
                  task.favorite
                    ? `Remove "${task.title}" from favorites`
                    : `Add "${task.title}" to favorites`
                }
                aria-pressed={Boolean(task.favorite)}
              >
                <Star
                  className={`w-4 h-4 transition-transform ${
                    task.favorite ? 'fill-amber-500 text-amber-500 scale-105' : 'fill-none text-current'
                  }`}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-[#292929] hover:bg-slate-100 dark:hover:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] transition-colors"
              title="Edit task details"
              aria-label="Edit task details"
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Companion Utilities: Weather & Daily Advice (Standalone cards on open canvas) */}
      <div className="shrink-0 space-y-3">
        <WeatherCard />
        <AdviceCard
          advice={advice}
          isLoading={isAdviceLoading}
          error={adviceError}
          onRefresh={onRefreshAdvice}
        />
      </div>
    </aside>
  );
};
