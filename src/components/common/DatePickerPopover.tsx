import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDisplayDate, formatLocalYmd, parseLocalDate } from '../../utils/dates';

interface DatePickerPopoverProps {
  value: string; // YYYY-MM-DD or empty string
  onChange: (dateStr: string) => void;
  id?: string;
  name?: string;
  ariaLabel?: string;
  hasError?: boolean;
}

export const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  value,
  onChange,
  id = 'task-duedate',
  ariaLabel = 'Due date picker',
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today's date in local calendar YYYY-MM-DD
  const todayStr = useMemo(() => formatLocalYmd(new Date()), []);

  // Currently viewed month & year in calendar grid
  const initialDate = useMemo(() => {
    if (value) {
      const parsed = parseLocalDate(value);
      if (parsed) return parsed;
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => initialDate.getMonth()); // 0-indexed

  // When value changes from external prop (e.g. editing task), synchronize viewed month
  useEffect(() => {
    if (value) {
      const parsed = parseLocalDate(value);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Month-Year heading string (e.g., "October 2026")
  const monthHeading = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewYear, viewMonth]);

  // Weekday labels starting Monday (consistent with TaskFlow week-start)
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Calendar cells generation (7 columns, 5-6 rows)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const dayOfWeek = firstDay.getDay(); // 0 is Sun, 1 is Mon...
    // Mon = 0 diff, Sun = 6 diff
    const leadingDaysCount = (dayOfWeek + 6) % 7;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // 1. Leading days from previous month
    for (let i = leadingDaysCount - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      days.push({
        dayNum,
        ymd: formatLocalYmd(prevDate),
        isCurrentMonth: false,
      });
    }

    // 2. Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(viewYear, viewMonth, i);
      days.push({
        dayNum: i,
        ymd: formatLocalYmd(curDate),
        isCurrentMonth: true,
      });
    }

    // 3. Trailing days from next month to complete rows (up to multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(viewYear, viewMonth + 1, i);
      days.push({
        dayNum: i,
        ymd: formatLocalYmd(nextDate),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (ymd: string) => {
    onChange(ymd);
    setIsOpen(false);
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSetToday = () => {
    onChange(todayStr);
    setViewYear(new Date().getFullYear());
    setViewMonth(new Date().getMonth());
    setIsOpen(false);
  };

  const handleSetTomorrow = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const tomorrowStr = formatLocalYmd(t);
    onChange(tomorrowStr);
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setIsOpen(false);
  };

  const displayLabel = value ? formatDisplayDate(value) : 'Select due date...';

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#181818] border rounded-xl text-left text-xs sm:text-sm text-charcoal-900 dark:text-[#F5F5F5] focus:bg-white dark:focus:bg-[#181818] focus:outline-none focus:ring-2 transition-all flex items-center justify-between gap-2 cursor-pointer ${
          hasError
            ? 'border-rose-400 focus:ring-rose-500'
            : isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20'
            : 'border-slate-300 dark:border-[#292929] hover:border-slate-400 dark:hover:border-[#383838] focus:ring-brand-500'
        }`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
          <span className={value ? 'font-medium' : 'text-slate-400 dark:text-[#808080]'}>
            {displayLabel}
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClearDate}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] hover:bg-slate-200 dark:hover:bg-[#252525] transition-colors"
            title="Clear due date"
            aria-label="Clear due date"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </button>

      {/* Custom Calendar Popover Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute z-50 mt-1.5 left-0 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#292929] rounded-2xl shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Month/Year and navigation arrows */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-[#202020]">
            <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-[#F5F5F5]">
              {monthHeading}
            </h4>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Weekday column headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-semibold text-slate-400 dark:text-[#808080] py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Date cells grid */}
          <div className="grid grid-cols-7 gap-1" role="grid">
            {calendarDays.map((cell) => {
              const isSelected = cell.ymd === value;
              const isToday = cell.ymd === todayStr;

              return (
                <button
                  key={cell.ymd}
                  type="button"
                  onClick={() => handleSelectDate(cell.ymd)}
                  className={`h-8 rounded-xl text-xs font-medium flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isSelected
                      ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25 scale-[1.02]'
                      : isToday
                      ? 'border border-brand-500 text-brand-600 dark:text-brand-400 font-bold hover:bg-peach-50 dark:hover:bg-[#24140E]'
                      : cell.isCurrentMonth
                      ? 'text-charcoal-900 dark:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#1f1f1f]'
                      : 'text-slate-300 dark:text-[#4a4a4a] hover:bg-slate-50 dark:hover:bg-[#181818]'
                  }`}
                  aria-selected={isSelected}
                  aria-label={cell.ymd}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick preset actions */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#202020] flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2 py-1 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-peach-100 dark:hover:bg-[#24140E] hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleSetTomorrow}
                className="px-2 py-1 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-peach-100 dark:hover:bg-[#24140E] hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors"
              >
                Tomorrow
              </button>
            </div>

            {value && (
              <button
                type="button"
                onClick={handleClearDate}
                className="px-2 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
