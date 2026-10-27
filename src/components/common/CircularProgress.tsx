import React from 'react';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 36,
  strokeWidth = 3.5,
  color = '#10b981',
  label = 'Task completion rate',
}) => {
  const clamped = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`${Math.round(clamped)}% complete`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 dark:stroke-[#262626]"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Foreground Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Centered Percentage Label */}
      <span className="absolute text-[9px] font-bold text-charcoal-900 dark:text-[#F5F5F5] select-none">
        {Math.round(clamped)}%
      </span>
    </div>
  );
};
