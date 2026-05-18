import type { ReactNode } from "react";
import { cn } from "./cn";

type Align = "start" | "end";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  align?: Align;
  width?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  caption?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
}

const ALIGN: Record<Align, string> = {
  start: "text-left",
  end: "text-right",
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  className,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-surface-container border-b border-outline-variant">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-lg py-md font-label-caps uppercase text-label-caps text-on-surface-variant tracking-[0.08em]",
                  col.align ? ALIGN[col.align] : "text-left",
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-outline-variant last:border-b-0 transition-colors group",
                onRowClick
                  ? "cursor-pointer hover:bg-surface-container-low"
                  : "hover:bg-surface-container-low",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-lg py-lg align-middle text-body-md text-on-surface",
                    col.align ? ALIGN[col.align] : "text-left",
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
