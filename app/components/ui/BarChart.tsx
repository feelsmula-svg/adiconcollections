import { cn } from "./cn";

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  valueFormatter?: (value: number) => string;
  ariaLabel?: string;
  className?: string;
}

const VIEW_WIDTH = 600;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 12;
const GRID_LINES = 4;

function defaultFormatter(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toString();
}

export function BarChart({
  data,
  height = 240,
  valueFormatter = defaultFormatter,
  ariaLabel = "Bar chart",
  className,
}: BarChartProps) {
  const max = data.reduce((m, d) => (d.value > m ? d.value : m), 0);
  const safeMax = max > 0 ? max : 1;
  const innerWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const slot = data.length > 0 ? innerWidth / data.length : innerWidth;
  const barWidth = Math.max(4, slot * 0.6);

  const gridLines = Array.from({ length: GRID_LINES + 1 }, (_, i) => {
    const ratio = i / GRID_LINES;
    return {
      y: PADDING_TOP + innerHeight * (1 - ratio),
      value: safeMax * ratio,
    };
  });

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      preserveAspectRatio="none"
      className={cn("w-full block", className)}
      style={{ height }}
    >
      {gridLines.map((line) => (
        <g key={line.y}>
          <line
            x1={PADDING_LEFT}
            x2={VIEW_WIDTH - PADDING_RIGHT}
            y1={line.y}
            y2={line.y}
            className="stroke-outline-variant"
            strokeWidth={1}
            strokeDasharray={line.value === 0 ? undefined : "3 4"}
          />
          <text
            x={PADDING_LEFT - 8}
            y={line.y + 4}
            textAnchor="end"
            className="fill-on-surface-variant text-[10px] font-label-caps"
          >
            {valueFormatter(line.value)}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const ratio = d.value / safeMax;
        const barHeight = innerHeight * ratio;
        const x = PADDING_LEFT + slot * i + (slot - barWidth) / 2;
        const y = PADDING_TOP + innerHeight - barHeight;
        return (
          <g key={`${d.label}-${i}`}>
            <title>{`${d.label}: ${valueFormatter(d.value)}`}</title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(0, barHeight)}
              rx={4}
              ry={4}
              className="fill-primary"
              opacity={0.85}
            />
            <text
              x={PADDING_LEFT + slot * i + slot / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-on-surface-variant text-[10px] font-label-caps"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
