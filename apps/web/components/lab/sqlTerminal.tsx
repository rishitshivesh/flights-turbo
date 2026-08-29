'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Database, Play } from 'lucide-react';

const lines = [
  '$ yarn dev',
  '✓ Nest REST API listening on :4001',
  '✓ Next.js workspace listening on :3000',
  '→ SELECT DISTINCT ON (departure_airport, arrival_airport)',
  '→ EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)',
  '✓ query 18.42ms · 50 rows · cache hit 97.8%',
];

export function SqlTerminal() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => setVisible((value) => (value >= lines.length ? 1 : value + 1)), 850);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <div className="ml-3 flex items-center gap-2 text-[11px] text-zinc-500"><Database className="size-3" /> query-lab</div>
      </div>
      <div className="min-h-[240px] space-y-2 p-5 font-mono text-xs leading-6 sm:text-sm">
        {lines.slice(0, visible).map((line, index) => (
          <div key={`${line}-${index}`} className={index === visible - 1 ? 'animate-pulse text-emerald-300' : 'text-zinc-400'}>
            <ChevronRight className="mr-2 inline size-3 text-zinc-700" />{line}
          </div>
        ))}
        <div className="mt-4 flex items-center gap-2 text-zinc-600"><Play className="size-3" /> waiting for your next SQL experiment…</div>
      </div>
    </div>
  );
}
