'use client';

import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowRight, Database, Gauge, Network, PlaneTakeoff, Rows3, TimerReset } from 'lucide-react';

import { SqlTerminal } from './sqlTerminal';
import { BorderGlowCard, ExpandableInspector, GlassIcon, QueryFolder, ShiftPreviewCard, SortableList } from './visualKit';
import { DataTable, type DataColumn } from './dataTable';

const sampleLatency = [
  { request: '1', p95: 18 }, { request: '2', p95: 22 }, { request: '3', p95: 19 }, { request: '4', p95: 31 },
  { request: '5', p95: 27 }, { request: '6', p95: 42 }, { request: '7', p95: 25 }, { request: '8', p95: 23 },
];

const challenges = [
  { id: '1', title: 'Unique route map', subtitle: 'DISTINCT ON · joins · point coordinates' },
  { id: '2', title: 'Airport leaderboard', subtitle: 'GROUP BY · FILTER · RANK()' },
  { id: '3', title: 'Passenger itinerary', subtitle: 'multi-table joins · LAG() · intervals' },
  { id: '4', title: 'Recursive journey finder', subtitle: 'WITH RECURSIVE · cycle detection' },
  { id: '5', title: 'Peak airport concurrency', subtitle: 'event stream · window SUM()' },
];

const planned = [
  { name: 'Route revenue', difficulty: 'Intermediate', concept: 'Aggregations + FILTER' },
  { name: 'Connection risk', difficulty: 'Hard', concept: 'LEAD/LAG + intervals' },
  { name: 'Reachable airports', difficulty: 'Hard', concept: 'Recursive CTE' },
];

type PlannedRow = (typeof planned)[number];
const columns: DataColumn<PlannedRow>[] = [
  { key: 'name', header: 'Challenge', cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: 'difficulty', header: 'Difficulty', cell: (row) => <span className="rounded-md bg-muted px-2 py-1 text-xs">{row.difficulty}</span> },
  { key: 'concept', header: 'Primary SQL', cell: (row) => <span className="text-muted-foreground">{row.concept}</span> },
];

export function LabOverview() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col justify-center rounded-3xl border bg-card p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3"><GlassIcon><Database className="size-4" /></GlassIcon><span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">PostgreSQL performance playground</span></div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Build ugly queries. Measure them. Make PostgreSQL forgive you.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">The UI shell is ready. Your job is to wire APIs, write SQL, inspect execution plans, then watch p95 expose every optimistic assumption you made.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/todo/lab/query-bench" className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background">Open query lab <ArrowRight className="size-4" /></Link>
            <Link href="/monitor" className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium">API monitor</Link>
          </div>
        </div>
        <SqlTerminal />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BorderGlowCard><Metric icon={<Rows3 className="size-4" />} label="Dataset" value="5.4 GB" hint="Postgres Pro demo" /></BorderGlowCard>
        <BorderGlowCard><Metric icon={<Activity className="size-4" />} label="Gateway" value="7 days" hint="local request retention" /></BorderGlowCard>
        <BorderGlowCard><Metric icon={<Gauge className="size-4" />} label="Target" value="p95" hint="optimize under load" /></BorderGlowCard>
        <BorderGlowCard><Metric icon={<Network className="size-4" />} label="Graph" value="Routes" hint="recursive CTE territory" /></BorderGlowCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-sm font-semibold">Latency playground</p><p className="text-xs text-muted-foreground">Sample chart ready for real gateway series</p></div><TimerReset className="size-4 text-muted-foreground" /></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleLatency}><defs><linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="currentColor" stopOpacity={0.22}/><stop offset="95%" stopColor="currentColor" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.15}/><XAxis dataKey="request" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={11} width={34}/><Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }}/><Area type="monotone" dataKey="p95" stroke="currentColor" fill="url(#latencyFill)" strokeWidth={2}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5"><div className="mb-4"><p className="text-sm font-semibold">Challenge queue</p><p className="text-xs text-muted-foreground">Drag to reorder what you attack next.</p></div><SortableList initialItems={challenges} /></div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ShiftPreviewCard eyebrow="Network" title="Route intelligence" description="Unique paths, traffic weights, centrality, aircraft range and recursive journeys." detail="Best for joins, DISTINCT ON, CTEs, arrays, ranges and coordinate math." />
        <ShiftPreviewCard eyebrow="Operations" title="Airport pressure" description="Delays, boarding velocity, missed connections and peak concurrency." detail="Best for window functions, event streams, interval arithmetic and temporal joins." />
        <ShiftPreviewCard eyebrow="Analytics" title="Money & movement" description="Revenue, passengers, route rankings, percentiles and traffic trends." detail="Best for filtered aggregates, percentiles, partitions and pre-aggregation experiments." />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <QueryFolder title="Network queries" count={8}><p className="text-xs text-muted-foreground">Routes · connectivity · range · graph traversal</p></QueryFolder>
        <QueryFolder title="Operations queries" count={7}><p className="text-xs text-muted-foreground">Flights · delays · boarding · concurrency</p></QueryFolder>
        <QueryFolder title="Analytics queries" count={9}><p className="text-xs text-muted-foreground">Revenue · passengers · rankings · percentiles</p></QueryFolder>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-lg font-semibold">Planned API surfaces</p><p className="text-sm text-muted-foreground">Generic table primitive, already waiting for your response data.</p></div><ExpandableInspector title="Explore table fullscreen"><DataTable rows={planned} columns={columns} rowKey={(row) => row.name} /></ExpandableInspector></div>
        <DataTable rows={planned} columns={columns} rowKey={(row) => row.name} />
      </section>
    </div>
  );
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return <div className="p-5"><div className="flex items-center justify-between text-muted-foreground">{icon}<PlaneTakeoff className="size-3.5 opacity-40" /></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs font-medium">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{hint}</p></div>;
}
