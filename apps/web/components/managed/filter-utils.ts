import type { FieldValues } from 'react-hook-form';
import type {
  FilterDependency,
  FilterFieldConfig,
  QueryFilters,
  QueryPrimitive,
  QueryValue,
} from './types';

export function isMultiSelectField(field: FilterFieldConfig) {
  return field.type === 'multi-select' || field.type === 'async-multi-select';
}

export function buildFilterDefaults(fields: FilterFieldConfig[]): FieldValues {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.defaultValue !== undefined) return [field.queryKey, field.defaultValue];
      if (isMultiSelectField(field)) return [field.queryKey, []];
      if (field.type === 'boolean') return [field.queryKey, false];
      if (field.type === 'date-range') return [field.queryKey, { from: '', to: '' }];
      return [field.queryKey, ''];
    }),
  );
}

export function getVisibilityDependencies(field: FilterFieldConfig): FilterDependency[] {
  if (!field.dependsOn) return [];
  return Array.isArray(field.dependsOn) ? [...field.dependsOn] : [field.dependsOn];
}

export function getFilterDependencies(field: FilterFieldConfig): FilterDependency[] {
  const dependencies = getVisibilityDependencies(field);
  const existing = new Set(dependencies.map((dependency) => dependency.queryKey));
  for (const queryKey of field.optionDependencies ?? []) {
    if (!existing.has(queryKey)) dependencies.push({ queryKey });
  }
  return dependencies;
}

export function dependencySatisfied(dependency: FilterDependency, values: FieldValues) {
  const current = values?.[dependency.queryKey];
  if (dependency.oneOf) return dependency.oneOf.includes(current as QueryPrimitive);
  if ('equals' in dependency) return current === dependency.equals;
  return !empty(current);
}

export function visibilityDependenciesSatisfied(field: FilterFieldConfig, values: FieldValues) {
  return getVisibilityDependencies(field).every((dependency) => dependencySatisfied(dependency, values));
}

export function dependenciesSatisfied(field: FilterFieldConfig, values: FieldValues) {
  return getFilterDependencies(field).every((dependency) => dependencySatisfied(dependency, values));
}

export function getDependencyValues(field: FilterFieldConfig, values: FieldValues): QueryFilters {
  const result: QueryFilters = {};
  for (const dependency of getFilterDependencies(field)) {
    result[dependency.queryKey] = values?.[dependency.queryKey] as QueryValue;
  }
  return result;
}

export function dependencySignature(field: FilterFieldConfig, values: FieldValues) {
  return JSON.stringify(getDependencyValues(field, values));
}

function empty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null &&
      Object.values(value).every((entry) => empty(entry)))
  );
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
    if (!visibilityDependenciesSatisfied(field, values)) continue;
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
    if (empty(value)) continue;
    if (Array.isArray(value)) {
      const values = value.filter((item) => !empty(item));
      if (values.length > 0) params.set(key, values.join(','));
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (!empty(nestedValue)) params.set(`${key}.${nestedKey}`, String(nestedValue));
      }
      continue;
    }
    params.set(key, String(value));
  }
  return params;
}
