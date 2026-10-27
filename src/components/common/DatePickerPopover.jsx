import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { formatDisplayDate, formatLocalYmd, parseLocalDate } from '../../utils/dates';

export const DatePickerPopover = ({
  value,
  onChange,
  id = 'task-duedate',
  ariaLabel = 'Due date picker',
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);

  // Position coordinates for portal floating popover
  const [coords, setCoords] = useState({});

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

  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

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

  // Position calculation to guarantee zero clipping and smart placement
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const triggerRect = containerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 24);
    const popoverHeight = 340; // Full calendar height with weekday header, grid, and presets

    // If screen height is severely constrained, center in viewport with backdrop
    if (window.innerHeight < 460 || window.innerWidth < 360) {
      setCoords({ isCenter: true });
      return;
    }

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    let top;
    let bottom;

    // Prefer opening below if enough room; if not, open above the input field
    if (spaceBelow >= popoverHeight + 10 || spaceBelow >= spaceAbove) {
      top = triggerRect.bottom + 6;
    } else {
      bottom = window.innerHeight - triggerRect.top + 6;
    }

    // Horizontal alignment clamped within viewport
    let left = triggerRect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popoverWidth - 12);
    }
    if (left < 12) {
      left = 12;
    }

    setCoords({ top, bottom, left, isCenter: false });
  }, []);

  // Recalculate position on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleReposition = () => updatePosition();
      window.addEventListener('resize', handleReposition);
      window.addEventListener('scroll', handleReposition, true);
      return () => {
        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('scroll', handleReposition, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on outside click (inspecting both trigger container and portaled popover)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const target = e.target;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, [isOpen]);

  // Close on Escape key (capture phase stops modal dismissal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
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

  const handleSelectDate = (ymd) => {
    onChange(ymd);
    setIsOpen(false);
  };

  const handleClearDate = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSetYesterday = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterdayStr = formatLocalYmd(y);
    onChange(yesterdayStr);
    setViewYear(y.getFullYear());
    setViewMonth(y.getMonth());
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

  // The calendar popover card rendered inside portal
  const popoverContent = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Calendar date picker"
      className="w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#292929] rounded-2xl shadow-2xl p-3.5 select-none animate-in fade-in zoom-in-95 duration-150"
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
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
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

      {/* Date cells grid - Fully interactive without internal scrollbar */}
      <div className="grid grid-cols-7 gap-1" role="grid">
        {calendarDays.map((cell) => {
          const isSelected = cell.ymd === value;
          const isToday = cell.ymd === todayStr;

          return (
            <button
              key={cell.ymd}
              type="button"
              onClick={() => handleSelectDate(cell.ymd)}
              className={`h-8 rounded-xl text-xs font-medium flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer ${
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

      {/* Quick preset actions: Supports past (Yesterday), today, tomorrow, and clear */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#202020] flex items-center justify-between text-[11px] gap-1">
        <div className="flex items-center space-x-1 flex-wrap">
          <button
            type="button"
            onClick={handleSetYesterday}
            className="px-2 py-1 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-peach-100 dark:hover:bg-[#24140E] hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors cursor-pointer"
            title="Set due date to yesterday"
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={handleSetToday}
            className="px-2 py-1 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-peach-100 dark:hover:bg-[#24140E] hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors cursor-pointer"
            title="Set due date to today"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleSetTomorrow}
            className="px-2 py-1 rounded-lg text-slate-600 dark:text-[#B0B0B0] hover:bg-peach-100 dark:hover:bg-[#24140E] hover:text-brand-600 dark:hover:text-brand-400 font-semibold transition-colors cursor-pointer"
            title="Set due date to tomorrow"
          >
            Tomorrow
          </button>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClearDate}
            className="px-2 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer shrink-0"
            title="Clear due date"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input Wrapper */}
      <div
        className={`w-full bg-slate-50 dark:bg-[#181818] border rounded-xl text-left text-xs sm:text-sm text-charcoal-900 dark:text-[#F5F5F5] transition-all flex items-center justify-between gap-1 ${
          hasError
            ? 'border-rose-400 ring-2 ring-rose-500/20'
            : isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-[#181818]'
            : 'border-slate-300 dark:border-[#292929] hover:border-slate-400 dark:hover:border-[#383838]'
        }`}
      >
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex-1 px-3.5 py-2.5 flex items-center space-x-2.5 truncate cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl text-left"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <CalendarIcon className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
          <span className={`truncate ${value ? 'font-medium' : 'text-slate-400 dark:text-[#808080]'}`}>
            {displayLabel}
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={handleClearDate}
            className="mr-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#F5F5F5] hover:bg-slate-200 dark:hover:bg-[#252525] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
            title="Clear due date"
            aria-label="Clear due date"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Portaled Calendar Popover to escape all modal overflow-hidden & scroll clipping boundaries */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          coords.isCenter ? (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/40 backdrop-blur-[2px]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
              }}
            >
              {popoverContent}
            </div>
          ) : (
            <div
              style={{
                position: 'fixed',
                top: coords.top !== undefined ? `${coords.top}px` : undefined,
                bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
                left: `${coords.left ?? 12}px`,
                zIndex: 70,
              }}
            >
              {popoverContent}
            </div>
          ),
          document.body
        )}
    </div>
  );
};
