'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

export type DataColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  empty = 'No rows yet. Wire an API and this table is ready.',
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T, index: number) => string;
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>{columns.map((column) => <th key={column.key} className={`px-4 py-3 font-medium ${column.className ?? ''}`}>{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)} className="transition-colors hover:bg-muted/25">
                {columns.map((column) => <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>{column.cell(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="grid min-h-32 place-items-center px-6 text-center text-sm text-muted-foreground">{empty}</div>}
    </div>
  );
}

export function FilterBar({
  search,
  onSearch,
  children,
  placeholder = 'Search or filter…',
}: {
  search: string;
  onSearch: (value: string) => void;
  children?: ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring/30" />
      </div>
      {children}
      <button className="flex h-10 items-center justify-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground hover:text-foreground">
        <SlidersHorizontal className="size-4" /> Filters
      </button>
    </div>
  );
}

export function Pagination({ page, hasMore, onPage }: { page: number; hasMore: boolean; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {page}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))} className="grid size-9 place-items-center rounded-lg border disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        <button disabled={!hasMore} onClick={() => onPage(page + 1)} className="grid size-9 place-items-center rounded-lg border disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}

export function useLocalFilter<T>(rows: T[], query: string, stringify: (row: T) => string) {
  return useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => stringify(row).toLowerCase().includes(term));
  }, [query, rows, stringify]);
}
