'use client';

import { Controller, FormProvider, useForm, useWatch, type FieldValues } from 'react-hook-form';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { buildFilterDefaults, serializeFilters } from './filter-utils';
import type { CustomFilterRegistry, FilterFieldConfig, QueryFilters } from './types';

export function ManagedFilterForm({
  fields,
  value,
  onApply,
  onCancel,
  customComponents = {},
  submitLabel = 'Apply filters',
}: {
  fields: FilterFieldConfig[];
  value?: QueryFilters;
  onApply: (filters: QueryFilters) => void;
  onCancel?: () => void;
  customComponents?: CustomFilterRegistry;
  submitLabel?: string;
}) {
  const defaults = buildFilterDefaults(fields);
  const defaultsSignature = JSON.stringify(defaults);
  const valueSignature = JSON.stringify(value ?? {});

  const form = useForm<FieldValues>({
    defaultValues: { ...defaults, ...(value ?? {}) },
    mode: 'onSubmit',
  });

  useEffect(() => {
    form.reset({ ...buildFilterDefaults(fields), ...(value ?? {}) });
    // Signatures intentionally prevent equivalent inline config/value objects
    // from resetting an in-progress form on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsSignature, valueSignature, form]);

  const watched = useWatch({ control: form.control });

  const reset = () => {
    const nextDefaults = buildFilterDefaults(fields);
    form.reset(nextDefaults);
    onApply(serializeFilters(fields, nextDefaults));
  };

  return (
    <FormProvider {...form}>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={form.handleSubmit((values) => onApply(serializeFilters(fields, values)))}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
          {fields.map((config) => {
            if (config.hidden || !isVisible(config, watched)) return null;
            return (
              <Controller
                key={config.queryKey}
                name={config.queryKey}
                control={form.control}
                rules={buildRules(config)}
                render={({ field, fieldState }) => (
                  <div className={cn('space-y-2', config.width === 'half' && 'sm:w-1/2')}>
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={config.queryKey} className="text-sm font-medium">
                        {config.label}
                      </label>
                      {config.required && <span className="text-destructive">*</span>}
                    </div>
                    {config.description && <p className="text-xs leading-5 text-muted-foreground">{config.description}</p>}
                    <FieldRenderer config={config} field={field} form={form} customComponents={customComponents} />
                    {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 border-t bg-background p-4">
          <button type="button" onClick={reset} className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
            Reset
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
          )}
          <button type="submit" className="ml-auto h-10 rounded-xl bg-foreground px-4 text-sm font-medium text-background">
            {submitLabel}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

function FieldRenderer({ config, field, form, customComponents }: any) {
  if (config.type === 'custom') {
    const renderer = config.customComponent ? customComponents[config.customComponent] : undefined;
    return renderer ? renderer({ config, field, form }) : <MissingCustom name={config.customComponent} />;
  }

  if (config.type === 'select') {
    return (
      <div className="relative">
        <select
          id={config.queryKey}
          {...field}
          value={field.value ?? ''}
          className="h-10 w-full appearance-none rounded-xl border bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="">{config.placeholder ?? `Select ${config.label}`}</option>
          {(config.options ?? []).map((option: any) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  }

  if (config.type === 'multi-select') {
    const selected = Array.isArray(field.value) ? field.value : [];
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {(config.options ?? []).map((option: any) => {
          const active = selected.includes(option.value);
          return (
            <button
              type="button"
              key={String(option.value)}
              onClick={() => field.onChange(active ? selected.filter((item: unknown) => item !== option.value) : [...selected, option.value])}
              className={cn('flex min-h-10 items-center gap-2 rounded-xl border px-3 text-left text-sm', active && 'border-foreground bg-foreground text-background')}
            >
              <span className={cn('grid size-4 place-items-center rounded border', active && 'border-background')}>
                {active && <Check className="size-3" />}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (config.type === 'boolean') {
    return (
      <label className="flex h-11 cursor-pointer items-center justify-between rounded-xl border px-3">
        <span className="text-sm">Enabled</span>
        <input type="checkbox" checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} className="size-4" />
      </label>
    );
  }

  if (config.type === 'date-range') {
    const range = field.value ?? { from: '', to: '' };
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <input type="date" value={range.from ?? ''} onChange={(event) => field.onChange({ ...range, from: event.target.value })} className="h-10 rounded-xl border bg-background px-3 text-sm" />
        <input type="date" value={range.to ?? ''} onChange={(event) => field.onChange({ ...range, to: event.target.value })} className="h-10 rounded-xl border bg-background px-3 text-sm" />
      </div>
    );
  }

  return (
    <input
      id={config.queryKey}
      type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
      {...field}
      value={field.value ?? ''}
      placeholder={config.placeholder}
      className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
    />
  );
}

function buildRules(config: FilterFieldConfig) {
  const validation = config.validation;
  return {
    required: config.required ? `${config.label} is required` : false,
    min: validation?.min !== undefined ? { value: validation.min, message: validation.message ?? `Minimum is ${validation.min}` } : undefined,
    max: validation?.max !== undefined ? { value: validation.max, message: validation.message ?? `Maximum is ${validation.max}` } : undefined,
    minLength: validation?.minLength !== undefined ? { value: validation.minLength, message: validation.message ?? `Minimum length is ${validation.minLength}` } : undefined,
    maxLength: validation?.maxLength !== undefined ? { value: validation.maxLength, message: validation.message ?? `Maximum length is ${validation.maxLength}` } : undefined,
    pattern: validation?.pattern ? { value: new RegExp(validation.pattern), message: validation.message ?? 'Invalid value' } : undefined,
  };
}

function isVisible(config: FilterFieldConfig, values: FieldValues) {
  if (!config.dependsOn) return true;
  const current = values?.[config.dependsOn.queryKey];
  if (config.dependsOn.oneOf) return config.dependsOn.oneOf.includes(current);
  if ('equals' in config.dependsOn) return current === config.dependsOn.equals;
  return Boolean(current);
}

function MissingCustom({ name }: { name?: string }) {
  return <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">Missing custom filter renderer: {name ?? '(unnamed)'}</div>;
}
