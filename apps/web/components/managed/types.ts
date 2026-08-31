import type { ReactNode } from 'react';
import type { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryDateRange = { from?: string; to?: string };
export type QueryValue = QueryPrimitive | QueryPrimitive[] | QueryDateRange;
export type QueryFilters = Record<string, QueryValue>;

export type FilterOption = {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
};

export type FilterOptionsPage = {
  data: FilterOption[];
  page?: number;
  size?: number;
  hasMore?: boolean;
  total?: number;
  nextCursor?: string | number | null;
};

export type FilterOptionsFetcherArgs = {
  search: string;
  page: number;
  size: number;
  cursor?: string | number | null;
  dependencies: QueryFilters;
  signal?: AbortSignal;
};

export type FilterOptionsFetcher = (
  args: FilterOptionsFetcherArgs,
) => Promise<FilterOption[] | FilterOptionsPage>;

export type FilterFieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'async-select'
  | 'async-multi-select'
  | 'boolean'
  | 'date'
  | 'date-range'
  | 'custom';

export type FilterDependency = {
  queryKey: string;
  equals?: QueryPrimitive;
  oneOf?: QueryPrimitive[];
};

export type FilterFieldConfig = {
  type: FilterFieldType;
  queryKey: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: QueryValue;
  options?: FilterOption[];
  /** Primary async option loader. */
  fetcher?: FilterOptionsFetcher;
  /** Compatibility alias for fetcher. */
  optionsFetcher?: FilterOptionsFetcher;
  optionsQueryKey?: string | readonly unknown[];
  optionDependencies?: string[];
  optionPageSize?: number;
  optionsStaleTimeMs?: number;
  searchDebounceMs?: number;
  minSearchLength?: number;
  searchable?: boolean;
  clearOnDependencyChange?: boolean;
  emptyOptionsMessage?: string;
  customComponent?: string;
  hidden?: boolean;
  width?: 'full' | 'half';
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  /**
   * Controls field visibility and is also automatically forwarded to the
   * async fetcher as dependency data. Multiple dependencies are ANDed.
   */
  dependsOn?: FilterDependency | FilterDependency[];
  serializeAs?: 'auto' | 'string' | 'number' | 'boolean' | 'csv' | 'date-range';
};

export type CustomFilterRendererProps = {
  config: FilterFieldConfig;
  field: ControllerRenderProps<FieldValues, string>;
  form: UseFormReturn<FieldValues>;
};

export type CustomFilterRegistry = Record<
  string,
  (props: CustomFilterRendererProps) => ReactNode
>;

export type ManagedQueryArgs<TFilters extends QueryFilters = QueryFilters> = {
  page: number;
  size: number;
  filters: TFilters;
  sort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  signal?: AbortSignal;
};

export type ManagedQueryResult<TRow> = {
  data: TRow[];
  page: number;
  size: number;
  hasMore: boolean;
  total?: number;
  meta?: Record<string, unknown>;
};

export type ManagedQueryFunction<TRow, TFilters extends QueryFilters = QueryFilters> = (
  args: ManagedQueryArgs<TFilters>,
) => Promise<ManagedQueryResult<TRow>>;

export type CellFormat =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'currency'
  | 'boolean'
  | 'badge'
  | 'json';

export type ManagedColumnConfig<TRow> = {
  key: string;
  label: string;
  path?: string;
  format?: CellFormat;
  customRenderer?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  hidden?: boolean;
  emptyValue?: ReactNode;
  formatOptions?: {
    currency?: string;
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
  };
};

export type CustomCellRendererProps<TRow> = {
  row: TRow;
  value: unknown;
  column: ManagedColumnConfig<TRow>;
};

export type CustomCellRegistry<TRow> = Record<
  string,
  (props: CustomCellRendererProps<TRow>) => ReactNode
>;
