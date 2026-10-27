import React from 'react';
import { TaskFiltersState, SortOption, TaskCategory, TaskPriority, TaskStatus } from '../../types/task';
import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  hasNonDefaultSort,
  hasAnyActiveControls,
  getActiveFilterCount,
} from '../../utils/filtering';
import { Search, RotateCcw, X, Filter, Star } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (updated: TaskFiltersState) => void;
  totalTasksCount: number;
  filteredTasksCount: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  totalTasksCount,
  filteredTasksCount,
}) => {
  const isFiltered = hasActiveFilters(filters);
  const isSortModified = hasNonDefaultSort(filters);
  const anyControlsActive = hasAnyActiveControls(filters);
  const activeCount = getActiveFilterCount(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleClearSearch = () => {
    onChange({ ...filters, search: '' });
  };

  const handleToggleFavorites = () => {
    onChange({ ...filters, favoritesOnly: !filters.favoritesOnly });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, category: e.target.value as TaskCategory | 'All' });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value as TaskPriority | 'All' });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value as TaskStatus | 'All' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as SortOption });
  };

  const handleResetFilters = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] shadow-sm">
      {/* Top row: Search input & Favorites toggle & Clear/Reset button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-[#808080]">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search tasks by title..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-xl text-sm text-charcoal-900 dark:text-[#F5F5F5] placeholder-slate-400 dark:placeholder:text-[#808080] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[42px]"
            aria-label="Search tasks"
          />
          {filters.search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] min-w-[40px] min-h-[40px]"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Favorites Only filter button */}
        <button
          type="button"
          onClick={handleToggleFavorites}
          aria-pressed={Boolean(filters.favoritesOnly)}
          className={`inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 min-h-[40px] border ${
            filters.favoritesOnly
              ? 'bg-amber-100 dark:bg-[#281c0e] text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 shadow-xs'
              : 'bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-[#202020] text-slate-700 dark:text-[#B0B0B0] border-slate-200 dark:border-[#292929]'
          }`}
          aria-label={filters.favoritesOnly ? 'Show all tasks (favorites filter active)' : 'Filter by favorites only'}
          title={filters.favoritesOnly ? 'Show all tasks' : 'Filter by favorites only'}
        >
          <Star
            className={`w-3.5 h-3.5 mr-1.5 ${
              filters.favoritesOnly
                ? 'fill-amber-500 text-amber-500'
                : 'fill-none text-slate-400 dark:text-[#808080]'
            }`}
            aria-hidden="true"
          />
          <span>Favorites</span>
        </button>

        {/* Clear Filters / Reset Sort button */}
        {anyControlsActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0 min-h-[40px]"
            aria-label={isFiltered ? `Clear ${activeCount} active filters` : 'Reset sort to default'}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            {isFiltered ? `Clear filters (${activeCount})` : 'Reset sort'}
          </button>
        )}
      </div>

      {/* Filter and Sort Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="sr-only">
            Filter by Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-lg text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[38px]"
          >
            <option value="All">All Categories</option>
            <option value="GDG">GDG</option>
            <option value="Academics">Academics</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="filter-priority" className="sr-only">
            Filter by Priority
          </label>
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={handlePriorityChange}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-lg text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[38px]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-lg text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[38px]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="filter-sortby" className="sr-only">
            Sort Tasks By
          </label>
          <select
            id="filter-sortby"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-lg text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[38px]"
          >
            <option value="dueDate-asc">Due Date (Earliest First)</option>
            <option value="dueDate-desc">Due Date (Latest First)</option>
            <option value="priority-high-low">Priority (High to Low)</option>
            <option value="priority-low-high">Priority (Low to High)</option>
            <option value="newest">Created (Newest First)</option>
            <option value="oldest">Created (Oldest First)</option>
            <option value="title-asc">Title (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Active filter and sort badges indicator */}
      {(isFiltered || isSortModified) && (
        <div className="flex items-center flex-wrap gap-1.5 pt-2 text-xs text-slate-500 dark:text-[#808080]">
          {isFiltered && (
            <span className="inline-flex items-center font-medium">
              <Filter className="w-3 h-3 mr-1" aria-hidden="true" />
              Filtered: {filteredTasksCount} of {totalTasksCount} tasks
            </span>
          )}

          {filters.search.trim() && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] border border-slate-200/60 dark:border-[#292929]">
              Query: "{filters.search.trim()}"
            </span>
          )}

          {filters.category !== 'All' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] border border-slate-200/60 dark:border-[#292929]">
              Category: {filters.category}
            </span>
          )}

          {filters.priority !== 'All' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] border border-slate-200/60 dark:border-[#292929]">
              Priority: {filters.priority}
            </span>
          )}

          {filters.status !== 'All' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] border border-slate-200/60 dark:border-[#292929]">
              Status: {filters.status}
            </span>
          )}

          {filters.favoritesOnly && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
              <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" aria-hidden="true" />
              Favorites Only
            </span>
          )}

          {isSortModified && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181818] text-slate-700 dark:text-[#B0B0B0] border border-slate-200/60 dark:border-[#292929]">
              Sort: Custom
            </span>
          )}
        </div>
      )}
    </div>
  );
};
