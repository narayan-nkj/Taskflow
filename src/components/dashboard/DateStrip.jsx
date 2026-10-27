import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatLocalYmd } from '../../utils/dates';

export const DateStrip = ({
  selectedDate,
  onSelectDate,
  tasks,
}) => {
  // Base date for the 7-day strip window (defaults to today's week)
  const [windowOffsetDays, setWindowOffsetDays] = useState(0);

  // Today's date in local YYYY-MM-DD
  const todayStr = useMemo(() => formatLocalYmd(new Date()), []);

  // Compute 7 days centered/starting from the offset
  const dateTiles = useMemo(() => {
    const today = new Date();
    // Start window from Monday of the current week adjusted by windowOffsetDays
    const currentDayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday + windowOffsetDays);

    const tiles = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const ymd = formatLocalYmd(d);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      // Count tasks due on this date
      const taskCount = tasks.filter((t) => t.dueDate === ymd).length;

      tiles.push({
        date: d,
        ymd,
        weekday,
        dayNum,
        monthName,
        taskCount,
        isToday: ymd === todayStr,
      });
    }
    return tiles;
  }, [windowOffsetDays, tasks, todayStr]);

  // Current month displayed in header (prioritize selected date, fallback to center of week)
  const currentMonthLabel = useMemo(() => {
    if (selectedDate) {
      const selectedTile = dateTiles.find((t) => t.ymd === selectedDate);
      if (selectedTile) {
        return selectedTile.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }
    if (dateTiles.length === 0) return '';
    const centerDate = dateTiles[3]?.date || dateTiles[0].date;
    return centerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate, dateTiles]);

  const handlePrevWeek = () => {
    setWindowOffsetDays((prev) => prev - 7);
  };

  const handleNextWeek = () => {
    setWindowOffsetDays((prev) => prev + 7);
  };

  const handleResetToToday = () => {
    setWindowOffsetDays(0);
    onSelectDate(todayStr);
  };

  const handleTileClick = (ymd) => {
    if (selectedDate === ymd) {
      // Toggle off when clicking the active date to see all tasks
      onSelectDate(null);
    } else {
      onSelectDate(ymd);
    }
  };

  return (
    <section aria-labelledby="calendar-strip-heading" className="w-full space-y-2">
      <h2 id="calendar-strip-heading" className="sr-only">
        Calendar Date Filter
      </h2>

      {/* Month label row with navigation chevrons */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-brand-500 tracking-tight">
            {currentMonthLabel}
          </span>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1 rounded-lg text-slate-400 hover:text-charcoal-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Previous week"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1 rounded-lg text-slate-400 hover:text-charcoal-900 dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#181818] transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Next week"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Shortcuts: Today or Clear Date Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={handleResetToToday}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
              selectedDate === todayStr
                ? 'text-brand-600 dark:text-brand-400 bg-peach-100/60 dark:bg-[#24140E]'
                : 'text-slate-600 dark:text-[#B0B0B0] hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-[#181818]'
            }`}
            aria-label="Today"
            title="Filter to today's tasks"
          >
            Today
          </button>
          {selectedDate && (
            <button
              type="button"
              onClick={() => onSelectDate(null)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-peach-100 dark:bg-[#24140E] text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-peach-200 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Clear date filter and view all tasks"
              title="Clear date filter and view all tasks"
            >
              <span>All Dates</span>
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Row of 7 horizontal date tiles */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dateTiles.map((tile) => {
          const isSelected = selectedDate === tile.ymd;
          return (
            <button
              key={tile.ymd}
              type="button"
              onClick={() => handleTileClick(tile.ymd)}
              className={`flex flex-col items-center justify-center py-2 px-1 sm:py-2.5 rounded-2xl transition-all text-center relative focus-visible:ring-2 focus-visible:ring-brand-500 min-h-[58px] sm:min-h-[62px] ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-[#292929] text-charcoal-900 dark:text-[#F5F5F5] hover:border-brand-500/40 shadow-sm'
              }`}
              aria-pressed={isSelected}
              aria-label={`${tile.weekday}, ${tile.monthName} ${tile.dayNum}${
                tile.isToday ? ' (Today)' : ''
              }${tile.taskCount > 0 ? `, ${tile.taskCount} tasks due` : ''}`}
            >
              {/* Weekday abbreviation */}
              <span
                className={`text-[10px] sm:text-xs font-semibold tracking-tight ${
                  isSelected ? 'text-white' : 'text-slate-400 dark:text-[#808080]'
                }`}
              >
                {tile.weekday}
              </span>

              {/* Day numeral */}
              <span
                className={`text-sm sm:text-base font-bold mt-0.5 ${
                  isSelected ? 'text-white' : 'text-charcoal-900 dark:text-[#F5F5F5]'
                }`}
              >
                {tile.dayNum}
              </span>

              {/* Task due indicator dot */}
              {tile.taskCount > 0 && (
                <span
                  className={`mt-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-brand-500'
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
