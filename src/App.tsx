import { useState, useMemo, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useTasks } from './hooks/useTasks';
import { useAdvice } from './hooks/useAdvice';
import { useSampleTodos } from './hooks/useSampleTodos';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { TopBar } from './components/navigation/TopBar';
import { StatCards } from './components/dashboard/StatCards';
import { DateStrip } from './components/dashboard/DateStrip';
import { TaskFilters } from './components/dashboard/TaskFilters';
import { TaskList } from './components/dashboard/TaskList';
import { TaskDetailPanel } from './components/dashboard/TaskDetailPanel';
import { TaskFormModal } from './components/dashboard/TaskFormModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { ImportModal } from './components/transfer/ImportModal';
import { SampleTodosView } from './components/samples/SampleTodosView';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { useDeadlineAlerts } from './hooks/useDeadlineAlerts';
import { loadMetricHistory, recordMetricSnapshot, MetricSnapshot } from './utils/metricHistory';
import { UserTask, TaskPriority, TaskCategory, TaskStatus, TaskFiltersState } from './types/task';
import { SampleTodo } from './types/api';
import { DEFAULT_FILTERS, filterTasks } from './utils/filtering';
import { sortTasks } from './utils/sorting';
import { calculateStatistics } from './utils/statistics';
import { formatDisplayDate, formatLocalYmd } from './utils/dates';
import { exportTasksAsJson, ImportResult } from './services/importExport';
import { AlertCircle, Plus, Calendar as CalendarIcon, SlidersHorizontal } from 'lucide-react';

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

  // Today's date in local calendar format YYYY-MM-DD
  const todayYmd = useMemo(() => formatLocalYmd(new Date()), []);

  // Selected date filter (defaults to today's local date for daily dashboard focus)
  const [selectedDate, setSelectedDate] = useState<string | null>(todayYmd);

  // Selected task for right-side detail card
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Toggle state for compact filter & sort toolbar
  const [showFilterToolbar, setShowFilterToolbar] = useState<boolean>(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UserTask | null>(null);

  const [deleteCandidate, setDeleteCandidate] = useState<UserTask | null>(null);
  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'info',
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, action }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Derive statistics from user-owned tasks only
  const statistics = useMemo(() => calculateStatistics(tasks), [tasks]);

  // Metric snapshots history for mini-graphs in StatCards
  const [metricHistory, setMetricHistory] = useState<MetricSnapshot[]>(() => loadMetricHistory());

  useEffect(() => {
    const updated = recordMetricSnapshot(statistics, todayYmd);
    setMetricHistory(updated);
  }, [statistics, todayYmd]);

  // Deadline alerts and notification center
  const {
    alerts: deadlineAlerts,
    unseenCount: unseenAlertsCount,
    markAllSeen: markAllAlertsSeen,
    dismissAlert: dismissDeadlineAlert,
    clearAllAlerts: clearAllDeadlineAlerts,
    browserPermission,
    requestBrowserPermission,
  } = useDeadlineAlerts(tasks);

  // Filter and sort user tasks deterministically with date filtering
  const filteredAndSortedTasks = useMemo(() => {
    let result = filterTasks(tasks, filters);
    if (selectedDate) {
      result = result.filter((task) => task.dueDate === selectedDate);
    }
    return sortTasks(result, filters.sortBy);
  }, [tasks, filters, selectedDate]);

  // Keep a valid selected task in sync
  useEffect(() => {
    if (filteredAndSortedTasks.length > 0) {
      const stillExists = filteredAndSortedTasks.some((t) => t.id === selectedTaskId);
      if (!stillExists) {
        setSelectedTaskId(filteredAndSortedTasks[0].id);
      }
    } else {
      setSelectedTaskId(null);
    }
  }, [filteredAndSortedTasks, selectedTaskId]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Current formatted date for header context
  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Section title for TaskList
  const sectionTitle = useMemo(() => {
    if (selectedDate) {
      const display = formatDisplayDate(selectedDate);
      return display === 'Today' ? 'Today' : `Tasks for ${display}`;
    }
    return 'My Tasks';
  }, [selectedDate]);

  // Handlers for task form
  const handleOpenCreateModal = (presetDueDate?: string | null) => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
    // If a date is currently selected in date strip, we can preset it when creating a task
    if (presetDueDate && typeof presetDueDate === 'string') {
      setTaskToEdit({
        id: '',
        title: '',
        priority: 'Medium',
        category: 'Personal',
        dueDate: presetDueDate,
        status: 'Pending',
        createdAt: '',
        updatedAt: '',
      });
    }
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
    if (taskToEdit && taskToEdit.id) {
      updateTask(taskToEdit.id, data);
      addToast('success', `Updated task "${data.title}"`);
    } else {
      const created = addTask(data);
      setSelectedTaskId(created.id);
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
          setSelectedTaskId(removed.id);
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
    const collisionMsg =
      result.collisionCount > 0
        ? ` (${result.collisionCount} ID collisions safely assigned new IDs)`
        : '';
    addToast('success', `Successfully imported and merged ${result.importedCount} tasks${collisionMsg}!`);
  };

  // Copy sample todo to user tasks
  const handleAddSampleCopy = (sample: SampleTodo) => {
    const created = addTask({
      title: sample.todo,
      category: 'Personal',
      priority: 'Medium',
      dueDate: null,
      status: 'Pending',
    });
    setSelectedTaskId(created.id);
    addToast('success', `Copied "${sample.todo}" into your Personal tasks.`);
  };

  return (
    <div className="min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden w-full bg-[#F6F8FA] dark:bg-[#050505] text-charcoal-900 dark:text-[#F5F5F5] flex flex-col md:flex-row p-3 md:p-4 lg:p-5 gap-4 lg:gap-6 transition-colors duration-150">
      {/* Left: Black Capsule Navigation Rail (Desktop) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onAddTask={() => handleOpenCreateModal(selectedDate)}
        onExport={handleExportJson}
        onImport={() => setIsImportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userTasksCount={tasks.length}
      />

      {/* Mobile Header (Mobile only) */}
      <MobileHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onAddTask={() => handleOpenCreateModal(selectedDate)}
        onExport={handleExportJson}
        onImport={() => setIsImportModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userTasksCount={tasks.length}
      />

      {/* Workspace: Right of the Rail */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:h-full lg:overflow-hidden">
        {/* Top Bar: Search field & User profile / Notifications (Stationary) */}
        <div className="shrink-0">
          <TopBar
            searchQuery={filters.search}
            onSearchChange={(query) => setFilters((prev) => ({ ...prev, search: query }))}
            alerts={deadlineAlerts}
            unseenCount={unseenAlertsCount}
            onSelectTask={(taskId) => {
              setCurrentTab('tasks');
              setSelectedTaskId(taskId);
            }}
            onDismissAlert={dismissDeadlineAlert}
            onClearAllAlerts={clearAllDeadlineAlerts}
            onMarkAllSeen={markAllAlertsSeen}
            browserPermission={browserPermission}
            onRequestBrowserPermission={requestBrowserPermission}
          />
        </div>

          {/* Storage / Corruption Notice */}
          {storageNotice && (
            <div
              className="shrink-0 mt-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm animate-in fade-in"
              role="alert"
            >
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Storage Notice</p>
                  <p className="text-xs mt-0.5 opacity-90">{storageNotice}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissStorageNotice}
                className="px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main Working Area (Stationary shell on desktop) */}
          <main className="flex-1 min-w-0 min-h-0 pt-3 sm:pt-4 flex flex-col lg:overflow-hidden">
            {/* View 1: Main Dashboard / My Tasks */}
            {currentTab === 'tasks' && (
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] gap-5 lg:gap-6 items-stretch lg:h-full lg:overflow-hidden">
                {/* Left Content Column (Work space: Heading, stats, calendar, task list) */}
                <div className="space-y-3 sm:space-y-3.5 flex flex-col min-w-0 min-h-0 lg:h-full lg:overflow-hidden">
                  {/* Heading & Primary Action (Stationary) */}
                  <div className="shrink-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 dark:text-[#808080] mb-0.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                        <span>{currentDateFormatted}</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 dark:text-[#F5F5F5]">
                        My Tasks
                      </h1>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowFilterToolbar((prev) => !prev)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          showFilterToolbar
                            ? 'bg-peach-100 border-brand-500 text-brand-600 dark:bg-[#24140E] dark:text-brand-300 dark:border-brand-500'
                            : 'bg-white dark:bg-[#181818] border-slate-200 dark:border-[#292929] text-slate-600 dark:text-[#F5F5F5] hover:border-brand-500/50'
                        }`}
                        aria-expanded={showFilterToolbar}
                        aria-label="Toggle filters and sorting options"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Filters</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(selectedDate)}
                        className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Compact Statistic Cards + Completion Companion (Stationary) */}
                  <div className="shrink-0">
                    <StatCards stats={statistics} history={metricHistory} tasks={tasks} />
                  </div>

                  {/* Horizontal Month & 7-Day Date Strip (Stationary) */}
                  <div className="shrink-0">
                    <DateStrip
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      tasks={tasks}
                    />
                  </div>

                  {/* Collapsible / Expandable Filter & Sort Toolbar (Stationary when open) */}
                  {showFilterToolbar && (
                    <div className="shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
                      <TaskFilters
                        filters={filters}
                        onChange={setFilters}
                        totalTasksCount={tasks.length}
                        filteredTasksCount={filteredAndSortedTasks.length}
                      />
                    </div>
                  )}

                  {/* Vertical List of Task Cards (Independently scrollable container) */}
                  <div className="flex-1 min-h-0 flex flex-col min-w-0 lg:overflow-hidden">
                    <TaskList
                      tasks={filteredAndSortedTasks}
                      totalTasksCount={tasks.length}
                      filters={filters}
                      completedTasksCount={statistics.completed}
                      sectionTitle={sectionTitle}
                      selectedTaskId={selectedTaskId}
                      onSelectTask={(t) => setSelectedTaskId(t.id)}
                      onAddTaskClick={() => handleOpenCreateModal(selectedDate)}
                      onClearFilters={() => {
                        setFilters(DEFAULT_FILTERS);
                        setSelectedDate(null);
                      }}
                      onToggleStatus={toggleTaskStatus}
                      onStatusChange={setTaskStatus}
                      onEdit={handleOpenEditModal}
                      onDelete={handlePromptDelete}
                      onClearCompletedClick={() => setIsClearCompletedOpen(true)}
                      onToggleFiltersToolbar={() => setShowFilterToolbar((prev) => !prev)}
                    />
                  </div>
                </div>

                {/* Right Content Column: Large Detail Card (Controlled proportion, stationary container) */}
                <div className="flex flex-col min-h-0 lg:h-full min-w-0 lg:overflow-hidden">
                  <TaskDetailPanel
                    task={selectedTask}
                    onEdit={handleOpenEditModal}
                    onDelete={handlePromptDelete}
                    onToggleStatus={toggleTaskStatus}
                    onAddNewTask={() => handleOpenCreateModal(selectedDate)}
                    advice={advice}
                    isAdviceLoading={isAdviceLoading}
                    adviceError={adviceError}
                    onRefreshAdvice={refreshAdvice}
                  />
                </div>
              </div>
            )}

            {/* View 2: Sample Tasks from DummyJSON */}
            {currentTab === 'samples' && (
              <div className="flex-1 min-h-0 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">
                <SampleTodosView
                  samples={samples}
                  isLoading={isSamplesLoading}
                  error={samplesError}
                  onRefresh={refreshSamples}
                  onAddCopy={handleAddSampleCopy}
                />
              </div>
            )}
          </main>
        </div>

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
