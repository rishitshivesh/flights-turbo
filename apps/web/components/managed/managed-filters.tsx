"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countActiveFilters } from "./filter-utils";
import { ManagedFilterForm } from "./managed-filter-form";
import type {
  CustomFilterRegistry,
  FilterFieldConfig,
  QueryFilters,
} from "./types";

export function ManagedFilters({
  fields,
  value,
  onChange,
  customComponents,
  title = "Filters",
  description = "Build the query parameters for this dataset.",
  onInitialOpen,
}: {
  fields: FilterFieldConfig[];
  value: QueryFilters;
  onChange: (filters: QueryFilters) => void;
  customComponents?: CustomFilterRegistry;
  title?: string;
  description?: string;
  onInitialOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(value);

  const initialOpenCalledRef = useRef(false);
  useEffect(() => {
    // Call onInitialOpen the first time the sheet is opened (not on mount)
    if (onInitialOpen && open && !initialOpenCalledRef.current) {
      initialOpenCalledRef.current = true;
      onInitialOpen();
    }
  }, [open, onInitialOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted"
          />
        }
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {active > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-foreground text-[10px] text-background">
            {active}
          </span>
        )}
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
