import type { FieldValues } from 'react-hook-form';
import type { FilterFieldConfig, QueryFilters, QueryPrimitive, QueryValue } from './types';

export function buildFilterDefaults(fields: FilterFieldConfig[]): FieldValues {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.defaultValue !== undefined) return [field.queryKey, field.defaultValue];
      if (field.type === 'multi-select') return [field.queryKey, []];
      if (field.type === 'boolean') return [field.queryKey, false];
      if (field.type === 'date-range') return [field.queryKey, { from: '', to: '' }];
      return [field.queryKey, ''];
    }),
  );
}

function empty(value: unknown) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function serializeValue(field: FilterFieldConfig, value: unknown): QueryValue {
  if (empty(value)) return undefined;

  const mode = field.serializeAs ?? 'auto';
  if (field.type === 'date-range' || mode === 'date-range') {
    const range = value as { from?: string; to?: string };
    return [range?.from || undefined, range?.to || undefined];
  }
  if (mode === 'csv' && Array.isArray(value)) return value.join(',');
  if (mode === 'number' || (mode === 'auto' && field.type === 'number')) {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  if (mode === 'boolean' || (mode === 'auto' && field.type === 'boolean')) return Boolean(value);
  if (Array.isArray(value)) return value as QueryPrimitive[];
  return value as QueryPrimitive;
}

export function serializeFilters(fields: FilterFieldConfig[], values: FieldValues): QueryFilters {
  const result: QueryFilters = {};
  for (const field of fields) {
    const value = serializeValue(field, values[field.queryKey]);
    if (!empty(value)) result[field.queryKey] = value;
  }
  return result;
}

export function countActiveFilters(filters: QueryFilters) {
  return Object.values(filters).filter((value) => !empty(value)).length;
}

export function filtersToSearchParams(filters: QueryFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      const values = value.filter((item) => item !== undefined && item !== null && item !== '');
      if (values.length === 0) continue;
      params.set(key, values.join(','));
      continue;
    }
    params.set(key, String(value));
  }
  return params;
}
