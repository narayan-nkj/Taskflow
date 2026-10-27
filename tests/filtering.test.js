import { describe, it, expect } from 'vitest';
import {
  filterTasks,
  DEFAULT_FILTERS,
  hasActiveFilters,
  hasNonDefaultSort,
  hasAnyActiveControls,
  getActiveFilterCount,
} from '../src/utils/filtering';

describe('filtering utilities & sorting separation', () => {
  const sampleTasks = [
    {
      id: '1',
      title: 'Build GDG Website',
      priority: 'High',
      category: 'GDG',
      dueDate: '2026-10-28',
      status: 'Pending',
      createdAt: '2026-10-27T01:00:00Z',
      updatedAt: '2026-10-27T01:00:00Z',
    },
    {
      id: '2',
      title: 'Submit Math Assignment',
      priority: 'Medium',
      category: 'Academics',
      dueDate: '2026-10-29',
      status: 'In Progress',
      createdAt: '2026-10-27T02:00:00Z',
      updatedAt: '2026-10-27T02:00:00Z',
    },
    {
      id: '3',
      title: 'Buy Groceries',
      priority: 'Low',
      category: 'Personal',
      dueDate: null,
      status: 'Completed',
      createdAt: '2026-10-27T03:00:00Z',
      updatedAt: '2026-10-27T03:00:00Z',
    },
  ];

  describe('filterTasks', () => {
    it('filters by case-insensitive trimmed search query', () => {
      const filters = { ...DEFAULT_FILTERS, search: '  gdg  ' };
      const res = filterTasks(sampleTasks, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');
    });

    it('filters by category', () => {
      const filters = { ...DEFAULT_FILTERS, category: 'Academics' };
      const res = filterTasks(sampleTasks, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('2');
    });

    it('filters by priority', () => {
      const filters = { ...DEFAULT_FILTERS, priority: 'High' };
      const res = filterTasks(sampleTasks, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');
    });

    it('filters by status', () => {
      const filters = { ...DEFAULT_FILTERS, status: 'Completed' };
      const res = filterTasks(sampleTasks, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('3');
    });

    it('composes multiple filters together over the same collection', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        category: 'GDG',
        priority: 'High',
        status: 'Pending',
      };
      const res = filterTasks(sampleTasks, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');

      const mismatch = {
        ...DEFAULT_FILTERS,
        category: 'GDG',
        priority: 'Low',
      };
      expect(filterTasks(sampleTasks, mismatch)).toHaveLength(0);
    });
  });

  describe('distinguishing sorting from active filters', () => {
    it('reports zero tasks with default sort as hasActiveFilters === false', () => {
      const emptyTasks = [];
      const filters = { ...DEFAULT_FILTERS };
      expect(hasActiveFilters(filters)).toBe(false);
      expect(hasNonDefaultSort(filters)).toBe(false);
      expect(filterTasks(emptyTasks, filters)).toHaveLength(0);
    });

    it('reports zero tasks with changed sort as hasActiveFilters === false, but hasNonDefaultSort === true', () => {
      const emptyTasks = [];
      const filters = { ...DEFAULT_FILTERS, sortBy: 'priority-high-low' };
      expect(hasActiveFilters(filters)).toBe(false); // Changing sort does NOT count as active filtering!
      expect(hasNonDefaultSort(filters)).toBe(true);
      expect(hasAnyActiveControls(filters)).toBe(true);
      expect(filterTasks(emptyTasks, filters)).toHaveLength(0);
    });

    it('correctly detects tasks present but no filter matches (hasActiveFilters === true)', () => {
      const filters = { ...DEFAULT_FILTERS, search: 'nonexistent-string' };
      expect(hasActiveFilters(filters)).toBe(true);
      const filtered = filterTasks(sampleTasks, filters);
      expect(filtered).toHaveLength(0);
      expect(getActiveFilterCount(filters)).toBe(1);
    });

    it('correctly detects tasks hidden by actual category/status filters', () => {
      const filters = {
        ...DEFAULT_FILTERS,
        category: 'GDG',
        status: 'Completed', // GDG task is Pending, so this hides all tasks
      };
      expect(hasActiveFilters(filters)).toBe(true);
      expect(getActiveFilterCount(filters)).toBe(2);
      expect(filterTasks(sampleTasks, filters)).toHaveLength(0);
    });

    it('filters strictly by favoritesOnly and updates active filter indicators', () => {
      const tasksWithFavorites = [
        { ...sampleTasks[0], favorite: true },
        { ...sampleTasks[1], favorite: false },
        { ...sampleTasks[2] }, // legacy without favorite property
      ];

      const filters = { ...DEFAULT_FILTERS, favoritesOnly: true };
      expect(hasActiveFilters(filters)).toBe(true);
      expect(getActiveFilterCount(filters)).toBe(1);

      const res = filterTasks(tasksWithFavorites, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');
    });

    it('composes favoritesOnly with category, priority, and search filters', () => {
      const tasksWithFavorites = [
        { ...sampleTasks[0], favorite: true }, // GDG, High
        { ...sampleTasks[1], favorite: true },  // Academics, Medium
        { ...sampleTasks[2], favorite: false }, // Personal, Low
      ];

      const filters = {
        ...DEFAULT_FILTERS,
        favoritesOnly: true,
        category: 'GDG',
      };
      const res = filterTasks(tasksWithFavorites, filters);
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('1');
      expect(getActiveFilterCount(filters)).toBe(2);
    });
  });
});
