'use client';

import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  RefreshCw,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ManagedFilters } from './managed-filters';
import type {
  CustomCellRegistry,
  CustomFilterRegistry,
  FilterFieldConfig,
  ManagedColumnConfig,
  ManagedQueryFunction,
  ManagedQueryResult,
  QueryFilters,
} from './types';

export function ManagedDataTable<TRow, TFilters extends QueryFilters = QueryFilters>({
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
  empty = 'No rows match this query.',
  toolbar,
  onRowClick,
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
}) {
  const [filterValues, setFilterValues] = useState<TFilters>((initialFilters ?? {}) as TFilters);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>();
  const [result, setResult] = useState<ManagedQueryResult<TRow>>({ data: [], page: 1, size, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestSequence = useRef(0);
  const queryFunctionRef = useRef(queryFunction);
  queryFunctionRef.current = queryFunction;

  const visibleColumns = useMemo(() => columns.filter((column) => !column.hidden), [columns]);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError(null);

    void queryFunctionRef.current({ page, size, filters: filterValues, sort, signal: controller.signal })
      .then((next) => {
        if (!disposed && sequence === requestSequence.current) setResult(next);
      })
      .catch((caught) => {
        if (!disposed && !controller.signal.aborted && sequence === requestSequence.current) {
          setError(caught instanceof Error ? caught : new Error('Query failed'));
        }
      })
      .finally(() => {
        if (!disposed && sequence === requestSequence.current) setLoading(false);
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
      if (current?.key !== column.key) return { key: column.key, direction: 'asc' };
      if (current.direction === 'asc') return { key: column.key, direction: 'desc' };
      return undefined;
    });
  };

  return (
    <section className="space-y-3">
      {(title || description || filters.length > 0 || toolbar) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {filters.length > 0 && (
              <ManagedFilters
                fields={filters}
                value={filterValues}
                onChange={updateFilters}
                customComponents={customFilterComponents}
              />
            )}
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={cn(loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-4xl bg-card shadow-md ring-1 ring-foreground/5 dark:ring-foreground/10">
        <Table>
          <TableHeader className="bg-muted/35">
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead key={column.key} className={alignClass(column.align)} style={{ width: column.width }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!column.sortable}
                    onClick={() => toggleSort(column)}
                    className="-ml-3"
                  >
                    {column.label}
                    {column.sortable && (sort?.key === column.key ? (
                      <ChevronDown className={cn('transition-transform', sort.direction === 'asc' && 'rotate-180')} />
                    ) : (
                      <ChevronsUpDown className="opacity-50" />
                    ))}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && !error && result.data.map((row, index) => (
              <TableRow
                key={rowKey(row, index)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {visibleColumns.map((column) => (
                  <TableCell key={column.key} className={alignClass(column.align)}>
                    {renderCell(row, column, customCellRenderers)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading && <TableState>Loading query…</TableState>}
        {!loading && error && (
          <div className="border-t p-4">
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Query failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        )}
        {!loading && !error && result.data.length === 0 && <TableState>{empty}</TableState>}

        <footer className="flex flex-col gap-3 border-t bg-muted/15 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {result.total !== undefined ? `${result.total.toLocaleString()} rows` : `${result.data.length} rows on this page`}
            {sort && <> · sorted by {sort.key} {sort.direction}</>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select
              value={String(size)}
              onValueChange={(value) => {
                setSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((option) => (
                  <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">Page {result.page || page}</Badge>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={!result.hasMore || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}

function getPath(object: unknown, path: string) {
  return path.split('.').reduce<unknown>((value, part) => {
    if (value && typeof value === 'object') return (value as Record<string, unknown>)[part];
    return undefined;
  }, object);
}

function renderCell<TRow>(row: TRow, column: ManagedColumnConfig<TRow>, registry?: CustomCellRegistry<TRow>) {
  const value = getPath(row, column.path ?? column.key);
  const custom = column.customRenderer ? registry?.[column.customRenderer] : undefined;
  if (custom) return custom({ row, value, column });
  if (value === undefined || value === null || value === '') return column.emptyValue ?? <span className="text-muted-foreground">—</span>;

  const locale = column.formatOptions?.locale;
  switch (column.format) {
    case 'number': return Number(value).toLocaleString(locale);
    case 'currency': return new Intl.NumberFormat(locale, { style: 'currency', currency: column.formatOptions?.currency ?? 'USD' }).format(Number(value));
    case 'date': return new Intl.DateTimeFormat(locale, { dateStyle: column.formatOptions?.dateStyle ?? 'medium' }).format(new Date(String(value)));
    case 'datetime': return new Intl.DateTimeFormat(locale, { dateStyle: column.formatOptions?.dateStyle ?? 'medium', timeStyle: column.formatOptions?.timeStyle ?? 'short' }).format(new Date(String(value)));
    case 'boolean': return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    case 'badge': return <Badge variant="outline">{String(value)}</Badge>;
    case 'json': return <code className="max-w-80 break-all text-xs text-muted-foreground">{JSON.stringify(value)}</code>;
    default: return String(value);
  }
}

function TableState({ children }: { children: ReactNode }) {
  return <div className="grid min-h-36 place-items-center border-t px-6 py-8 text-sm text-muted-foreground">{children}</div>;
}

function alignClass(align?: 'left' | 'center' | 'right') {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}
