import React from 'react';

interface PriorityDistributionBarProps {
  high: number;
  medium: number;
  low: number;
  totalPending?: number;
}

export const PriorityDistributionBar: React.FC<PriorityDistributionBarProps> = ({
  high,
  medium,
  low,
  totalPending = high + medium + low,
}) => {
  const maxVal = Math.max(high, medium, low, 1);
  const maxHeightPx = 20;
  const minHeightPx = 4;

  const getHeight = (val: number) => {
    if (val === 0) return minHeightPx;
    return Math.round(minHeightPx + (val / maxVal) * (maxHeightPx - minHeightPx));
  };

  const tooltipText =
    totalPending === 0
      ? 'No pending tasks'
      : `${high} High, ${medium} Medium, ${low} Low priority`;

  const items = [
    {
      label: 'H',
      count: high,
      color: 'bg-rose-500',
      title: `${high} High priority`,
    },
    {
      label: 'M',
      count: medium,
      color: 'bg-amber-500',
      title: `${medium} Medium priority`,
    },
    {
      label: 'L',
      count: low,
      color: 'bg-slate-400 dark:bg-[#707070]',
      title: `${low} Low priority`,
    },
  ];

  return (
    <div
      className="flex items-end space-x-1.5 shrink-0 select-none pb-0.5"
      title={tooltipText}
      role="img"
      aria-label={`Pending workload distribution: ${tooltipText}`}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div
            className={`w-2.5 rounded-sm ${item.color} transition-all duration-300 ease-out`}
            style={{ height: `${getHeight(item.count)}px` }}
            title={item.title}
          />
          <span className="text-[8px] font-bold text-slate-400 dark:text-[#808080] mt-0.5 leading-none">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
