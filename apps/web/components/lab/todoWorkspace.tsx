'use client';

import { useMemo, useState } from 'react';
import { Braces, Database, FlaskConical, PlugZap, Search } from 'lucide-react';

import { DataTable, FilterBar, type DataColumn } from './dataTable';
import { BorderGlowCard, ExpandableInspector, GlassIcon } from './visualKit';

const suggestions: Record<string, string[]> = {
  airports: ['Airport details', 'Traffic heatmap', 'Connectivity rank'],
  flights: ['Flight search', 'Delay leaderboard', 'Live-ish tracker'],
  aircraft: ['Seat layouts', 'Range analysis', 'Type utilization'],
  bookings: ['Booking lookup', 'Revenue breakdown', 'Journey reconstruction'],
  passengers: ['Passenger itinerary', 'Top spenders', 'Origin/destination flow'],
  routes: ['Route network', 'Traffic weights', 'Centrality'],
  traffic: ['Flight flow', 'Passenger flow', 'Peak windows'],
  range: ['Great-circle distance', 'Reachable airports', 'Range bands'],
  journeys: ['Recursive path search', 'Fewest stops', 'Shortest duration'],
  delays: ['Delay ranking', 'Route delay distribution', 'Airport delay trend'],
  boarding: ['Boarding timeline', 'Boarding rate', 'Late boarding'],
  connections: ['Layover calculation', 'Connection risk', 'Missed connections'],
  concurrency: ['Peak active flights', 'Event sweep', 'Airport pressure'],
  revenue: ['Route revenue', 'Fare distribution', 'Percentiles'],
  trends: ['Rolling 7-day traffic', 'LAG growth', 'Seasonality'],
  seats: ['Seat popularity', 'Cabin mix', 'Assignment distribution'],
  explain: ['EXPLAIN JSON', 'Buffer analysis', 'Plan comparison'],
  indexes: ['Composite indexes', 'Partial indexes', 'Covering indexes'],
  load: ['p50/p95/p99', 'Pool pressure', 'Throughput'],
};

export function TodoWorkspace({ slug }: { slug: string[] }) {
  const key = slug.at(-1) ?? 'workspace';
  const title = slug.map((part) => part.replaceAll('-', ' ')).map(titleCase).join(' / ');
  const items = suggestions[key] ?? ['Design API contract', 'Write SQL query', 'Benchmark under load'];
  const [search, setSearch] = useState('');

  const sample = useMemo(() => items.filter((item) => item.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const rows = sample.map((item, index) => ({ id: String(index + 1), idea: item, status: 'TODO', api: 'Not wired' }));
  const columns: DataColumn<(typeof rows)[number]>[] = [
    { key: 'idea', header: 'Surface', cell: (row) => <span className="font-medium">{row.idea}</span> },
    { key: 'status', header: 'Status', cell: (row) => <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-600 dark:text-amber-400">{row.status}</span> },
    { key: 'api', header: 'API', cell: (row) => <span className="text-muted-foreground">{row.api}</span> },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3"><GlassIcon><FlaskConical className="size-4" /></GlassIcon><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">API workspace · TODO</span></div>
            <h1 className="text-3xl font-semibold capitalize tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">The presentation layer is ready. Add the Nest endpoint and SQL when you reach this challenge; the route, filters, table and inspection affordances do not need to be rebuilt.</p>
          </div>
          <ExpandableInspector title="Open data inspector"><InspectorContent /></ExpandableInspector>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <BorderGlowCard><StatusCard icon={<Database className="size-4" />} label="Database" value="Postgres Pro" hint="raw SQL only" /></BorderGlowCard>
        <BorderGlowCard><StatusCard icon={<PlugZap className="size-4" />} label="API" value="TODO" hint="wire a REST endpoint" /></BorderGlowCard>
        <BorderGlowCard><StatusCard icon={<Braces className="size-4" />} label="UI contract" value="Ready" hint="table + filters + inspect" /></BorderGlowCard>
      </section>

      <FilterBar search={search} onSearch={setSearch} placeholder={`Filter ${key} ideas…`} />
      <DataTable rows={rows} columns={columns} rowKey={(row) => row.id} />

      <section className="rounded-2xl border border-dashed bg-muted/15 p-5">
        <div className="flex items-start gap-3"><Search className="mt-0.5 size-4 text-muted-foreground" /><div><p className="text-sm font-medium">Suggested workflow</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Write the naive SQL first → capture EXPLAIN ANALYZE → expose it through Nest → load test → optimize query/indexes → compare p95 in Monitor.</p></div></div>
      </section>
    </div>
  );
}

function StatusCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return <div className="p-5"><div className="text-muted-foreground">{icon}</div><p className="mt-5 text-xl font-semibold">{value}</p><p className="mt-1 text-xs font-medium">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></div>;
}

function InspectorContent() {
  return <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-dashed bg-muted/10 p-8 text-center"><div><Database className="mx-auto size-8 text-muted-foreground" /><p className="mt-4 font-medium">Expandable data workspace</p><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Use this surface for raw JSON, row details, EXPLAIN plans, SQL text, route metadata or any large result you do not want crushed into a modal.</p></div></div>;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
