import { UserTask, TaskFiltersState } from '../types/task';

export const DEFAULT_FILTERS: TaskFiltersState = {
  search: '',
  category: 'All',
  priority: 'All',
  status: 'All',
  sortBy: 'dueDate-asc',
};

/**
 * Checks whether any non-default filter or search query is currently applied.
 */
export function hasActiveFilters(filters: TaskFiltersState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.priority !== 'All' ||
    filters.status !== 'All' ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy
  );
}

/**
 * Counts how many filter dimensions are currently actively filtering results.
 */
export function getActiveFilterCount(filters: TaskFiltersState): number {
  let count = 0;
  if (filters.search.trim() !== '') count++;
  if (filters.category !== 'All') count++;
  if (filters.priority !== 'All') count++;
  if (filters.status !== 'All') count++;
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) count++;
  return count;
}

/**
 * Composes search and filter criteria over a UserTask list.
 */
export function filterTasks(
  tasks: readonly UserTask[],
  filters: TaskFiltersState
): UserTask[] {
  const query = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    // Search query filter (immediate case-insensitive title search)
    if (query && !task.title.toLowerCase().includes(query)) {
      return false;
    }

    // Category filter
    if (filters.category !== 'All' && task.category !== filters.category) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'All' && task.priority !== filters.priority) {
      return false;
    }

    // Status filter
    if (filters.status !== 'All' && task.status !== filters.status) {
      return false;
    }

    return true;
  });
}
