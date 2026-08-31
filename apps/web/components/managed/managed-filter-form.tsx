'use client';

import { Controller, FormProvider, useForm, useWatch, type FieldValues } from 'react-hook-form';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  buildFilterDefaults,
  dependenciesSatisfied,
  dependencySignature,
  getDependencyValues,
  getFilterDependencies,
  serializeFilters,
  visibilityDependenciesSatisfied,
} from './filter-utils';
import { ManagedAsyncSelect } from './managed-async-select';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsSignature, valueSignature, form]);

  const watched = useWatch({ control: form.control }) ?? {};
  const dependencySignatures = fields.map((field) => `${field.queryKey}:${dependencySignature(field, watched)}`).join('|');
  const previousDependencies = useRef<Record<string, string>>({});

  useEffect(() => {
    for (const field of fields) {
      if (getFilterDependencies(field).length === 0) continue;
      const signature = dependencySignature(field, watched);
      const previous = previousDependencies.current[field.queryKey];
      previousDependencies.current[field.queryKey] = signature;
      if (previous === undefined || previous === signature || field.clearOnDependencyChange === false) continue;
      form.setValue(field.queryKey, emptyValueFor(field), { shouldDirty: true, shouldValidate: false });
    }
    // dependencySignatures intentionally collapses watched dependency values into a stable effect key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencySignatures, form]);

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
            if (config.hidden || !visibilityDependenciesSatisfied(config, watched)) return null;
            return (
              <Controller
                key={config.queryKey}
                name={config.queryKey}
                control={form.control}
                rules={buildRules(config)}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid || undefined}
                    className={cn(config.width === 'half' && 'sm:w-1/2')}
                  >
                    <div className="flex items-center gap-1.5">
                      <FieldLabel htmlFor={config.queryKey}>{config.label}</FieldLabel>
                      {config.required && <span className="text-destructive">*</span>}
                    </div>
                    {config.description && <FieldDescription>{config.description}</FieldDescription>}
                    <FieldRenderer
                      config={config}
                      field={field}
                      form={form}
                      watched={watched}
                      dependenciesReady={dependenciesSatisfied(config, watched)}
                      customComponents={customComponents}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2 border-t bg-background p-4">
          <Button type="button" variant="outline" onClick={reset}>Reset</Button>
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" className="ml-auto">{submitLabel}</Button>
        </div>
      </form>
    </FormProvider>
  );
}

function FieldRenderer({ config, field, form, watched, dependenciesReady, customComponents }: any) {
  if (config.type === 'custom') {
    const renderer = config.customComponent ? customComponents[config.customComponent] : undefined;
    return renderer ? renderer({ config, field, form }) : <MissingCustom name={config.customComponent} />;
  }

  const isAsync = Boolean(config.fetcher ?? config.optionsFetcher) || config.type === 'async-select' || config.type === 'async-multi-select';
  const isMulti = config.type === 'multi-select' || config.type === 'async-multi-select';

  if (isAsync || isMulti) {
    return (
      <ManagedAsyncSelect
        config={config}
        value={field.value}
        onChange={field.onChange}
        dependencies={getDependencyValues(config, watched)}
        disabled={!dependenciesReady}
        multiple={isMulti}
      />
    );
  }

  if (config.type === 'select') {
    return (
      <Select value={field.value || null} onValueChange={field.onChange} disabled={!dependenciesReady}>
        <SelectTrigger id={config.queryKey} className="w-full">
          <SelectValue placeholder={config.placeholder ?? `Select ${config.label}`} />
        </SelectTrigger>
        <SelectContent>
          {(config.options ?? []).map((option: any) => (
            <SelectItem key={String(option.value)} value={option.value} disabled={option.disabled}>
              <div>
                <div>{option.label}</div>
                {option.description && <div className="text-xs text-muted-foreground">{option.description}</div>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (config.type === 'boolean') {
    return (
      <div className="flex h-10 items-center justify-between rounded-3xl bg-input/50 px-3">
        <span className="text-sm text-muted-foreground">Enabled</span>
        <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} disabled={!dependenciesReady} />
      </div>
    );
  }

  if (config.type === 'date-range') {
    const range = field.value ?? { from: '', to: '' };
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <Input type="date" value={range.from ?? ''} onChange={(event) => field.onChange({ ...range, from: event.target.value })} disabled={!dependenciesReady} />
        <Input type="date" value={range.to ?? ''} onChange={(event) => field.onChange({ ...range, to: event.target.value })} disabled={!dependenciesReady} />
      </div>
    );
  }

  return (
    <Input
      id={config.queryKey}
      type={config.type === 'number' ? 'number' : config.type === 'date' ? 'date' : 'text'}
      {...field}
      value={field.value ?? ''}
      placeholder={config.placeholder}
      disabled={!dependenciesReady}
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

function emptyValueFor(config: FilterFieldConfig) {
  if (config.type === 'multi-select' || config.type === 'async-multi-select') return [];
  if (config.type === 'boolean') return false;
  if (config.type === 'date-range') return { from: '', to: '' };
  return '';
}

function MissingCustom({ name }: { name?: string }) {
  return <div className="rounded-2xl border border-dashed p-3 text-xs text-muted-foreground">Missing custom filter renderer: {name ?? '(unnamed)'}</div>;
}
