'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { countActiveFilters } from './filter-utils';
import { ManagedFilterForm } from './managed-filter-form';
import type { CustomFilterRegistry, FilterFieldConfig, QueryFilters } from './types';

export function ManagedFilters({
  fields,
  value,
  onChange,
  customComponents,
  title = 'Filters',
  description = 'Build the query parameters for this dataset.',
}: {
  fields: FilterFieldConfig[];
  value: QueryFilters;
  onChange: (filters: QueryFilters) => void;
  customComponents?: CustomFilterRegistry;
  title?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(value);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button type="button" variant="outline" />}
      >
        <SlidersHorizontal />
        Filters
        {active > 0 && <Badge variant="secondary">{active}</Badge>}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ManagedFilterForm
          fields={fields}
          value={value}
          customComponents={customComponents}
          onCancel={() => setOpen(false)}
          onApply={(next) => {
            onChange(next);
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
