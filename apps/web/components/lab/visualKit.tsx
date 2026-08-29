'use client';

import { useState, type ReactNode } from 'react';
import { Expand, FolderOpen, GripVertical, Sparkles, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export function BorderGlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('group relative rounded-2xl p-px', className)}>
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,var(--color-chart-1)_80deg,transparent_150deg,var(--color-chart-2)_240deg,transparent_320deg)] opacity-20 blur-sm transition-opacity group-hover:opacity-50" />
      <div className="relative h-full rounded-[15px] border bg-card">{children}</div>
    </div>
  );
}

export function GlassIcon({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid size-10 place-items-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,.18)] backdrop-blur-xl">
      <div className="absolute inset-x-1 top-1 h-1/3 rounded-full bg-white/10 blur-md" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function ShiftPreviewCard({ eyebrow, title, description, detail }: { eyebrow: string; title: string; description: string; detail: string }) {
  return (
    <div className="group relative min-h-48 overflow-hidden rounded-2xl border bg-card p-5">
      <div className="transition-transform duration-300 group-hover:-translate-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="absolute inset-x-4 bottom-4 translate-y-14 rounded-xl border bg-background/95 p-3 text-xs text-muted-foreground shadow-lg transition-transform duration-300 group-hover:translate-y-0">
        {detail}
      </div>
    </div>
  );
}

export function QueryFolder({ title, count, children }: { title: string; count: number; children?: ReactNode }) {
  return (
    <div className="group relative pt-3">
      <div className="absolute left-4 top-0 h-5 w-24 rounded-t-xl border border-b-0 bg-muted" />
      <div className="relative rounded-2xl border bg-card p-4 transition-transform group-hover:-translate-y-1">
        <div className="flex items-center gap-3">
          <GlassIcon><FolderOpen className="size-4" /></GlassIcon>
          <div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{count} planned queries</p></div>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

export function ExpandableInspector({ title = 'Inspect dataset', children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm shadow-sm hover:bg-muted"><Expand className="size-4" /> {title}</button>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/55 p-3 backdrop-blur-md sm:p-6">
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <div className="flex items-center border-b px-4 py-3"><Sparkles className="mr-2 size-4" /><span className="text-sm font-medium">{title}</span><button onClick={() => setOpen(false)} className="ml-auto rounded-lg p-2 hover:bg-muted"><X className="size-4" /></button></div>
            <div className="flex-1 overflow-auto p-5">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

export function SortableList<T extends { id: string; title: string; subtitle?: string }>({ initialItems }: { initialItems: T[] }) {
  const [items, setItems] = useState(initialItems);
  const [dragged, setDragged] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragged(index)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragged === null || dragged === index) return;
            const next = [...items];
            const [moved] = next.splice(dragged, 1);
            next.splice(index, 0, moved);
            setItems(next);
            setDragged(null);
          }}
          className="flex cursor-grab items-center gap-3 rounded-xl border bg-background px-3 py-3 active:cursor-grabbing"
        >
          <GripVertical className="size-4 text-muted-foreground" />
          <div className="min-w-0"><p className="truncate text-sm font-medium">{item.title}</p>{item.subtitle && <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>}</div>
          <span className="ml-auto rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">#{index + 1}</span>
        </div>
      ))}
    </div>
  );
}
