import React, { useState, useRef } from 'react';
import { Subtask } from '../../types/task';
import { getSubtaskProgress, validateSubtaskTitle } from '../../utils/subtasks';
import { Check, Plus, Edit2, Trash2, X, CheckSquare } from 'lucide-react';

interface TaskChecklistProps {
  taskId: string;
  subtasks?: Subtask[];
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  compact?: boolean;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  taskId,
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  compact = false,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const progress = getSubtaskProgress(subtasks);

  const handleAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validation = validateSubtaskTitle(newTitle);
    if (!validation.isValid) {
      setAddError(validation.error || 'Title cannot be blank');
      return;
    }

    onAddSubtask(taskId, validation.trimmed);
    setNewTitle('');
    setAddError(null);
    if (addInputRef.current) {
      addInputRef.current.focus();
    }
  };

  const handleStartEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
    setEditError(null);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 50);
  };

  const handleSaveEdit = (subtaskId: string) => {
    const validation = validateSubtaskTitle(editingTitle);
    if (!validation.isValid) {
      setEditError(validation.error || 'Title cannot be blank');
      return;
    }

    onUpdateSubtask(taskId, subtaskId, validation.trimmed);
    setEditingId(null);
    setEditingTitle('');
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditError(null);
  };

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Checklist Header & Progress Bar (when at least one subtask exists) */}
      {subtasks.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-[#E0E0E0]">
            <div className="flex items-center space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
              <span>Checklist</span>
            </div>
            <span
              className={`tabular-nums ${
                progress.isAllCompleted
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-[#A3A3A3]'
              }`}
            >
              {progress.summaryLabel}
            </span>
          </div>

          {/* Progress Bar Track */}
          <div
            className="w-full h-1.5 bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Checklist progress: ${progress.summaryLabel}`}
          >
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                progress.isAllCompleted ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist Item List */}
      {subtasks.length > 0 && (
        <ul className="space-y-1.5" aria-label="Subtasks checklist">
          {subtasks.map((sub) => {
            const isEditingThis = editingId === sub.id;

            return (
              <li
                key={sub.id}
                className={`group flex items-center justify-between gap-2 p-2 rounded-xl transition-colors border ${
                  sub.completed
                    ? 'bg-slate-50/70 dark:bg-[#141414] border-slate-200/50 dark:border-[#222222]'
                    : 'bg-white dark:bg-[#161616] border-slate-200/80 dark:border-[#262626]'
                }`}
              >
                {/* When Editing */}
                {isEditingThis ? (
                  <div className="flex-1 flex flex-col space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => {
                          setEditingTitle(e.target.value);
                          if (editError) setEditError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(sub.id);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelEdit();
                          }
                        }}
                        maxLength={120}
                        aria-label={`Edit title for subtask ${sub.title}`}
                        className="flex-1 px-2 py-1 text-xs sm:text-sm bg-white dark:bg-[#111111] border border-brand-500 rounded-lg text-charcoal-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(sub.id)}
                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus-visible:ring-2 focus-visible:ring-emerald-500"
                        aria-label={`Save title for subtask ${sub.title}`}
                        title="Save changes"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-[#202020] focus-visible:ring-2 focus-visible:ring-slate-500"
                        aria-label="Cancel editing"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {editError && (
                      <p className="text-[11px] text-rose-500 pl-1">{editError}</p>
                    )}
                  </div>
                ) : (
                  /* Normal Checklist Row */
                  <>
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {/* Accessible Checkbox */}
                      <button
                        type="button"
                        onClick={() => onToggleSubtask(taskId, sub.id)}
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0 ${
                          sub.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'border-slate-300 dark:border-[#383838] hover:border-brand-500 bg-white dark:bg-[#181818] text-transparent'
                        }`}
                        aria-label={
                          sub.completed
                            ? `Mark "${sub.title}" incomplete`
                            : `Mark "${sub.title}" complete`
                        }
                      >
                        <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                      </button>

                      {/* Subtask Title */}
                      <span
                        className={`text-xs sm:text-sm break-words leading-tight ${
                          sub.completed
                            ? 'line-through text-slate-400 dark:text-[#7A7A7A]'
                            : 'text-charcoal-900 dark:text-[#F5F5F5]'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>

                    {/* Action Buttons (Always accessible, visible on focus/hover) */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sub)}
                        className="p-1 text-slate-400 hover:text-brand-500 dark:text-[#808080] dark:hover:text-brand-400 rounded-md hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={`Edit subtask "${sub.title}"`}
                        title="Edit subtask"
                      >
                        <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSubtask(taskId, sub.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:text-[#808080] dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                        aria-label={`Delete subtask "${sub.title}"`}
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Add Subtask Form / Calm Affordance */}
      {isAdding || subtasks.length > 0 ? (
        <form onSubmit={handleAddSubmit} className="space-y-1">
          <div className="flex items-center space-x-2">
            <input
              ref={addInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (addError) setAddError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && subtasks.length === 0) {
                  setIsAdding(false);
                }
              }}
              placeholder="Add a checklist item..."
              maxLength={120}
              aria-label="New subtask title"
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] rounded-xl text-charcoal-900 dark:text-[#F5F5F5] placeholder-slate-400 dark:placeholder-[#737373] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Add subtask"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>
          {addError && (
            <p className="text-[11px] text-rose-500 pl-1">{addError}</p>
          )}
        </form>
      ) : (
        /* Calm Empty State Affordance (no huge distracting panel) */
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setTimeout(() => addInputRef.current?.focus(), 50);
          }}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 py-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>Add checklist item</span>
        </button>
      )}
    </div>
  );
};

export default TaskChecklist;
