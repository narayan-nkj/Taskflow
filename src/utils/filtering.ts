import { UserTask, TaskFiltersState } from '../types/task';

export const DEFAULT_FILTERS: TaskFiltersState = {
  search: '',
  category: 'All',
  priority: 'All',
  status: 'All',
  sortBy: 'dueDate-asc',
  favoritesOnly: false,
};

/**
 * Checks whether any search query or category/priority/status/favorites filter is actively applied.
 * Excludes sorting, as sorting merely re-orders and does not filter out tasks.
 */
export function hasActiveFilters(filters: TaskFiltersState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.priority !== 'All' ||
    filters.status !== 'All' ||
    Boolean(filters.favoritesOnly)
  );
}

/**
 * Checks whether the current sort option differs from the default sort.
 */
export function hasNonDefaultSort(filters: TaskFiltersState): boolean {
  return filters.sortBy !== DEFAULT_FILTERS.sortBy;
}

/**
 * Checks whether any filter or sort control has been modified from default.
 */
export function hasAnyActiveControls(filters: TaskFiltersState): boolean {
  return hasActiveFilters(filters) || hasNonDefaultSort(filters);
}

/**
 * Counts how many filter dimensions (excluding sort) are actively filtering results.
 */
export function getActiveFilterCount(filters: TaskFiltersState): number {
  let count = 0;
  if (filters.search.trim() !== '') count++;
  if (filters.category !== 'All') count++;
  if (filters.priority !== 'All') count++;
  if (filters.status !== 'All') count++;
  if (filters.favoritesOnly) count++;
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
    // Favorites-only filter
    if (filters.favoritesOnly && !task.favorite) {
      return false;
    }

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
