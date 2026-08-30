import type { ReactNode } from 'react';
import type { ControllerRenderProps, FieldValues, UseFormReturn } from 'react-hook-form';

export type QueryPrimitive = string | number | boolean | null | undefined;
export type QueryValue = QueryPrimitive | QueryPrimitive[];
export type QueryFilters = Record<string, QueryValue>;

export type FilterOption = {
  label: string;
  value: string | number;
  description?: string;
};

export type FilterFieldType =
  | 'string'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'boolean'
  | 'date'
  | 'date-range'
  | 'custom';

export type FilterFieldConfig = {
  type: FilterFieldType;
  queryKey: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: QueryValue | { from?: string; to?: string };
  options?: FilterOption[];
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
  dependsOn?: {
    queryKey: string;
    equals?: QueryPrimitive;
    oneOf?: QueryPrimitive[];
  };
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
