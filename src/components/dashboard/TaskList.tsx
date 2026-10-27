import React from 'react';
import { UserTask, TaskStatus, TaskFiltersState } from '../../types/task';
import { TaskItem } from './TaskItem';
import { Plus, CheckCheck, Inbox, SearchX, SlidersHorizontal, Star } from 'lucide-react';

interface TaskListProps {
  tasks: UserTask[];
  totalTasksCount: number;
  filters: TaskFiltersState;
  completedTasksCount: number;
  sectionTitle?: string;
  selectedTaskId?: string | null;
  onSelectTask?: (task: UserTask) => void;
  onAddTaskClick: () => void;
  onClearFilters: () => void;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit: (task: UserTask) => void;
  onDelete: (task: UserTask) => void;
  onClearCompletedClick: () => void;
  onToggleFiltersToolbar?: () => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask?: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTasksCount,
  filters,
  completedTasksCount,
  sectionTitle = 'All Tasks',
  selectedTaskId = null,
  onSelectTask,
  onAddTaskClick,
  onClearFilters,
  onToggleStatus,
  onStatusChange,
  onToggleFavorite,
  onEdit,
  onDelete,
  onClearCompletedClick,
  onToggleFiltersToolbar,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}) => {
  // State 1: No user tasks created yet (Empty Dashboard)
  if (totalTasksCount === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 min-h-[220px] text-center">
        <div className="w-10 h-10 rounded-xl bg-peach-100 dark:bg-[#24140E] text-brand-500 flex items-center justify-center mb-2.5 shadow-sm">
          <Inbox className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F5F5F5] mb-1">
          No tasks captured yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#808080] max-w-xs mb-4 leading-relaxed">
          TaskFlow gives you one calm place to track assignments and personal deadlines.
        </p>
        <button
          type="button"
          onClick={onAddTaskClick}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" aria-hidden="true" />
          Create your first task
        </button>
      </div>
    );
  }

  // State 2: Filtered by favorites with no starred tasks
  if (filters.favoritesOnly && tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 min-h-[220px] text-center">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-2.5 shadow-sm">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" aria-hidden="true" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F5F5F5] mb-1">
          No favorite tasks yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#808080] max-w-xs mb-3.5 leading-relaxed">
          Click the star icon on any task to add it to your favorites for quick access.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-peach-100 dark:bg-[#24140E] hover:bg-peach-200 dark:hover:bg-[#2d1912] rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          View all tasks
        </button>
      </div>
    );
  }

  // State 3: Filtered or date-selected with no matching tasks
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 min-h-[220px] text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#181818] text-slate-400 dark:text-[#808080] flex items-center justify-center mb-2.5">
          <SearchX className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F5F5F5] mb-1">
          No tasks found for this view
        </h3>
        <p className="text-xs text-slate-500 dark:text-[#808080] max-w-xs mb-3.5 leading-relaxed">
          No tasks match your selected date or active search filters.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-peach-100 dark:bg-[#24140E] hover:bg-peach-200 dark:hover:bg-[#2d1912] rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          View all tasks
        </button>
      </div>
    );
  }

  // State 2: Normal list of tasks with header controls
  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-2.5 lg:overflow-hidden">
      {/* List Header: Section Title, filter toggle button, & Clear Completed (Stationary) */}
      <div className="shrink-0 flex items-center justify-between px-1 pb-1">
        <div className="flex items-center space-x-2.5">
          <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F5F5F5]">
            {sectionTitle}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-600 dark:text-[#B0B0B0]">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Optional Filter Toggle */}
          {onToggleFiltersToolbar && (
            <button
              type="button"
              onClick={onToggleFiltersToolbar}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-[#B0B0B0] hover:text-charcoal-900 dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818] rounded-lg transition-colors"
              title="Toggle filter dropdowns"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}

          {/* Clear All Completed button */}
          <button
            type="button"
            onClick={onClearCompletedClick}
            disabled={completedTasksCount === 0}
            className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
              completedTasksCount > 0
                ? 'text-slate-600 dark:text-[#B0B0B0] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#181818]'
                : 'text-slate-400 dark:text-[#808080] cursor-not-allowed opacity-60'
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
            <CheckCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span className="hidden sm:inline">Clear completed</span> ({completedTasksCount})
          </button>
        </div>
      </div>

      {/* Independently Scrollable Container for Task Cards */}
      <div
        className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar focus:outline-none"
        tabIndex={0}
        role="region"
        aria-label="Tasks list"
      >
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            onSelectTask={onSelectTask}
            onToggleStatus={onToggleStatus}
            onStatusChange={onStatusChange}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
          />
        ))}
      </div>
    </div>
  );
};
