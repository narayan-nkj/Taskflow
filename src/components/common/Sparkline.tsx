import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string; // hex or CSS color
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#eb642e',
  width = 64,
  height = 26,
  className = '',
  ariaLabel,
}) => {
  const gradientId = useId();

  // Padding inside the SVG viewport
  const padX = 3;
  const padY = 3;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Single point or empty history: render honest flat baseline
  if (!data || data.length <= 1) {
    const singleVal = data && data.length === 1 ? data[0] : 0;
    const midY = height / 2;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`overflow-visible ${className}`}
        aria-hidden="true"
        role="img"
      >
        {ariaLabel && <title>{ariaLabel}</title>}
        {/* Subtle baseline */}
        <line
          x1={padX}
          y1={midY}
          x2={width - padX}
          y2={midY}
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="2 3"
          opacity="0.5"
        />
        {/* Marker at end */}
        <circle cx={width - padX} cy={midY} r="2.5" fill={color} />
        {/* Text for zero/single value */}
        <text
          x={padX}
          y={midY - 4}
          fill={color}
          fontSize="8"
          fontWeight="bold"
          opacity="0.75"
        >
          {singleVal}
        </text>
      </svg>
    );
  }

  // Multiple historical points: calculate normalized SVG coordinates
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const points = data.map((val, idx) => {
    const x = padX + (idx / (data.length - 1)) * innerW;
    const normalizedY = range === 0 ? 0.5 : (val - min) / range;
    const y = height - padY - normalizedY * innerH;
    return { x, y, val };
  });

  // Construct line path
  const linePath = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Construct closed area path for gradient
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      role="img"
    >
      {ariaLabel && <title>{ariaLabel}</title>}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Translucent fill */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Main trend line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current point indicator */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill={color}
        className="transition-all duration-200"
      />
    </svg>
  );
};
