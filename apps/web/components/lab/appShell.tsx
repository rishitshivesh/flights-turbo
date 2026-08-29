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
  PlaneTakeoff,
  PlaneTakeoffIcon as Airplane,
  Search,
  ServerCog,
  TableProperties,
  Ticket,
  TimerReset,
  Users,
  X,
} from 'lucide-react';

import {cn} from '@/lib/utils';
import {DynamicIsland} from './dynamicIsland';
import {QuickDock} from './quickDock';

type NavItem = { label: string; href: string; icon: typeof Activity; ready?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const navigation: NavGroup[] = [
    {
        label: 'Workspace',
        items: [
            {label: 'Overview', href: '/', icon: CircleGauge, ready: true},
            {label: 'Route map', href: '/routes', icon: Map, ready: true},
            {label: 'API monitor', href: '/monitor', icon: Activity, ready: true},
        ],
    },
    {
        label: 'Explore',
        items: [
            {label: 'Airports', href: '/todo/airports', icon: PlaneLanding},
            {label: 'Flights', href: '/todo/flights', icon: Airplane},
            {label: 'Aircraft', href: '/todo/aircraft', icon: Boxes},
            {label: 'Bookings', href: '/todo/bookings', icon: Ticket},
            {label: 'Passengers', href: '/todo/passengers', icon: Users},
        ],
    },
    {
        label: 'Network',
        items: [
            {label: 'Route network', href: '/todo/network/routes', icon: Network},
            {label: 'Traffic flow', href: '/todo/network/traffic', icon: GitBranch},
            {label: 'Aircraft range', href: '/todo/network/range', icon: Gauge},
            {label: 'Journey finder', href: '/todo/network/journeys', icon: Search},
        ],
    },
    {
        label: 'Operations',
        items: [
            {label: 'Delays', href: '/todo/operations/delays', icon: TimerReset},
            {label: 'Boarding', href: '/todo/operations/boarding', icon: PlaneTakeoff},
            {label: 'Connections', href: '/todo/operations/connections', icon: GitBranch},
            {label: 'Concurrency', href: '/todo/operations/concurrency', icon: ServerCog},
        ],
    },
    {
        label: 'Analytics',
        items: [
            {label: 'Airport ranking', href: '/todo/analytics/airports', icon: BarChart3},
            {label: 'Route revenue', href: '/todo/analytics/revenue', icon: BarChart3},
            {label: 'Traffic trends', href: '/todo/analytics/trends', icon: Activity},
            {label: 'Seat analytics', href: '/todo/analytics/seats', icon: TableProperties},
        ],
    },
    {
        label: 'SQL Lab',
        items: [
            {label: 'Query bench', href: '/todo/lab/query-bench', icon: FlaskConical},
            {label: 'EXPLAIN plans', href: '/todo/lab/explain', icon: Database},
            {label: 'Index lab', href: '/todo/lab/indexes', icon: Boxes},
            {label: 'Load tests', href: '/todo/lab/load', icon: Gauge},
        ],
    },
];

export function AppShell({children}: { children: ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebar = (
        <aside
            className={cn(
                'flex h-dvh flex-col border-r border-border/60 bg-background/90 backdrop-blur-xl transition-[width] duration-200',
                collapsed ? 'w-[72px]' : 'w-[256px]',
            )}
        >
            <div className="flex h-16 items-center gap-3 border-b border-border/60 px-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl border bg-card shadow-sm">
                    <Airplane className="size-4"/>
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">Flights SQL Lab</p>
                        <p className="truncate text-[11px] text-muted-foreground">PostgreSQL playground</p>
                    </div>
                )}
                <button
                    className="ml-auto hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:block"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <ChevronRight className="size-4"/> : <ChevronLeft className="size-4"/>}
                </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
                {navigation.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const active = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={collapsed ? item.label : undefined}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'group flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-colors',
                                            active
                                                ? 'bg-foreground text-background shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="size-4 shrink-0"/>
                                        {!collapsed && <span className="truncate">{item.label}</span>}
                                        {!collapsed && !item.ready && (
                                            <span
                                                className={cn('ml-auto rounded px-1.5 py-0.5 text-[9px] font-medium', active ? 'bg-background/15' : 'bg-muted-foreground/10')}>
                        TODO
                      </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-border/60 p-3">
                <a
                    href="http://localhost:4001/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    title={collapsed ? 'API docs' : undefined}
                >
                    <BookOpen className="size-4"/>
                    {!collapsed && <span>API docs</span>}
                </a>
            </div>
        </aside>
    );

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)} aria-label="Close menu"/>
                    <div className="relative w-[280px]">{sidebar}</div>
                    <button className="absolute right-4 top-4 rounded-full bg-background p-2 shadow-lg"
                            onClick={() => setMobileOpen(false)}>
                        <X className="size-4"/>
                    </button>
                </div>
            )}

            <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[72px]' : 'lg:pl-[256px]')}>
                <header
                    className="sticky top-0 z-30 flex h-14 items-center border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
                    <button className="mr-3 rounded-lg p-2 hover:bg-muted lg:hidden"
                            onClick={() => setMobileOpen(true)}>
                        <Menu className="size-4"/>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>SQL Lab</span>
                        <span>/</span>
                        <span
                            className="max-w-[260px] truncate text-foreground">{pathname === '/' ? 'overview' : pathname.replace(/^\//, '')}</span>
                    </div>
                </header>
                <main className="min-h-[calc(100dvh-56px)] pb-24">{children}</main>
            </div>

            <DynamicIsland/>
            <QuickDock navigation={navigation.flatMap((group) => group.items)}/>
        </div>
    );
}
