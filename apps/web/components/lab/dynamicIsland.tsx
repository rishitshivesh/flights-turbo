'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleX, LoaderCircle } from 'lucide-react';

type IslandState = { visible: boolean; ok: boolean; label: string; meta?: string };

export function DynamicIsland() {
  const [state, setState] = useState<IslandState>({ visible: false, ok: true, label: 'Ready' });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const show = (next: IslandState) => {
      if (timer.current) window.clearTimeout(timer.current);
      setState(next);
      timer.current = window.setTimeout(() => setState((value) => ({ ...value, visible: false })), 2600);
    };

    const onApi = (event: Event) => {
      const detail = (event as CustomEvent<{ path: string; status: number; ok: boolean; durationMs: number }>).detail;
      show({
        visible: true,
        ok: detail.ok,
        label: detail.ok ? 'API request complete' : 'API request failed',
        meta: `${detail.status} · ${detail.durationMs}ms · ${detail.path.split('?')[0]}`,
      });
    };

    const onOffline = () => show({ visible: true, ok: false, label: 'You are offline', meta: 'Requests will fail until connectivity returns.' });
    const onOnline = () => show({ visible: true, ok: true, label: 'Connection restored', meta: 'Network is available again.' });

    window.addEventListener('flights:api-response', onApi);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('flights:api-response', onApi);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[80] -translate-x-1/2">
      <div className={`flex min-w-[220px] items-center gap-3 rounded-full border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white shadow-2xl transition-all duration-300 ${state.visible ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 scale-95 opacity-0'}`}>
        <div className={`grid size-7 place-items-center rounded-full ${state.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {state.ok ? <CheckCircle2 className="size-3.5" /> : <CircleX className="size-3.5" />}
        </div>
        <div className="min-w-0"><p className="text-xs font-medium">{state.label}</p>{state.meta && <p className="max-w-[340px] truncate text-[10px] text-zinc-500">{state.meta}</p>}</div>
        <LoaderCircle className="ml-auto size-3.5 text-zinc-700" />
      </div>
    </div>
  );
}
