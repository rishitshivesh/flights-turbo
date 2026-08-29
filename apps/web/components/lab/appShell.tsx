'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {type ReactNode, useState} from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  Database,
  FlaskConical,
  Gauge,
  GitBranch,
  Map,
  Menu,
  Network,
  PlaneLanding,
  PlaneTakeoff as Airplane,
  ServerCog,
  TableProperties,
  Ticket,
  TimerReset,
  Users,
  X
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {DynamicIsland} from './dynamicIsland';
import {QuickDock} from './quickDock';

type NavItem = { label: string; href: string; icon: typeof Activity; ready?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const navigation: NavGroup[] = [
    {
        label: 'Workspace',
        items: [{label: 'Overview', href: '/', icon: CircleGauge, ready: true}, {
            label: 'API monitor',
            href: '/monitor',
            icon: Activity,
            ready: true
        }]
    },
    {
        label: 'Explore',
        items: [{label: 'Airports', href: '/explore/airports', icon: PlaneLanding, ready: true}, {
            label: 'Routes',
            href: '/explore/routes',
            icon: GitBranch,
            ready: true
        }, {label: 'Flights', href: '/explore/flights', icon: Airplane}, {
            label: 'Aircraft',
            href: '/explore/aircraft',
            icon: Boxes
        }]
    },
    {
        label: 'Network',
        items: [{label: 'Route Map', href: '/network/route-map', icon: Map, ready: true}, {
            label: 'Airport Network',
            href: '/network/airport-network',
            icon: Network
        }, {label: 'Traffic Flow', href: '/network/traffic-flow', icon: GitBranch}, {
            label: 'Aircraft Range',
            href: '/network/aircraft-range',
            icon: Gauge
        }]
    },
    {
        label: 'Operations',
        items: [{
            label: 'Live-ish Flight Tracker',
            href: '/operations/flight-tracker',
            icon: Airplane
        }, {label: 'Delays', href: '/operations/delays', icon: TimerReset}, {
            label: 'Airport Congestion',
            href: '/operations/airport-congestion',
            icon: Activity
        }, {label: 'Boarding Performance', href: '/operations/boarding-performance', icon: Users}]
    },
    {
        label: 'Passengers',
        items: [{
            label: 'Booking Search',
            href: '/passengers/booking-search',
            icon: Ticket
        }, {label: 'Passenger Journeys', href: '/passengers/journeys', icon: Map}, {
            label: 'Connections',
            href: '/passengers/connections',
            icon: GitBranch
        }, {label: 'Revenue', href: '/passengers/revenue', icon: BarChart3}]
    },
    {
        label: 'Analytics',
        items: [{
            label: 'Route Performance',
            href: '/analytics/route-performance',
            icon: BarChart3
        }, {
            label: 'Airport Rankings',
            href: '/analytics/airport-rankings',
            icon: PlaneLanding
        }, {
            label: 'Aircraft Utilization',
            href: '/analytics/aircraft-utilization',
            icon: Gauge
        }, {label: 'Revenue Analytics', href: '/analytics/revenue', icon: BarChart3}]
    },
    {
        label: 'SQL Lab',
        items: [{
            label: 'Query benchmark',
            href: '/sql-lab/query-benchmark',
            icon: FlaskConical
        }, {label: 'Execution plans', href: '/sql-lab/execution-plans', icon: Database}, {
            label: 'Offset vs keyset',
            href: '/sql-lab/offset-vs-keyset',
            icon: TableProperties
        }, {
            label: 'Index experiments',
            href: '/sql-lab/index-experiments',
            icon: Boxes
        }, {label: 'Before/after optimization', href: '/sql-lab/before-after', icon: ServerCog}]
    },
];

export function AppShell({children}: { children: ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const sidebar = (<aside
        className={cn('flex h-dvh flex-col border-r border-border/60 bg-background/90 backdrop-blur-xl transition-[width] duration-200', collapsed ? 'w-[72px]' : 'w-[268px]')}>
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl border bg-card shadow-sm"><Airplane
                className="size-4"/></div>
            {!collapsed && <div className="min-w-0"><p className="truncate text-sm font-semibold">Flights SQL Lab</p><p
                className="truncate text-[11px] text-muted-foreground">Query · explain · optimize</p></div>}
            <button className="ml-auto hidden rounded-lg p-2 text-muted-foreground hover:bg-muted lg:block"
                    onClick={() => setCollapsed(v => !v)}>{collapsed ? <ChevronRight className="size-4"/> :
                <ChevronLeft className="size-4"/>}</button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">{navigation.map(group => <div
            key={group.label}>{!collapsed &&
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">{group.label}</p>}
            <div className="space-y-1">{group.items.map(item => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                             onClick={() => setMobileOpen(false)}
                             className={cn('group flex min-h-9 items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors', active ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><Icon
                    className="size-4 shrink-0"/>{!collapsed &&
                    <span className="truncate">{item.label}</span>}{!collapsed && !item.ready && <span
                    className={cn('ml-auto rounded px-1.5 py-0.5 text-[9px] font-medium', active ? 'bg-background/15' : 'bg-muted-foreground/10')}>API TODO</span>}
                </Link>
            })}</div>
        </div>)}</nav>
        <div className="border-t border-border/60 p-3"><a href="http://localhost:4001/docs" target="_blank"
                                                          rel="noreferrer"
                                                          className="flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><BookOpen
            className="size-4"/>{!collapsed && <span>API docs</span>}</a></div>
    </aside>);
    return <div className="min-h-dvh bg-background text-foreground">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
        {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
            <div className="relative w-[280px]">{sidebar}</div>
            <button className="absolute right-4 top-4 rounded-full bg-background p-2 shadow-lg"
                    onClick={() => setMobileOpen(false)}><X className="size-4"/></button>
        </div>}
        <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[268px]')}>
            <header
                className="sticky top-0 z-30 flex h-14 items-center border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
                <button className="mr-3 rounded-lg p-2 hover:bg-muted lg:hidden" onClick={() => setMobileOpen(true)}>
                    <Menu className="size-4"/></button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Flights Lab</span><span>/</span><span
                    className="max-w-[460px] truncate text-foreground">{pathname === '/' ? 'overview' : pathname.replace(/^\//, '')}</span>
                </div>
            </header>
            <main className="min-h-[calc(100dvh-56px)] pb-24">{children}</main>
        </div>
        <DynamicIsland/><QuickDock navigation={navigation.flatMap(g => g.items)}/></div>;
}
