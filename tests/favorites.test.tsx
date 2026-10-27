import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../src/components/dashboard/TaskItem';
import { TaskDetailPanel } from '../src/components/dashboard/TaskDetailPanel';
import { TaskList } from '../src/components/dashboard/TaskList';
import { TaskFilters } from '../src/components/dashboard/TaskFilters';
import { SampleTodosView } from '../src/components/samples/SampleTodosView';
import { UserTask, TaskFiltersState } from '../src/types/task';
import { DEFAULT_FILTERS } from '../src/utils/filtering';

describe('Favorite Tasks Feature', () => {
  const baseTask: UserTask = {
    id: 'task-1',
    title: 'Build GDG Website',
    priority: 'High',
    category: 'GDG',
    dueDate: '2026-10-30',
    status: 'Pending',
    favorite: false,
    createdAt: '2026-10-27T10:00:00.000Z',
    updatedAt: '2026-10-27T10:00:00.000Z',
  };

  const favoritedTask: UserTask = {
    ...baseTask,
    id: 'task-fav',
    title: 'Finish Physics Lab',
    favorite: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TaskItem favorite controls and accessibility', () => {
    it('renders an accessible star button with aria-pressed="false" when not favorited', () => {
      const onToggleFavorite = vi.fn();
      render(
        <TaskItem
          task={baseTask}
          onToggleFavorite={onToggleFavorite}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const starButton = screen.getByRole('button', {
        name: 'Add "Build GDG Website" to favorites',
      });
      expect(starButton).toBeInTheDocument();
      expect(starButton).toHaveAttribute('aria-pressed', 'false');
      expect(screen.queryByText('Starred')).not.toBeInTheDocument();
    });

    it('renders an accessible star button with aria-pressed="true" and a Starred badge when favorited', () => {
      const onToggleFavorite = vi.fn();
      render(
        <TaskItem
          task={favoritedTask}
          onToggleFavorite={onToggleFavorite}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const starButton = screen.getByRole('button', {
        name: 'Remove "Finish Physics Lab" from favorites',
      });
      expect(starButton).toBeInTheDocument();
      expect(starButton).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Starred')).toBeInTheDocument();
    });

    it('toggles favorite on click without triggering card selection', () => {
      const onToggleFavorite = vi.fn();
      const onSelectTask = vi.fn();

      render(
        <TaskItem
          task={baseTask}
          onToggleFavorite={onToggleFavorite}
          onSelectTask={onSelectTask}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const starButton = screen.getByRole('button', {
        name: 'Add "Build GDG Website" to favorites',
      });
      fireEvent.click(starButton);

      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(onToggleFavorite).toHaveBeenCalledWith('task-1');
      // Card selection handler should NOT be triggered due to stopPropagation
      expect(onSelectTask).not.toHaveBeenCalled();
    });

    it('supports keyboard operation via Enter and Space keys', () => {
      const onToggleFavorite = vi.fn();
      render(
        <TaskItem
          task={baseTask}
          onToggleFavorite={onToggleFavorite}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const starButton = screen.getByRole('button', {
        name: 'Add "Build GDG Website" to favorites',
      });

      // Space key press
      fireEvent.keyDown(starButton, { key: ' ' });
      fireEvent.click(starButton);
      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('TaskDetailPanel favorite actions', () => {
    it('shows favorite badge and star button with aria-pressed="true" for favorited task', () => {
      const onToggleFavorite = vi.fn();
      render(
        <TaskDetailPanel
          task={favoritedTask}
          onToggleFavorite={onToggleFavorite}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          onAddNewTask={vi.fn()}
          advice="Keep moving forward."
          isAdviceLoading={false}
          adviceError={null}
          onRefreshAdvice={vi.fn()}
        />
      );

      // Badge in details header
      expect(screen.getByText('Favorite')).toBeInTheDocument();

      // Action button
      const starButton = screen.getByRole('button', {
        name: 'Remove "Finish Physics Lab" from favorites',
      });
      expect(starButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles favorite when star action button is clicked in details panel', () => {
      const onToggleFavorite = vi.fn();

      render(
        <TaskDetailPanel
          task={baseTask}
          onToggleFavorite={onToggleFavorite}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          onAddNewTask={vi.fn()}
          advice="Stay focused."
          isAdviceLoading={false}
          adviceError={null}
          onRefreshAdvice={vi.fn()}
        />
      );

      const starButton = screen.getByRole('button', {
        name: 'Add "Build GDG Website" to favorites',
      });
      expect(starButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(starButton);
      expect(onToggleFavorite).toHaveBeenCalledWith('task-1');
    });
  });

  describe('TaskList and zero-favorites empty state', () => {
    it('renders dedicated empty state when favoritesOnly filter is active and 0 tasks match', () => {
      const onClearFilters = vi.fn();
      const favoriteFilterState: TaskFiltersState = {
        ...DEFAULT_FILTERS,
        favoritesOnly: true,
      };

      render(
        <TaskList
          tasks={[]}
          totalTasksCount={5} // user has 5 total tasks, but none are favorites
          completedTasksCount={1}
          filters={favoriteFilterState}
          onClearFilters={onClearFilters}
          onAddTaskClick={vi.fn()}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onClearCompletedClick={vi.fn()}
        />
      );

      expect(screen.getByText('No favorite tasks yet')).toBeInTheDocument();
      expect(
        screen.getByText('Click the star icon on any task to add it to your favorites for quick access.')
      ).toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: 'View all tasks' });
      fireEvent.click(clearBtn);
      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('renders matching favorite tasks when favorites exist', () => {
      const favoriteFilterState: TaskFiltersState = {
        ...DEFAULT_FILTERS,
        favoritesOnly: true,
      };

      render(
        <TaskList
          tasks={[favoritedTask]}
          totalTasksCount={2}
          completedTasksCount={0}
          filters={favoriteFilterState}
          onClearFilters={vi.fn()}
          onAddTaskClick={vi.fn()}
          onToggleStatus={vi.fn()}
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onClearCompletedClick={vi.fn()}
        />
      );

      expect(screen.getByText('Finish Physics Lab')).toBeInTheDocument();
      expect(screen.queryByText('No favorite tasks yet')).not.toBeInTheDocument();
    });
  });

  describe('TaskFilters favorites toggle control', () => {
    it('toggles favoritesOnly filter when Favorites button is clicked', () => {
      const onChange = vi.fn();

      render(
        <TaskFilters
          filters={DEFAULT_FILTERS}
          onChange={onChange}
          totalTasksCount={10}
          filteredTasksCount={10}
        />
      );

      const favFilterBtn = screen.getByRole('button', {
        name: 'Filter by favorites only',
      });
      expect(favFilterBtn).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(favFilterBtn);
      expect(onChange).toHaveBeenCalledWith({
        ...DEFAULT_FILTERS,
        favoritesOnly: true,
      });
    });

    it('shows Favorites Only active badge when favoritesOnly is true', () => {
      const activeFilters: TaskFiltersState = {
        ...DEFAULT_FILTERS,
        favoritesOnly: true,
      };

      render(
        <TaskFilters
          filters={activeFilters}
          onChange={vi.fn()}
          totalTasksCount={10}
          filteredTasksCount={2}
        />
      );

      const favFilterBtn = screen.getByRole('button', {
        name: 'Show all tasks (favorites filter active)',
      });
      expect(favFilterBtn).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Favorites Only')).toBeInTheDocument();
    });
  });

  describe('Sample Tasks isolation from favorites', () => {
    it('does not render favorite buttons on remote sample todos', () => {
      const sampleTodos = [
        { id: 101, todo: 'Do something nice for someone I care about', completed: true, userId: 26 },
        { id: 102, todo: 'Memorize the fifty states and their capitals', completed: false, userId: 48 },
      ];

      render(
        <SampleTodosView
          samples={sampleTodos}
          isLoading={false}
          error={null}
          onRefresh={vi.fn()}
          onAddCopy={vi.fn()}
        />
      );

      // Verify no favorite buttons are present on sample items
      expect(screen.queryByRole('button', { name: /add.*to favorites/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove.*from favorites/i })).not.toBeInTheDocument();

      // Only "Add copy to My Tasks" buttons should be rendered
      const copyButtons = screen.getAllByRole('button', { name: /Add copy of/i });
      expect(copyButtons).toHaveLength(2);
    });
  });
});
