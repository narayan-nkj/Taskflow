import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DatePickerPopover } from '../common/DatePickerPopover';
import { UserTask, TaskPriority, TaskCategory, TaskStatus } from '../../types/task';
import { validateTaskInput, TaskFormErrors, VALID_PRIORITIES, VALID_CATEGORIES, VALID_STATUSES } from '../../utils/validation';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    priority: TaskPriority;
    category: TaskCategory;
    dueDate: string | null;
    status: TaskStatus;
  }) => void;
  taskToEdit?: UserTask | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
}) => {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Personal');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [errors, setErrors] = useState<TaskFormErrors>({});

  // Prefill or reset when opening/changing taskToEdit
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setPriority(taskToEdit.priority);
        setCategory(taskToEdit.category);
        setDueDate(taskToEdit.dueDate || '');
        setStatus(taskToEdit.status);
      } else {
        // Defaults for new task
        setTitle('');
        setPriority('Medium');
        setCategory('Personal');
        setDueDate('');
        setStatus('Pending');
      }
      setErrors({});
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedDueDate = dueDate.trim() ? dueDate.trim() : null;
    const validation = validateTaskInput({
      title,
      priority,
      category,
      dueDate: normalizedDueDate,
      status,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit({
      title: title.trim(),
      priority,
      category,
      dueDate: normalizedDueDate,
      status,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={
        isEditing
          ? 'Update details, priority, category, or status for this task.'
          : 'Capture a commitment across GDG, Academics, or Personal life.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Title Input */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-slate-700 dark:text-[#F5F5F5] mb-1"
          >
            Task Title <span className="text-rose-500" aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g. Prepare GDG Android workshop slides"
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181818] border rounded-xl text-charcoal-900 dark:text-[#F5F5F5] placeholder-slate-400 dark:placeholder:text-[#808080] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 transition-all ${
              errors.title
                ? 'border-rose-400 focus:ring-rose-500'
                : 'border-slate-300 dark:border-[#292929] focus:ring-brand-500'
            }`}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            autoFocus
          />
          {errors.title && (
            <p id="task-title-error" className="mt-1 text-xs text-rose-500">
              {errors.title}
            </p>
          )}
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label
              htmlFor="task-category"
              className="block text-sm font-medium text-slate-700 dark:text-[#F5F5F5] mb-1"
            >
              Category
            </label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-[#292929] rounded-xl text-charcoal-900 dark:text-[#F5F5F5] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
            >
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-slate-700 dark:text-[#F5F5F5] mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-[#292929] rounded-xl text-charcoal-900 dark:text-[#F5F5F5] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
            >
              {VALID_PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri} Priority
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="task-duedate"
                className="block text-sm font-medium text-slate-700 dark:text-[#F5F5F5]"
              >
                Due Date
              </label>
              <span className="text-xs text-slate-400 dark:text-[#808080]">Optional</span>
            </div>
            <DatePickerPopover
              id="task-duedate"
              value={dueDate}
              onChange={(newDate) => {
                setDueDate(newDate);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
              }}
              hasError={Boolean(errors.dueDate)}
            />
            {errors.dueDate && (
              <p id="task-duedate-error" className="mt-1 text-xs text-rose-500">
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="task-status"
              className="block text-sm font-medium text-slate-700 dark:text-[#F5F5F5] mb-1"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-[#292929] rounded-xl text-charcoal-900 dark:text-[#F5F5F5] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer"
            >
              {VALID_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-[#292929]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#F5F5F5] bg-slate-100 dark:bg-[#181818] hover:bg-slate-200 dark:hover:bg-[#202020] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 border border-slate-200/60 dark:border-[#292929]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-sm shadow-brand-500/30 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
