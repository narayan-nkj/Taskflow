import React from 'react';
import { UserTask, TaskStatus, TaskFiltersState } from '../../types/task';
import { TaskItem } from './TaskItem';
import { hasActiveFilters } from '../../utils/filtering';
import { Plus, CheckCheck, Inbox, SearchX } from 'lucide-react';

interface TaskListProps {
  tasks: UserTask[];
  totalTasksCount: number;
  filters: TaskFiltersState;
  completedTasksCount: number;
  onAddTaskClick: () => void;
  onClearFilters: () => void;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
  onClearCompletedClick: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  filters,
  completedTasksCount,
  onAddTaskClick,
  onClearFilters,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onClearCompletedClick,
}) => {
  const isFiltering = hasActiveFilters(filters);

  // State 1: No user tasks created yet (Empty Dashboard)
  if (totalTasksCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
          <Inbox className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          No tasks captured yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          TaskFlow gives you one calm place to track assignments, GDG projects, and personal deadlines.
        </p>
        <button
          type="button"
          onClick={onAddTaskClick}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm shadow-brand-600/30 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Create your first task
        </button>
      </div>
    );
  }

  // State 3: Filtered with no matches
  if (tasks.length === 0 && isFiltering) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <SearchX className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          No matching tasks found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">
          No tasks match your current filter and search criteria.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Clear active filters
        </button>
      </div>
    );
  }

  // State 2: Normal list of tasks with header controls
  return (
    <div className="space-y-3">
      {/* List Header: Task count & Clear All Completed action */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>

        {/* Clear All Completed button */}
        <button
          type="button"
          onClick={onClearCompletedClick}
          disabled={completedTasksCount === 0}
          className={`inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
            completedTasksCount > 0
              ? 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
          title={
            completedTasksCount > 0
              ? `Clear ${completedTasksCount} completed user tasks`
              : 'No completed user tasks to clear'
          }
          aria-label={
            completedTasksCount > 0
              ? `Clear ${completedTasksCount} completed tasks`
              : 'No completed tasks'
          }
        >
          <CheckCheck className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Clear completed ({completedTasksCount})
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
