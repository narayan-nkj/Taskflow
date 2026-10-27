import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([aria-hidden="true"]), ' +
  '[href]:not([aria-hidden="true"]), ' +
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), ' +
  'select:not([disabled]):not([aria-hidden="true"]), ' +
  'textarea:not([disabled]):not([aria-hidden="true"]), ' +
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  hideCloseButton = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management and Escape key handling
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus first enabled interactive element or fall back to modal surface
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const autoFocusElement = dialogRef.current.querySelector<HTMLElement>('[autofocus]:not([disabled]):not([aria-hidden="true"])');
          const firstEnabledInput = dialogRef.current.querySelector<HTMLElement>(
            'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]), textarea:not([disabled]):not([aria-hidden="true"]), select:not([disabled]):not([aria-hidden="true"])'
          );
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

          if (autoFocusElement) {
            autoFocusElement.focus();
          } else if (firstEnabledInput) {
            firstEnabledInput.focus();
          } else if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            // Safe fallback focus target on the dialog surface
            dialogRef.current.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }

        // Focus trap
        if (e.key === 'Tab' && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
          if (focusable.length === 0) {
            e.preventDefault();
            dialogRef.current.focus();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || document.activeElement === dialogRef.current) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface with tabIndex={-1} for fallback focus */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClass} bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#292929] overflow-hidden transform transition-all z-10 focus:outline-none`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#292929]">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-charcoal-900 dark:text-[#F5F5F5]">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-slate-500 dark:text-[#808080] mt-0.5">
                {description}
              </p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-charcoal-900 dark:text-[#808080] dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
