import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isDark?: boolean;
  isFadingOut?: boolean;
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isDark = false,
  isFadingOut = false,
  onComplete,
}) => {
  const [progress, setProgress] = useState<number>(1);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setProgress(100);
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // Cinematic 1-100 count progression at a deliberate, cinematic pace (~2.6s)
    let current = 1;
    let timerId: ReturnType<typeof setTimeout>;

    const tick = () => {
      current += 1;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        timerId = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 250);
        return;
      }

      setProgress(current);

      // Deliberate cinematic pacing:
      // 1-20: initial ramp (28ms per step)
      // 21-70: cruising speed (20ms per step)
      // 71-92: slight deceleration for dramatic weight (28ms per step)
      // 93-100: deliberate final stabilization steps (50ms per step)
      let delay = 22;
      if (current <= 20) delay = 28;
      else if (current <= 70) delay = 20;
      else if (current <= 92) delay = 28;
      else delay = 50;

      timerId = setTimeout(tick, delay);
    };

    timerId = setTimeout(tick, 30);

    return () => {
      clearTimeout(timerId);
    };
  }, [onComplete]);

  // Stage labels corresponding to initialization milestone ranges
  const getStageLabel = (val: number): string => {
    if (val < 25) return 'SYNCHRONIZING ENVIRONMENT';
    if (val < 55) return 'RESTORING WORKSPACE STATE';
    if (val < 85) return 'OPTIMIZING PERFORMANCE';
    if (val < 100) return 'FINALIZING INTERFACE';
    return 'WORKSPACE READY';
  };

  const displayNumber = progress < 10 ? `0${progress}` : `${progress}`;

  return (
    <div
      role="status"
      aria-label="Loading TaskFlow workspace"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col justify-between p-6 sm:p-10 md:p-12 overflow-hidden select-none transition-opacity duration-300 ease-out ${
        isDark
          ? 'bg-[#050505] bg-gradient-to-b from-[#050505] via-[#0B0B0B] to-[#000000] text-[#F5F5F5]'
          : 'bg-[#F8FAFC] bg-gradient-to-b from-[#F8FAFC] via-[#F4F5F7] to-[#EAECEF] text-[#171717]'
      } ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* 1. Fine Film Grain Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
        data-testid="film-grain"
      />

      {/* 2. Architectural Corner Crop Ticks */}
      <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-neutral-400/30 dark:border-neutral-700/50 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-neutral-400/30 dark:border-neutral-700/50 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-neutral-400/30 dark:border-neutral-700/50 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-neutral-400/30 dark:border-neutral-700/50 pointer-events-none" aria-hidden="true" />

      {/* 3. Top Editorial Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 shrink-0">
        {/* Left: TaskFlow Minimal Brand Mark & Coordinates */}
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
            <svg
              viewBox="0 0 16 16"
              className="w-3 h-3 text-white"
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
          <div className="flex items-center space-x-2 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-neutral-500 dark:text-[#808080]">
            <span className="font-semibold text-neutral-700 dark:text-[#E5E5E5]">TaskFlow</span>
            <span className="text-neutral-400 dark:text-[#404040]">//</span>
            <span className="hidden sm:inline">IN MOTION</span>
          </div>
        </div>

        {/* Right: Thin Uppercase Editorial Phrase with Chevrons */}
        <div className="flex items-center space-x-2 font-mono text-[9px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-neutral-500 dark:text-[#A3A3A3] text-right">
          <span>THE ART OF GETTING THINGS DONE</span>
          <span className="text-brand-500 font-bold tracking-tighter" aria-hidden="true">
            ›››
          </span>
        </div>
      </header>

      {/* 4. Main Body: Asymmetric Cinematic Typography Composition */}
      <main className="relative z-10 flex-1 flex flex-col justify-center min-h-0 my-auto py-6 sm:py-8">
        {/* Enormous Background/Anchor Numeral (1-100) */}
        <div
          className="absolute right-0 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          <div
            className="text-neutral-900/[0.08] dark:text-white/[0.88] text-[clamp(6.5rem,22vw,22rem)] font-black leading-none tracking-tighter tabular-nums"
            style={{
              textShadow: isDark
                ? '0 0 80px rgba(0,0,0,0.9), 0 0 3px rgba(255,255,255,0.1)'
                : '0 0 60px rgba(0,0,0,0.05)',
            }}
          >
            {displayNumber}
          </div>
        </div>

        {/* Foreground Content: Title, Brackets, and Subtitles */}
        <div className="relative z-10 max-w-xl space-y-4">
          {/* Status Badge & Accent Pulse */}
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded border border-neutral-300/40 dark:border-[#262626] bg-neutral-200/30 dark:bg-[#111111]/80 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-neutral-600 dark:text-[#A3A3A3]">
              {getStageLabel(progress)}
            </span>
          </div>

          {/* Central Editorial Title with Brackets */}
          <div className="space-y-1.5">
            <h1 className="text-base sm:text-xl md:text-2xl font-light tracking-[0.3em] sm:tracking-[0.4em] uppercase text-neutral-800 dark:text-[#F5F5F5] flex flex-wrap items-center">
              <span className="text-brand-500 font-mono text-xl sm:text-2xl mr-2 font-normal" aria-hidden="true">
                &#123;
              </span>
              <span>PREPARING YOUR WORKSPACE</span>
              <span className="text-brand-500 font-mono text-xl sm:text-2xl ml-2 font-normal" aria-hidden="true">
                &#125;
              </span>
            </h1>

            <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-neutral-500 dark:text-[#808080]">
              Student Productivity Dashboard
            </p>
          </div>

          {/* Hairline Divider Rule with Geometric Crosshair */}
          <div className="flex items-center space-x-2 pt-2">
            <div className="w-20 sm:w-28 h-[1px] bg-neutral-300 dark:bg-[#262626]" />
            <span className="font-mono text-[10px] text-neutral-400 dark:text-[#525252] select-none">+</span>
            <div className="w-10 h-[1px] bg-neutral-300 dark:bg-[#262626]" />
          </div>

          {/* Accessible Screen Reader Message */}
          <p className="sr-only">Preparing your workspace... {progress}% completed</p>
        </div>
      </main>

      {/* 5. Bottom Architectural Footer Bar & Readiness Indicator */}
      <footer className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0 pt-4 border-t border-neutral-300/30 dark:border-[#1F1F1F]">
        {/* Left: Metric Coordinates & Stage Label */}
        <div className="flex items-center space-x-4 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase text-neutral-500 dark:text-[#808080]">
          <span className="text-neutral-800 dark:text-[#D4D4D4] font-semibold tabular-nums">
            [ {displayNumber} // 100 ]
          </span>
          <span className="hidden md:inline text-neutral-400 dark:text-[#525252]">|</span>
          <span className="hidden md:inline">SYSTEM STATE: NOMINAL</span>
        </div>

        {/* Center/Right: Hairline Progress Track */}
        <div className="flex flex-col sm:items-end space-y-1.5 w-full sm:w-64 md:w-80">
          <div className="flex items-center justify-between w-full font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-neutral-400 dark:text-[#737373]">
            <span>INITIALIZATION</span>
            <span className="text-brand-500 font-semibold tabular-nums">{progress}%</span>
          </div>

          <div
            className="w-full h-1 bg-neutral-200 dark:bg-[#171717] rounded-full overflow-hidden relative"
            aria-hidden="true"
          >
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-[#f78d58] rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoadingScreen;
