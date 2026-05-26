import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Align = "start" | "end";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  align?: Align;
  width?: string;
  render: (row: T) => ReactNode;
  /** On mobile cards, render this column as a leading visual (e.g. thumbnail). */
  mobileLeading?: boolean;
  /** On mobile cards, treat this column as the title (no label, larger text). */
  mobilePrimary?: boolean;
  /** On mobile cards, pin this column to the bottom of the card (e.g. actions). */
  mobileFooter?: boolean;
  /** Hide this column entirely on mobile cards. */
  hideOnMobile?: boolean;
  /** Override the label shown above the value on mobile cards (defaults to `header`). */
  mobileLabel?: ReactNode;
}

interface PaginationBase {
  pageSize: number;
  currentPage: number;
}

export interface UrlPagination extends PaginationBase {
  buildHref: (page: number) => string;
  onPageChange?: never;
}

export interface ControlledPagination extends PaginationBase {
  onPageChange: (page: number) => void;
  buildHref?: never;
}

export type DataTablePagination = UrlPagination | ControlledPagination;

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  caption?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  /** Optional pagination — slices rows internally and renders controls below. */
  pagination?: DataTablePagination;
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
  pagination,
}: DataTableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const totalRows = rows.length;
  const pageSize = pagination?.pageSize ?? 0;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(totalRows / pageSize))
    : 1;
  const clampedPage = pagination
    ? Math.min(Math.max(1, pagination.currentPage), totalPages)
    : 1;
  const start = pagination ? (clampedPage - 1) * pageSize : 0;
  const end = pagination ? start + pageSize : totalRows;
  const visibleRows = pagination ? rows.slice(start, end) : rows;

  return (
    <div className={cn(className)}>
      <div className="hidden md:block overflow-x-auto">
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
            {visibleRows.map((row, idx) => (
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

      <MobileCardList
        columns={columns}
        rows={visibleRows}
        rowKey={rowKey}
        onRowClick={onRowClick}
        startIndex={start}
      />

      {pagination && totalRows > pageSize ? (
        <TablePagination
          pagination={pagination}
          currentPage={clampedPage}
          totalPages={totalPages}
          rangeStart={start + 1}
          rangeEnd={Math.min(end, totalRows)}
          totalRows={totalRows}
        />
      ) : null}
    </div>
  );
}

interface MobileCardListProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  startIndex: number;
}

function MobileCardList<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  startIndex,
}: MobileCardListProps<T>) {
  const leadingCol = columns.find((c) => c.mobileLeading);
  const explicitPrimary = columns.find((c) => c.mobilePrimary);
  const fallbackPrimary = columns.find(
    (c) =>
      c !== leadingCol &&
      !c.mobileFooter &&
      !c.hideOnMobile &&
      hasHeader(c.header),
  );
  const primaryCol = explicitPrimary ?? fallbackPrimary ?? null;
  const footerCol = columns.find((c) => c.mobileFooter);
  const detailCols = columns.filter(
    (c) =>
      c !== leadingCol &&
      c !== primaryCol &&
      c !== footerCol &&
      !c.hideOnMobile &&
      hasHeader(c.header),
  );

  return (
    <ul className="md:hidden flex flex-col">
      {rows.map((row, idx) => {
        const interactive = Boolean(onRowClick);
        return (
          <li
            key={rowKey(row, startIndex + idx)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "border-b border-outline-variant last:border-b-0 px-md py-md sm:px-lg flex flex-col gap-sm transition-colors",
              interactive && "cursor-pointer hover:bg-surface-container-low",
            )}
          >
            <div className="flex items-start gap-md">
              {leadingCol ? (
                <div className="shrink-0">{leadingCol.render(row)}</div>
              ) : null}
              <div className="flex-1 min-w-0 flex flex-col gap-xs">
                {primaryCol ? (
                  <div className="font-body-md text-body-md text-on-surface">
                    {primaryCol.render(row)}
                  </div>
                ) : null}
                {detailCols.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-md"
                  >
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.08em] shrink-0">
                      {col.mobileLabel ?? col.header}
                    </span>
                    <div className="text-right min-w-0">{col.render(row)}</div>
                  </div>
                ))}
              </div>
            </div>
            {footerCol ? (
              <div className="flex justify-end pt-xs">
                {footerCol.render(row)}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function hasHeader(header: ReactNode): boolean {
  if (header === null || header === undefined) return false;
  if (typeof header === "string") return header.trim().length > 0;
  return true;
}

export interface PaginationProps {
  pagination: DataTablePagination;
  /** Total row count across all pages. */
  totalRows: number;
  className?: string;
}

export function Pagination({
  pagination,
  totalRows,
  className,
}: PaginationProps) {
  const pageSize = pagination.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  if (totalPages <= 1) return null;
  const currentPage = Math.min(Math.max(1, pagination.currentPage), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, totalRows);
  return (
    <TablePagination
      pagination={pagination}
      currentPage={currentPage}
      totalPages={totalPages}
      rangeStart={start + 1}
      rangeEnd={end}
      totalRows={totalRows}
      className={className}
    />
  );
}

interface TablePaginationProps {
  pagination: DataTablePagination;
  currentPage: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  totalRows: number;
  className?: string;
}

function TablePagination({
  pagination,
  currentPage,
  totalPages,
  rangeStart,
  rangeEnd,
  totalRows,
  className,
}: TablePaginationProps) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Table pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant px-md py-md sm:px-lg",
        className,
      )}
    >
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Showing <span className="font-semibold">{rangeStart}</span>–
        <span className="font-semibold">{rangeEnd}</span> of{" "}
        <span className="font-semibold">{totalRows}</span>
      </p>
      <div className="flex items-center gap-xs flex-wrap justify-end">
        <PageControl
          pagination={pagination}
          targetPage={currentPage - 1}
          disabled={isFirst}
          ariaLabel="Previous page"
        >
          ←
        </PageControl>
        {pages.map((entry, idx) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              aria-hidden="true"
              className="px-xs text-body-sm text-on-surface-variant"
            >
              …
            </span>
          ) : (
            <PageControl
              key={entry}
              pagination={pagination}
              targetPage={entry}
              active={entry === currentPage}
              ariaLabel={`Page ${entry}`}
            >
              {entry}
            </PageControl>
          ),
        )}
        <PageControl
          pagination={pagination}
          targetPage={currentPage + 1}
          disabled={isLast}
          ariaLabel="Next page"
        >
          →
        </PageControl>
      </div>
    </nav>
  );
}

function buildPageList(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);
  if (windowStart > 2) result.push("ellipsis");
  for (let i = windowStart; i <= windowEnd; i += 1) result.push(i);
  if (windowEnd < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}

interface PageControlProps {
  pagination: DataTablePagination;
  targetPage: number;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  children: ReactNode;
}

function PageControl({
  pagination,
  targetPage,
  active,
  disabled,
  ariaLabel,
  children,
}: PageControlProps) {
  const baseClass = cn(
    "inline-flex items-center justify-center h-[32px] min-w-[32px] px-sm rounded-full text-label-md font-semibold tracking-wide transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    active
      ? "bg-primary text-on-primary"
      : "text-on-surface-variant hover:bg-surface-container",
    disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
  );

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={ariaLabel} className={baseClass}>
        {children}
      </span>
    );
  }

  if (pagination.onPageChange) {
    const onClick = pagination.onPageChange;
    return (
      <button
        type="button"
        onClick={() => onClick(targetPage)}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        className={baseClass}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={pagination.buildHref(targetPage)}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={baseClass}
      scroll={false}
    >
      {children}
    </Link>
  );
}
