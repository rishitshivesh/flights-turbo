"use client";

import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  RefreshCw,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { ManagedFilters } from "./managed-filters";
import type {
  CustomCellRegistry,
  CustomFilterRegistry,
  FilterFieldConfig,
  ManagedColumnConfig,
  ManagedQueryFunction,
  ManagedQueryResult,
  QueryFilters,
} from "./types";

export function ManagedDataTable<
  TRow,
  TFilters extends QueryFilters = QueryFilters,
>({
  queryFunction,
  queryKey,
  columns,
  filters = [],
  initialFilters,
  customFilterComponents,
  customCellRenderers,
  rowKey,
  title,
  description,
  pageSize = 20,
  pageSizes = [10, 20, 50, 100],
  empty = "No rows match this query.",
  toolbar,
  onRowClick,
  onInitialFilterOpen,
}: {
  queryFunction: ManagedQueryFunction<TRow, TFilters>;
  queryKey?: string | number;
  columns: ManagedColumnConfig<TRow>[];
  filters?: FilterFieldConfig[];
  initialFilters?: TFilters;
  customFilterComponents?: CustomFilterRegistry;
  customCellRenderers?: CustomCellRegistry<TRow>;
  rowKey: (row: TRow, index: number) => string;
  title?: string;
  description?: string;
  pageSize?: number;
  pageSizes?: number[];
  empty?: ReactNode;
  toolbar?: ReactNode;
  onRowClick?: (row: TRow) => void;
  onInitialFilterOpen?: () => void;
}) {
  const [filterValues, setFilterValues] = useState<TFilters>(
    (initialFilters ?? {}) as TFilters,
  );
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>();
  const [result, setResult] = useState<ManagedQueryResult<TRow>>({
    data: [],
    page: 1,
    size,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestSequence = useRef(0);
  const queryFunctionRef = useRef(queryFunction);
  queryFunctionRef.current = queryFunction;

  const visibleColumns = useMemo(
    () => columns.filter((column) => !column.hidden),
    [columns],
  );

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);

    void queryFunctionRef
      .current({
        page,
        size,
        filters: filterValues,
        sort,
        signal: controller.signal,
      })
      .then((next) => {
        if (!disposed && sequence === requestSequence.current) setResult(next);
      })
      .catch((caught) => {
        if (
          !disposed &&
          !controller.signal.aborted &&
          sequence === requestSequence.current
        ) {
          setError(
            caught instanceof Error ? caught : new Error("Query failed"),
          );
        }
      })
      .finally(() => {
        if (!disposed && sequence === requestSequence.current)
          setLoading(false);
      });

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [filterValues, page, queryKey, refreshToken, size, sort]);

  const updateFilters = (next: QueryFilters) => {
    setFilterValues(next as TFilters);
    setPage(1);
  };

  const toggleSort = (column: ManagedColumnConfig<TRow>) => {
    if (!column.sortable) return;
    setPage(1);
    setSort((current) => {
      if (current?.key !== column.key)
        return { key: column.key, direction: "asc" };
      if (current.direction === "asc")
        return { key: column.key, direction: "desc" };
      return undefined;
    });
  };

  return (
    <section className="space-y-3">
      {(title || description || filters.length > 0 || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {filters.length > 0 && (
              <ManagedFilters
                fields={filters}
                value={filterValues}
                onChange={updateFilters}
                customComponents={customFilterComponents}
                onInitialOpen={onInitialFilterOpen}
              />
            )}
            <button
              type="button"
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={loading}
              className="grid size-10 place-items-center rounded-xl border bg-background hover:bg-muted disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 font-medium",
                      alignClass(column.align),
                    )}
                    style={{ width: column.width }}
                  >
                    <button
                      type="button"
                      disabled={!column.sortable}
                      onClick={() => toggleSort(column)}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        column.sortable && "hover:text-foreground",
                      )}
                    >
                      {column.label}
                      {column.sortable &&
                        (sort?.key === column.key ? (
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform",
                              sort.direction === "asc" && "rotate-180",
                            )}
                          />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        ))}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {!loading &&
                !error &&
                result.data.map((row, index) => (
                  <tr
                    key={rowKey(row, index)}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors hover:bg-muted/25",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-4 py-3", alignClass(column.align))}
                      >
                        {renderCell(row, column, customCellRenderers)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && <TableState>Loading query…</TableState>}
        {!loading && error && (
          <TableState>
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertCircle className="size-5 text-destructive" />
              <span className="font-medium">Query failed</span>
              <span className="max-w-lg text-xs text-muted-foreground">
                {error.message}
              </span>
            </div>
          </TableState>
        )}
        {!loading && !error && result.data.length === 0 && (
          <TableState>{empty}</TableState>
        )}

        <footer className="flex flex-col gap-3 border-t bg-muted/15 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {result.total !== undefined
              ? `${result.total.toLocaleString()} rows`
              : `${result.data.length} rows on this page`}
            {sort && (
              <>
                {" "}
                · sorted by {sort.key} {sort.direction}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows
              <select
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-lg border bg-background px-2 text-xs text-foreground"
              >
                {pageSizes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              Page {result.page || page}
            </span>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="grid size-8 place-items-center rounded-lg border bg-background disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              disabled={!result.hasMore || loading}
              onClick={() => setPage((value) => value + 1)}
              className="grid size-8 place-items-center rounded-lg border bg-background disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

function getPath(object: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object")
      return (value as Record<string, unknown>)[part];
    return undefined;
  }, object);
}

function renderCell<TRow>(
  row: TRow,
  column: ManagedColumnConfig<TRow>,
  registry?: CustomCellRegistry<TRow>,
) {
  const value = getPath(row, column.path ?? column.key);
  const custom = column.customRenderer
    ? registry?.[column.customRenderer]
    : undefined;
  if (custom) return custom({ row, value, column });
  if (value === undefined || value === null || value === "") {
    return (
      column.emptyValue ?? <span className="text-muted-foreground">—</span>
    );
  }

  const locale = column.formatOptions?.locale;
  switch (column.format) {
    case "number":
      return Number(value).toLocaleString(locale);
    case "currency":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: column.formatOptions?.currency ?? "USD",
      }).format(Number(value));
    case "date":
      return new Intl.DateTimeFormat(locale, {
        dateStyle: column.formatOptions?.dateStyle ?? "medium",
      }).format(new Date(String(value)));
    case "datetime":
      return new Intl.DateTimeFormat(locale, {
        dateStyle: column.formatOptions?.dateStyle ?? "medium",
        timeStyle: column.formatOptions?.timeStyle ?? "short",
      }).format(new Date(String(value)));
    case "boolean":
      return (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs",
            value
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    case "badge":
      return (
        <span className="rounded-full border bg-background px-2 py-1 text-xs">
          {String(value)}
        </span>
      );
    case "json":
      return (
        <code className="max-w-80 break-all text-xs text-muted-foreground">
          {JSON.stringify(value)}
        </code>
      );
    default:
      return String(value);
  }
}

function TableState({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-36 place-items-center border-t px-6 py-8 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function alignClass(align?: "left" | "center" | "right") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}
