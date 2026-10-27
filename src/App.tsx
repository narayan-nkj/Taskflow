import { useState, useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { useTasks } from './hooks/useTasks';
import { useAdvice } from './hooks/useAdvice';
import { useSampleTodos } from './hooks/useSampleTodos';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { StatCards } from './components/dashboard/StatCards';
import { AdviceCard } from './components/dashboard/AdviceCard';
import { TaskFilters } from './components/dashboard/TaskFilters';
import { TaskList } from './components/dashboard/TaskList';
import { TaskFormModal } from './components/dashboard/TaskFormModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ImportModal } from './components/transfer/ImportModal';
import { SampleTodosView } from './components/samples/SampleTodosView';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { UserTask, TaskPriority, TaskCategory, TaskStatus, TaskFiltersState } from './types/task';
import { SampleTodo } from './types/api';
import { DEFAULT_FILTERS, filterTasks } from './utils/filtering';
import { sortTasks } from './utils/sorting';
import { calculateStatistics } from './utils/statistics';
import { exportTasksAsJson, ImportResult } from './services/importExport';
import { AlertCircle, Plus, Calendar as CalendarIcon } from 'lucide-react';

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
    tasks,
    storageNotice,
    dismissStorageNotice,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleTaskStatus,
    setTaskStatus,
    clearCompletedTasks,
    setAllTasks,
  } = useTasks();

  const { advice, isLoading: isAdviceLoading, error: adviceError, refresh: refreshAdvice } = useAdvice();
  const {
    samples,
    isLoading: isSamplesLoading,
    error: samplesError,
    refresh: refreshSamples,
  } = useSampleTodos();

  // Navigation tab: 'tasks' (Dashboard/My Tasks) | 'samples' (Sample Tasks from DummyJSON)
  const [currentTab, setCurrentTab] = useState<'tasks' | 'samples'>('tasks');

  // Search, Filters & Sorting state
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UserTask | null>(null);

  const [deleteCandidate, setDeleteCandidate] = useState<UserTask | null>(null);
  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, action?: { label: string; onClick: () => void }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, action }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Derive statistics from user-owned tasks only
  const statistics = useMemo(() => calculateStatistics(tasks), [tasks]);

  // Filter and sort user tasks deterministically
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return sortTasks(filtered, filters.sortBy);
  }, [tasks, filters]);

  // Current formatted date for header context
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Handlers for task form
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: UserTask) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (data: {
    title: string;
    priority: TaskPriority;
    category: TaskCategory;
    dueDate: string | null;
    status: TaskStatus;
  }) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, data);
      addToast('success', `Updated task "${data.title}"`);
    } else {
      addTask(data);
      addToast('success', `Created task "${data.title}"`);
    }
  };

  // Delete flow with deliberate confirmation & undo toast
  const handlePromptDelete = (task: UserTask) => {
    setDeleteCandidate(task);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const removed = deleteTask(deleteCandidate.id);
    if (removed) {
      addToast('info', `Deleted "${removed.title}"`, {
        label: 'Undo',
        onClick: () => {
          restoreTask(removed);
          addToast('success', `Restored "${removed.title}"`);
        },
      });
    }
    setDeleteCandidate(null);
  };

  // Clear completed tasks flow
  const handleConfirmClearCompleted = () => {
    const count = clearCompletedTasks();
    if (count > 0) {
      addToast('success', `Cleared ${count} completed user ${count === 1 ? 'task' : 'tasks'}.`);
    }
  };

  // Export tasks as JSON
  const handleExportJson = () => {
    const ok = exportTasksAsJson(tasks);
    if (ok) {
      addToast('success', `Exported ${tasks.length} user ${tasks.length === 1 ? 'task' : 'tasks'} as JSON.`);
    } else {
      addToast('error', 'Failed to generate JSON export file.');
    }
  };

  // Import tasks success handler
  const handleImportSuccess = (result: ImportResult) => {
    setAllTasks(result.mergedTasks);
    const collisionMsg = result.collisionCount > 0 ? ` (${result.collisionCount} ID collisions safely assigned new IDs)` : '';
    addToast('success', `Successfully imported and merged ${result.importedCount} tasks${collisionMsg}!`);
  };

  // Copy sample todo to user tasks
  const handleAddSampleCopy = (sample: SampleTodo) => {
    addTask({
      title: sample.todo,
      category: 'Personal',
      priority: 'Medium',
      dueDate: null,
      status: 'Pending',
    });
    addToast('success', `Copied "${sample.todo}" into your Personal tasks.`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onAddTask={handleOpenCreateModal}
        onExport={handleExportJson}
        onImport={() => setIsImportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userTasksCount={tasks.length}
      />

      {/* Mobile Header */}
      <MobileHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onAddTask={handleOpenCreateModal}
        onExport={handleExportJson}
        onImport={() => setIsImportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userTasksCount={tasks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Storage / Corruption Warning Banner */}
        {storageNotice && (
          <div
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-3 text-amber-800 dark:text-amber-200 text-sm animate-in fade-in"
            role="alert"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold">Storage Notice</p>
                <p className="text-xs sm:text-sm mt-0.5 opacity-90">{storageNotice}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissStorageNotice}
              className="px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View 1: Main Dashboard / My Tasks */}
        {currentTab === 'tasks' && (
          <div className="space-y-6">
            {/* Greeting Header & Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                  <span>{currentDateFormatted}</span>
                  <span>•</span>
                  <span>GDG BPPIMT Tech Team</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Student Productivity Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-2 sm:self-center">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm shadow-sm shadow-brand-600/30 transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" aria-hidden="true" />
                  Add Task
                </button>
              </div>
            </div>

            {/* 4 Statistics Overview Cards */}
            <StatCards stats={statistics} />

            {/* Daily Advice Inspiration Widget */}
            <AdviceCard
              advice={advice}
              isLoading={isAdviceLoading}
              error={adviceError}
              onRefresh={refreshAdvice}
            />

            {/* Task Search, Filters and Sorting */}
            <TaskFilters
              filters={filters}
              onChange={setFilters}
              totalTasksCount={tasks.length}
              filteredTasksCount={filteredAndSortedTasks.length}
            />

            {/* Task List (Normal list, Empty dashboard, or Filtered-empty) */}
            <TaskList
              tasks={filteredAndSortedTasks}
              totalTasksCount={tasks.length}
              filters={filters}
              completedTasksCount={statistics.completed}
              onAddTaskClick={handleOpenCreateModal}
              onClearFilters={() => setFilters(DEFAULT_FILTERS)}
              onToggleStatus={toggleTaskStatus}
              onStatusChange={setTaskStatus}
              onEdit={handleOpenEditModal}
              onDelete={handlePromptDelete}
              onClearCompletedClick={() => setIsClearCompletedOpen(true)}
            />
          </div>
        )}

        {/* View 2: Sample Tasks from DummyJSON */}
        {currentTab === 'samples' && (
          <SampleTodosView
            samples={samples}
            isLoading={isSamplesLoading}
            error={samplesError}
            onRefresh={refreshSamples}
            onAddCopy={handleAddSampleCopy}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      {/* 1. Task Editor Modal (Create/Edit) */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        taskToEdit={taskToEdit}
      />

      {/* 2. Delete Single Task Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteCandidate?.title}"? You will be able to undo this immediately.`}
        confirmLabel="Delete Task"
        isDestructive={true}
      />

      {/* 3. Clear All Completed Tasks Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearCompletedOpen}
        onClose={() => setIsClearCompletedOpen(false)}
        onConfirm={handleConfirmClearCompleted}
        title="Clear Completed Tasks"
        message={`This will permanently remove ${statistics.completed} completed task${
          statistics.completed === 1 ? '' : 's'
        } from your workspace. Incomplete tasks and API samples will not be affected.`}
        confirmLabel={`Clear ${statistics.completed} Tasks`}
        isDestructive={true}
      />

      {/* 4. Import JSON Backup Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingTasks={tasks}
        onImportSuccess={handleImportSuccess}
      />

      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
