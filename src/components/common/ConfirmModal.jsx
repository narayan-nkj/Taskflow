import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-full shrink-0 ${
              isDestructive
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-amber-100 text-amber-600 dark:bg-[#24140E] dark:text-brand-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-600 dark:text-[#B0B0B0] leading-relaxed pt-0.5">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-[#292929]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#F5F5F5] bg-slate-100 dark:bg-[#181818] hover:bg-slate-200 dark:hover:bg-[#202020] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 border border-slate-200/60 dark:border-[#292929]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500 shadow-sm shadow-rose-600/20'
                : 'bg-brand-500 hover:bg-brand-600 text-white focus-visible:ring-brand-500 shadow-sm shadow-brand-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
