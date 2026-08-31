'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, LoaderCircle, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type {
  FilterFieldConfig,
  FilterOption,
  FilterOptionsFetcher,
  FilterOptionsPage,
  QueryFilters,
  QueryPrimitive,
} from './types';

const DEFAULT_PAGE_SIZE = 20;

export function ManagedAsyncSelect({
  config,
  value,
  onChange,
  dependencies,
  disabled,
  multiple = false,
}: {
  config: FilterFieldConfig;
  value: QueryPrimitive | QueryPrimitive[];
  onChange: (value: QueryPrimitive | QueryPrimitive[]) => void;
  dependencies: QueryFilters;
  disabled?: boolean;
  multiple?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const resolvedFetcher = config.fetcher ?? config.optionsFetcher;
  const fetcherRef = useRef<FilterOptionsFetcher | undefined>(resolvedFetcher);
  fetcherRef.current = resolvedFetcher;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      config.searchDebounceMs ?? 250,
    );
    return () => window.clearTimeout(timer);
  }, [config.searchDebounceMs, search]);

  const asyncEnabled =
    Boolean(resolvedFetcher) &&
    !disabled &&
    debouncedSearch.length >= (config.minSearchLength ?? 0);

  const queryKey = useMemo(
    () => [
      'managed-filter-options',
      ...(Array.isArray(config.optionsQueryKey)
        ? config.optionsQueryKey
        : [config.optionsQueryKey ?? config.queryKey]),
      debouncedSearch,
      dependencies,
    ],
    [config.optionsQueryKey, config.queryKey, debouncedSearch, dependencies],
  );

  const query = useInfiniteQuery({
    queryKey,
    enabled: asyncEnabled,
    staleTime: config.optionsStaleTimeMs ?? 60_000,
    initialPageParam: { page: 1, cursor: undefined as string | number | null | undefined },
    queryFn: async ({ pageParam, signal }) => {
      const fetcher = fetcherRef.current;
      if (!fetcher) return normalizeOptionsPage([], pageParam.page, config.optionPageSize ?? DEFAULT_PAGE_SIZE);
      const response = await fetcher({
        search: debouncedSearch,
        page: pageParam.page,
        size: config.optionPageSize ?? DEFAULT_PAGE_SIZE,
        cursor: pageParam.cursor,
        dependencies,
        signal,
      });
      return normalizeOptionsPage(response, pageParam.page, config.optionPageSize ?? DEFAULT_PAGE_SIZE);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return { page: (lastPage.page ?? 1) + 1, cursor: lastPage.nextCursor };
    },
  });

  const remoteOptions = query.data?.pages.flatMap((page) => page.data) ?? [];
  const staticOptions = config.options ?? [];
  const options = dedupeOptions(resolvedFetcher ? remoteOptions : filterLocalOptions(staticOptions, debouncedSearch));
  const selectedValues = multiple
    ? (Array.isArray(value) ? value : [])
    : value === undefined || value === null || value === ''
      ? []
      : [value as QueryPrimitive];

  const labels = new Map([...staticOptions, ...options].map((option) => [valueKey(option.value), option.label]));
  const selectedLabels = selectedValues.map((selected) => labels.get(valueKey(selected)) ?? String(selected));

  const toggle = (option: FilterOption) => {
    if (option.disabled) return;
    if (!multiple) {
      onChange(option.value);
      setOpen(false);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    const exists = current.some((entry) => valueKey(entry) === valueKey(option.value));
    onChange(exists ? current.filter((entry) => valueKey(entry) !== valueKey(option.value)) : [...current, option.value]);
  };

  const clear = () => onChange(multiple ? [] : '');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-9 w-full justify-between rounded-3xl px-3 font-normal"
          />
        }
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
          {selectedLabels.length === 0 ? (
            <span className="truncate text-muted-foreground">
              {disabled ? dependencyPlaceholder(config) : config.placeholder ?? `Select ${config.label}`}
            </span>
          ) : multiple ? (
            selectedLabels.map((label, index) => (
              <Badge key={`${label}-${index}`} variant="secondary" className="max-w-44 truncate">
                {label}
              </Badge>
            ))
          ) : (
            <span className="truncate">{selectedLabels[0]}</span>
          )}
        </span>
        <span className="ml-2 flex shrink-0 items-center gap-1">
          {selectedLabels.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${config.label}`}
              className="grid size-6 place-items-center rounded-full hover:bg-muted"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                clear();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  clear();
                }
              }}
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[var(--anchor-width)] min-w-72 gap-2 p-2">
        {(config.searchable ?? true) && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              className="pl-9"
              autoFocus
            />
          </div>
        )}

        <div
          className="max-h-72 overflow-y-auto rounded-2xl"
          onScroll={(event) => {
            const element = event.currentTarget;
            const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 64;
            if (nearBottom && query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
        >
          {query.isLoading && options.length === 0 ? (
            <OptionState icon={<LoaderCircle className="size-4 animate-spin" />}>Loading options…</OptionState>
          ) : query.isError ? (
            <OptionState>Could not load options.</OptionState>
          ) : debouncedSearch.length < (config.minSearchLength ?? 0) ? (
            <OptionState>Type at least {config.minSearchLength} characters.</OptionState>
          ) : options.length === 0 ? (
            <OptionState>{config.emptyOptionsMessage ?? 'No options found.'}</OptionState>
          ) : (
            <div className="space-y-1 p-1">
              {options.map((option) => {
                const active = selectedValues.some((entry) => String(entry) === String(option.value));
                return (
                  <Button
                    key={String(option.value)}
                    type="button"
                    variant="ghost"
                    disabled={option.disabled}
                    onClick={() => toggle(option)}
                    className="h-auto min-h-9 w-full justify-start rounded-2xl px-2.5 py-2 text-left font-normal"
                  >
                    <span className={cn('grid size-4 shrink-0 place-items-center rounded-[5px] border', active && 'border-primary bg-primary text-primary-foreground')}>
                      {active && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{option.label}</span>
                      {option.description && <span className="block truncate text-xs text-muted-foreground">{option.description}</span>}
                    </span>
                  </Button>
                );
              })}
            </div>
          )}

          {query.isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" /> Loading more…
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function normalizeOptionsPage(
  response: FilterOption[] | FilterOptionsPage,
  page: number,
  size: number,
): Required<Pick<FilterOptionsPage, 'data' | 'page' | 'size' | 'hasMore'>> & Pick<FilterOptionsPage, 'total' | 'nextCursor'> {
  if (Array.isArray(response)) return { data: response, page, size, hasMore: response.length >= size, nextCursor: null };
  return {
    data: response.data ?? [],
    page: response.page ?? page,
    size: response.size ?? size,
    hasMore: response.hasMore ?? Boolean(response.nextCursor),
    total: response.total,
    nextCursor: response.nextCursor ?? null,
  };
}

function valueKey(value: unknown) {
  if (value === undefined || value === null) return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function dedupeOptions(options: FilterOption[]) {
  const map = new Map<string, FilterOption>();
  for (const option of options) map.set(valueKey(option.value), option);
  return [...map.values()];
}

function filterLocalOptions(options: FilterOption[], search: string) {
  if (!search) return options;
  const needle = search.toLowerCase();
  return options.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(needle));
}

function dependencyPlaceholder(config: FilterFieldConfig) {
  const dependency = Array.isArray(config.dependsOn) ? config.dependsOn[0] : config.dependsOn;
  const key = config.optionDependencies?.[0] ?? dependency?.queryKey;
  return key ? `Select ${key} first` : 'Select dependencies first';
}

function OptionState({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return <div className="flex min-h-24 items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">{icon}{children}</div>;
}
