import React from 'react';

interface LoadingScreenProps {
  isDark?: boolean;
  message?: string;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isDark = false,
  message = 'Loading workspace...',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-label={message}
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 select-none transition-opacity duration-200 ${
        isDark
          ? 'bg-[#0B0B0B] text-[#F5F5F5]'
          : 'bg-[#FAFAFA] text-[#171717]'
      } ${className}`}
    >
      <div className="flex flex-col items-center space-y-3.5 text-center">
        {/* Brand Vector Icon with brief pulse */}
        <div className="w-10 h-10 rounded-xl bg-peach-100 dark:bg-[#24140E] text-brand-500 flex items-center justify-center shadow-sm">
          <svg
            viewBox="0 0 16 16"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
          </svg>
        </div>

        {/* Minimal accessible spinner */}
        <div
          className="w-5 h-5 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin"
          aria-hidden="true"
        />

        <p className="text-xs font-medium text-slate-500 dark:text-[#808080] tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
