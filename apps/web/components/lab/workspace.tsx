'use client';

import {useMemo, useState} from 'react';
import {
    Activity,
    BarChart3,
    CircleDollarSign,
    Clock3,
    Gauge,
    MapPin,
    PlaneLanding,
    PlaneTakeoff as Airplane,
    TimerReset,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {Map} from '@/components/ui/map';
import {FlightMultiRoute, FlightNetwork, FlightRange, FlightTracker} from '@/components/ui/flight';
import Airports from '@/components/airports';
import {type DataColumn, DataTable, FilterBar, useLocalFilter} from './dataTable';
import {BorderGlowCard, ExpandableInspector, GlassIcon, ShiftPreviewCard, SortableList} from './visualKit';
import {getPagePlan, type LabPageId} from './pageCatalog';
import {
    buildSeatRows,
    mockAircraft,
    mockAirports,
    mockBenchmarks,
    mockBookings,
    mockDailyTraffic,
    mockDelayTrend,
    mockFlights,
    mockNetworkRoutes,
    mockPlanNodes,
    mockRevenueTrend,
    mockRoutePerformance,
} from './mockData';

function Pill({children}: { children: React.ReactNode }) {
    return <span
        className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">{children}</span>;
}

function Metric({label, value, sub, icon: Icon = Activity}: {
    label: string;
    value: string;
    sub?: string;
    icon?: typeof Activity
}) {
    return (
        <BorderGlowCard>
            <div className="p-4">
                <div className="flex items-center justify-between"><p
                    className="text-xs text-muted-foreground">{label}</p><GlassIcon><Icon
                    className="size-4"/></GlassIcon></div>
                <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
                {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </div>
        </BorderGlowCard>
    );
}

export function ImplementationPlan({id}: { id: LabPageId }) {
    const plan = getPagePlan(id);
    return (
        <section className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your
                        SQL/API work</p>
                    <h2 className="mt-2 text-lg font-semibold">Implementation plan</h2>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">The frontend is already shaped
                        for this contract. Replace mock data with <code
                            className="rounded bg-muted px-1 py-0.5">{plan.endpoint}</code>.</p>
                </div>
                <span className="w-fit rounded-full border px-3 py-1 text-xs font-medium">{plan.difficulty}</span>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                <div className="space-y-3">
                    {plan.tasks.map((task, index) => (
                        <div key={task} className="flex gap-3 rounded-xl border bg-background p-3">
                            <div
                                className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">{index + 1}</div>
                            <p className="text-sm leading-6">{task}</p>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 rounded-xl border bg-background p-4">
                    <div><p className="text-xs font-medium">Tables / views</p>
                        <div className="mt-2 flex flex-wrap gap-2">{plan.tables.map((x) => <Pill
                            key={x}>{x}</Pill>)}</div>
                    </div>
                    <div><p className="text-xs font-medium">Concepts exercised</p>
                        <div className="mt-2 flex flex-wrap gap-2">{plan.concepts.map((x) => <Pill
                            key={x}>{x}</Pill>)}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PageHeader({id}: { id: LabPageId }) {
    const plan = getPagePlan(id);
    return (
        <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Pill>{plan.group}</Pill><Pill>{plan.difficulty}</Pill><span className="text-[11px] text-amber-600">Mock data until your API is wired</span>
            </div>
            <div><h1 className="text-3xl font-semibold tracking-tight">{plan.title}</h1><p
                className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{plan.description}</p></div>
            <div className="flex flex-wrap gap-2">{plan.filters.map((filter) => <Pill
                key={filter}>{filter}</Pill>)}</div>
        </header>
    );
}

function GenericTable({id}: { id: LabPageId }) {
    const [query, setQuery] = useState('');
    const rows = useLocalFilter(mockFlights, query, (row) => Object.values(row).join(' '));
    const columns: DataColumn<(typeof mockFlights)[number]>[] = [
        {
            key: 'flight',
            header: 'Flight',
            cell: (r) => <div><p className="font-medium">#{r.flightId}</p><p
                className="text-xs text-muted-foreground">{r.routeNo}</p></div>
        },
        {key: 'route', header: 'Route', cell: (r) => `${r.from} → ${r.to}`},
        {key: 'status', header: 'Status', cell: (r) => <Pill>{r.status}</Pill>},
        {
            key: 'aircraft',
            header: 'Aircraft',
            cell: (r) => <div><p>{r.model}</p><p className="text-xs text-muted-foreground">{r.airplaneCode}</p></div>
        },
        {key: 'delay', header: 'Delay', cell: (r) => `${r.delayMinutes} min`},
    ];
    return <div className="space-y-3"><FilterBar search={query} onSearch={setQuery}
                                                 placeholder={`Filter ${getPagePlan(id).title.toLowerCase()}…`}/><DataTable
        rows={rows} columns={columns} rowKey={(r) => String(r.flightId)}/></div>;
}

function AirportsView() {
    return <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-4"><p className="mb-3 text-xs text-muted-foreground">This page
            keeps your existing <code>/api/airports</code> integration.</p><Airports/></div>
        <ImplementationPlan id="airports"/></div>;
}

function FlightsView() {
    const [query, setQuery] = useState('');
    const rows = useLocalFilter(mockFlights, query, (r) => Object.values(r).join(' '));
    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Flights in window" value="18,482"
                                                                              icon={Airplane}/><Metric label="Delayed"
                                                                                                       value="8.7%"
                                                                                                       icon={TimerReset}/><Metric
                label="Cancelled" value="1.3%" icon={Clock3}/><Metric label="p95 delay" value="52 min" icon={Gauge}/>
            </div>
            <FilterBar search={query} onSearch={setQuery} placeholder="Flight id, route, airport, status…"><select
                className="h-10 rounded-xl border bg-background px-3 text-sm">
                <option>All statuses</option>
                <option>Scheduled</option>
                <option>Delayed</option>
                <option>Arrived</option>
            </select></FilterBar>
            <DataTable rows={rows} rowKey={(r) => String(r.flightId)} columns={[
                {
                    key: 'id',
                    header: 'Flight',
                    cell: (r) => <div><p className="font-medium">#{r.flightId}</p><p
                        className="text-xs text-muted-foreground">{r.routeNo}</p></div>
                },
                {key: 'route', header: 'Route', cell: (r) => `${r.from} → ${r.to}`},
                {key: 'status', header: 'Status', cell: (r) => <Pill>{r.status}</Pill>},
                {
                    key: 'schedule',
                    header: 'Scheduled',
                    cell: (r) => <div className="text-xs"><p>{new Date(r.scheduledDeparture).toLocaleString()}</p><p
                        className="text-muted-foreground">→ {new Date(r.scheduledArrival).toLocaleString()}</p></div>
                },
                {key: 'aircraft', header: 'Aircraft', cell: (r) => r.model}, {
                    key: 'delay',
                    header: 'Delay',
                    cell: (r) => `${r.delayMinutes} min`
                },
            ]}/>
            <ImplementationPlan id="flights"/>
        </div>
    );
}

function AircraftView() {
    const [selected, setSelected] = useState(mockAircraft[0]);
    const seats = buildSeatRows();
    return (
        <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-3">{mockAircraft.map((a) => <button key={a.airplaneCode}
                                                                            onClick={() => setSelected(a)}
                                                                            className={`w-full rounded-2xl border p-4 text-left ${selected.airplaneCode === a.airplaneCode ? 'bg-foreground text-background' : 'bg-card'}`}>
                    <div className="flex justify-between"><p className="font-medium">{a.model}</p><span
                        className="text-xs">{a.airplaneCode}</span></div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs opacity-80">
                        <span>{a.speed} km/h</span><span>{a.range} km</span><span>{a.seats} seats</span></div>
                </button>)}</div>
                <div className="rounded-2xl border bg-card p-5">
                    <div className="flex items-start justify-between">
                        <div><p className="text-xs text-muted-foreground">Seat map · synthetic occupancy</p><h2
                            className="text-xl font-semibold">{selected.model}</h2></div>
                        <ExpandableInspector title="Inspect seat rows">
                            <pre className="text-xs">{JSON.stringify(seats, null, 2)}</pre>
                        </ExpandableInspector></div>
                    <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-8 xl:grid-cols-12">{seats.map((seat) =>
                        <div key={seat.seatNo} title={`${seat.seatNo} · ${seat.fareCondition}`}
                             className={`grid h-9 place-items-center rounded-lg border text-[10px] ${seat.occupied ? 'bg-foreground text-background' : 'bg-background'} ${seat.fareCondition === 'Business' ? 'ring-1 ring-chart-1/50' : ''}`}>{seat.seatNo}</div>)}</div>
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4"><Metric label="Range"
                                                               value={`${selected.range.toLocaleString()} km`}
                                                               icon={Gauge}/><Metric label="Cruise speed"
                                                                                     value={`${selected.speed} km/h`}
                                                                                     icon={Activity}/><Metric
                label="Seat capacity" value={String(selected.seats)} icon={Users}/><Metric label="Configured routes"
                                                                                           value={String(selected.routes)}
                                                                                           icon={MapPin}/></div>
            <ImplementationPlan id="aircraft"/>
        </div>
    );
}

function NetworkView({id}: { id: LabPageId }) {
    const isRange = id === 'aircraft-range';
    const [aircraft, setAircraft] = useState(mockAircraft[0]);
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2"><select value={aircraft.airplaneCode}
                                                          onChange={(e) => setAircraft(mockAircraft.find(a => a.airplaneCode === e.target.value) ?? mockAircraft[0])}
                                                          className="h-10 rounded-xl border bg-background px-3 text-sm">{mockAircraft.map(a =>
                <option key={a.airplaneCode} value={a.airplaneCode}>{a.model}</option>)}</select><select
                className="h-10 rounded-xl border bg-background px-3 text-sm">
                <option>DME · Moscow</option>
                <option>LED · Saint Petersburg</option>
            </select></div>
            <div className="h-[560px] overflow-hidden rounded-2xl border"><Map className="h-full w-full"
                                                                               center={[55, 57]} zoom={2.5}>{isRange ?
                <FlightRange origin="DME"
                             ranges={[{distance: aircraft.range}, {distance: Math.round(aircraft.range * .65)}]}/> :
                <FlightNetwork routes={mockNetworkRoutes}/>}</Map></div>
            <div className="grid gap-3 sm:grid-cols-3"><Metric label={isRange ? 'Aircraft range' : 'Weighted edges'}
                                                               value={isRange ? `${aircraft.range.toLocaleString()} km` : '542'}
                                                               icon={Gauge}/><Metric label="Airports" value="128"
                                                                                     icon={PlaneLanding}/><Metric
                label={isRange ? 'Reachable (mock)' : 'Top hub'} value={isRange ? '74' : 'DME'} icon={MapPin}/></div>
            <ImplementationPlan id={id}/>
        </div>
    );
}

function TrackerView() {
    const [selectedId, setSelectedId] = useState(mockFlights[0].flightId);
    const [progress, setProgress] = useState(mockFlights[0].progress);
    const flight = mockFlights.find((f) => f.flightId === selectedId) ?? mockFlights[0];
    return (
        <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                <div className="space-y-3">{mockFlights.map((f) => <button key={f.flightId} onClick={() => {
                    setSelectedId(f.flightId);
                    setProgress(f.progress)
                }}
                                                                           className={`w-full rounded-2xl border p-4 text-left ${f.flightId === selectedId ? 'bg-foreground text-background' : 'bg-card'}`}>
                    <div className="flex justify-between"><span className="font-medium">#{f.flightId}</span><span
                        className="text-xs">{f.status}</span></div>
                    <p className="mt-2 text-sm">{f.from} → {f.to}</p><p
                    className="mt-1 text-xs opacity-70">{f.model}</p></button>)}</div>
                <div className="space-y-3">
                    <div className="h-[520px] overflow-hidden rounded-2xl border"><Map className="h-full w-full"
                                                                                       center={[55, 57]}
                                                                                       zoom={2.8}><FlightTracker
                        from={flight.from} to={flight.to} progress={progress} altitude={flight.altitude}
                        speed={flight.speed} showInfo/></Map></div>
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between text-xs">
                            <span>Frontend simulation control</span><span>{Math.round(progress * 100)}%</span></div>
                        <input type="range" min={0} max={1} step={0.01} value={progress}
                               onChange={(e) => setProgress(Number(e.target.value))} className="mt-3 w-full"/><p
                        className="mt-2 text-xs text-muted-foreground">When actual departure/arrival is missing, this
                        lets the frontend simulate “now” without requiring telemetry in your DB.</p></div>
                </div>
            </div>
            <ImplementationPlan id="flight-tracker"/>
        </div>
    );
}

function DelaysView() {
    return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Average delay" value="14.6 min"
                                                           icon={TimerReset}/><Metric label="p95" value="52 min"
                                                                                      icon={Gauge}/><Metric
            label="Delayed flights" value="1,608"/><Metric label="Worst route" value="DME → OVB"/></div>
        <div className="h-72 rounded-2xl border bg-card p-4"><ResponsiveContainer width="100%" height="100%"><LineChart
            data={mockDelayTrend}><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis
            dataKey="day"/><YAxis/><Tooltip/><Line type="monotone" dataKey="avg" stroke="currentColor"/><Line
            type="monotone" dataKey="p95" stroke="currentColor"
            strokeDasharray="5 5"/></LineChart></ResponsiveContainer></div>
        <GenericTable id="delays"/><ImplementationPlan id="delays"/></div>;
}

function CongestionView() {
    return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3"><Metric label="Peak hour" value="16:00–17:00"/><Metric
            label="Peak movements" value="121"/><Metric label="Peak concurrency" value="38"/></div>
        <div className="h-80 rounded-2xl border bg-card p-4"><ResponsiveContainer width="100%" height="100%"><BarChart
            data={mockDailyTraffic}><CartesianGrid strokeDasharray="3 3" opacity={0.2}/><XAxis
            dataKey="bucket"/><YAxis/><Tooltip/><Bar dataKey="departures" fill="currentColor" opacity={0.75}/><Bar
            dataKey="arrivals" fill="currentColor" opacity={0.3}/></BarChart></ResponsiveContainer></div>
        <ImplementationPlan id="airport-congestion"/></div>;
}

function BoardingView() {
    const seats = buildSeatRows(12);
    return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Passengers" value="164"/><Metric label="Boarded"
                                                                                                   value="138"/><Metric
            label="Duration" value="31 min"/><Metric label="Rate" value="4.45 / min"/></div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl border bg-card p-5"><h3 className="font-medium">Flight #187322 seat / boarding
                view</h3><p className="text-xs text-muted-foreground">Occupancy and boarded state are synthetic until
                your boarding endpoint is wired.</p>
                <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-12">{seats.map(s => <div key={s.seatNo}
                                                                                                  className={`grid h-9 place-items-center rounded-lg border text-[10px] ${s.boarded ? 'bg-foreground text-background' : 'bg-background'}`}>{s.seatNo}</div>)}</div>
            </div>
            <div className="rounded-2xl border bg-card p-5"><h3 className="font-medium">Boarding order</h3>
                <div className="mt-4 space-y-2">{seats.slice(0, 10).map((s, i) => <div key={s.seatNo}
                                                                                       className="flex items-center rounded-lg border px-3 py-2 text-xs">
                    <span>#{i + 1}</span><span className="ml-3 font-medium">Seat {s.seatNo}</span><span
                    className="ml-auto text-muted-foreground">{s.fareCondition}</span></div>)}</div>
            </div>
        </div>
        <ImplementationPlan id="boarding-performance"/></div>;
}

function BookingView({id}: { id: 'booking-search' | 'passenger-revenue' }) {
    const [query, setQuery] = useState('');
    const rows = useLocalFilter(mockBookings, query, (r) => Object.values(r).join(' '));
    return <div className="space-y-6">{id === 'passenger-revenue' &&
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Passenger revenue" value="₹ 4.21B"
                                                           icon={CircleDollarSign}/><Metric label="Avg segment fare"
                                                                                            value="₹ 8,240"/><Metric
            label="Business share" value="18.6%"/><Metric label="Passengers" value="2.1M"/></div>}<FilterBar
        search={query} onSearch={setQuery} placeholder="Booking ref, passenger, seat…"/><DataTable rows={rows}
                                                                                                   rowKey={(r) => r.bookRef}
                                                                                                   columns={[{
                                                                                                       key: 'ref',
                                                                                                       header: 'Booking',
                                                                                                       cell: (r) =>
                                                                                                           <div><p
                                                                                                               className="font-medium">{r.bookRef}</p>
                                                                                                               <p className="text-xs text-muted-foreground">{new Date(r.bookDate).toLocaleDateString()}</p>
                                                                                                           </div>
                                                                                                   }, {
                                                                                                       key: 'pax',
                                                                                                       header: 'Passenger',
                                                                                                       cell: (r) =>
                                                                                                           <div>
                                                                                                               <p>{r.passengerName}</p>
                                                                                                               <p className="text-xs text-muted-foreground">{r.passengerId}</p>
                                                                                                           </div>
                                                                                                   }, {
                                                                                                       key: 'segments',
                                                                                                       header: 'Segments',
                                                                                                       cell: (r) => r.segments
                                                                                                   }, {
                                                                                                       key: 'seat',
                                                                                                       header: 'Seat',
                                                                                                       cell: (r) => r.seat
                                                                                                   }, {
                                                                                                       key: 'fare',
                                                                                                       header: 'Fare',
                                                                                                       cell: (r) =>
                                                                                                           <Pill>{r.fareCondition}</Pill>
                                                                                                   }, {
                                                                                                       key: 'total',
                                                                                                       header: 'Total',
                                                                                                       cell: (r) => `₹ ${r.totalAmount.toLocaleString()}`
                                                                                                   }]}/><ImplementationPlan
        id={id}/></div>;
}

function JourneyView({id}: { id: 'passenger-journeys' | 'connections' }) {
    const waypoints = ['DME', 'KZN', 'SVX', 'OVB'];
    return <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
            <div className="h-[520px] overflow-hidden rounded-2xl border"><Map className="h-full w-full"
                                                                               center={[60, 56]}
                                                                               zoom={2.7}><FlightMultiRoute
                waypoints={waypoints} showAirports showLabel animate={{duration: 9000}}/></Map></div>
            <div className="rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">Mock passenger
                itinerary</p><h2 className="mt-1 text-lg font-semibold">DME → KZN → SVX → OVB</h2>
                <div className="mt-5 space-y-3">{waypoints.slice(0, -1).map((from, i) => <div key={from}
                                                                                              className="rounded-xl border bg-background p-3">
                    <div className="flex justify-between text-sm">
                        <span>{from} → {waypoints[i + 1]}</span><span>{i === 1 ? 'TIGHT' : 'SAFE'}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">Layover after
                        leg: {i === 0 ? '82 min' : i === 1 ? '38 min' : 'Destination'}</p></div>)}</div>
            </div>
        </div>
        <ImplementationPlan id={id}/></div>;
}

function AnalyticsView({id}: {
    id: 'route-performance' | 'airport-rankings' | 'aircraft-utilization' | 'revenue-analytics'
}) {
    if (id === 'revenue-analytics') return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Revenue" value="₹ 41.7B"/><Metric label="Median fare"
                                                                                                    value="₹ 7,890"/><Metric
            label="p95 fare" value="₹ 28,600"/><Metric label="Business mix" value="18.1%"/></div>
        <div className="h-80 rounded-2xl border bg-card p-4"><ResponsiveContainer width="100%" height="100%"><AreaChart
            data={mockRevenueTrend}><CartesianGrid strokeDasharray="3 3" opacity={.2}/><XAxis
            dataKey="day"/><YAxis/><Tooltip/><Area type="monotone" dataKey="revenue" stroke="currentColor"
                                                   fill="currentColor"
                                                   fillOpacity={.18}/></AreaChart></ResponsiveContainer></div>
        <ImplementationPlan id={id}/></div>;
    const rows = id === 'aircraft-utilization' ? mockAircraft : id === 'airport-rankings' ? mockAirports : mockRoutePerformance;
    const columns: DataColumn<any>[] = id === 'aircraft-utilization' ? [{
        key: 'model',
        header: 'Aircraft',
        cell: (r) => r.model
    }, {key: 'speed', header: 'Speed', cell: (r) => `${r.speed} km/h`}, {
        key: 'range',
        header: 'Range',
        cell: (r) => `${r.range} km`
    }, {key: 'seats', header: 'Seats', cell: (r) => r.seats}, {
        key: 'routes',
        header: 'Routes',
        cell: (r) => r.routes
    }] : id === 'airport-rankings' ? [{
        key: 'airport',
        header: 'Airport',
        cell: (r) => `${r.airportName} (${r.airportCode})`
    }, {key: 'city', header: 'City', cell: (r) => r.city}, {
        key: 'dep',
        header: 'Departures',
        cell: (r) => r.departures
    }, {key: 'arr', header: 'Arrivals', cell: (r) => r.arrivals}] : [{
        key: 'route',
        header: 'Route',
        cell: (r) => r.route
    }, {key: 'flights', header: 'Flights', cell: (r) => r.flights}, {
        key: 'pax',
        header: 'Passengers',
        cell: (r) => r.passengers.toLocaleString()
    }, {key: 'revenue', header: 'Revenue', cell: (r) => `₹ ${r.revenue}M`}, {
        key: 'delay',
        header: 'Avg delay',
        cell: (r) => `${r.delay} min`
    }, {key: 'cancel', header: 'Cancelled', cell: (r) => `${r.cancellations}%`}];
    return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Rows ranked" value="128" icon={BarChart3}/><Metric
            label="Date window" value="30 days"/><Metric label="Metric"
                                                         value={id === 'airport-rankings' ? 'Flights' : id === 'aircraft-utilization' ? 'Flight hours' : 'Revenue'}/><Metric
            label="Refresh" value="Mock"/></div>
        <DataTable rows={rows as any[]} columns={columns} rowKey={(_, i) => String(i)}/><ImplementationPlan id={id}/>
    </div>;
}

function LabView({id}: {
    id: 'query-benchmark' | 'execution-plans' | 'offset-vs-keyset' | 'index-experiments' | 'before-after'
}) {
    if (id === 'execution-plans') return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Planning" value="1.8 ms"/><Metric label="Execution"
                                                                                                    value="21.4 ms"/><Metric
            label="Rows" value="50"/><Metric label="Buffers hit" value="422"/></div>
        <DataTable rows={mockPlanNodes} rowKey={(r) => r.node}
                   columns={[{key: 'node', header: 'Plan node', cell: (r) => r.node}, {
                       key: 'actual',
                       header: 'Actual time',
                       cell: (r) => r.actual
                   }, {key: 'rows', header: 'Actual rows', cell: (r) => r.rows}, {
                       key: 'est',
                       header: 'Estimate',
                       cell: (r) => r.estimate
                   }, {key: 'buf', header: 'Buffers', cell: (r) => r.buffers}]}/><ExpandableInspector
        title="Inspect JSON plan">
        <pre className="text-xs">{JSON.stringify({Plan: {NodeType: 'Limit', Plans: mockPlanNodes}}, null, 2)}</pre>
    </ExpandableInspector><ImplementationPlan id={id}/></div>;
    if (id === 'index-experiments') return <div className="space-y-6"><SortableList initialItems={[{
        id: '1',
        title: 'Composite: status + scheduled_departure',
        subtitle: 'Hypothesis: date-window status filtering'
    }, {id: '2', title: 'Partial: delayed flights only', subtitle: 'Hypothesis: analytics scan reduction'}, {
        id: '3',
        title: 'Covering: route leaderboard',
        subtitle: 'Hypothesis: reduce heap reads'
    }, {id: '4', title: 'Expression: lower airport name', subtitle: 'Hypothesis: search path'}]}/><ImplementationPlan
        id={id}/></div>;
    return <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Best p95" value="21 ms" icon={Gauge}/><Metric
            label="Worst p95" value="312 ms"/><Metric label="Best RPS" value="1,180"/><Metric label="Rows / req"
                                                                                              value="50"/></div>
        <DataTable rows={mockBenchmarks} rowKey={(r) => r.variant}
                   columns={[{key: 'v', header: 'Variant', cell: (r) => r.variant}, {
                       key: 'p50',
                       header: 'p50',
                       cell: (r) => `${r.p50} ms`
                   }, {key: 'p95', header: 'p95', cell: (r) => `${r.p95} ms`}, {
                       key: 'p99',
                       header: 'p99',
                       cell: (r) => `${r.p99} ms`
                   }, {key: 'rps', header: 'RPS', cell: (r) => r.rps.toLocaleString()}, {
                       key: 'buffers',
                       header: 'Buffers',
                       cell: (r) => r.buffers.toLocaleString()
                   }]}/>
        <div className="grid gap-4 md:grid-cols-2"><ShiftPreviewCard eyebrow="Baseline" title="V1 naive"
                                                                     description="Keep the intentionally bad implementation so you can prove later changes matter."
                                                                     detail="Never optimize from memory. Measure, explain, change one thing, re-measure."/><ShiftPreviewCard
            eyebrow="Optimized" title="V3 measured"
            description="Capture plan, p95, throughput and buffer changes alongside the query."
            detail="Fast at one user is not necessarily fast at 500 concurrent users."/></div>
        <ImplementationPlan id={id}/></div>;
}

export function LabWorkspace({id}: { id: LabPageId }) {
    const body = useMemo(() => {
        if (id === 'airports') return <AirportsView/>;
        if (id === 'flights') return <FlightsView/>;
        if (id === 'aircraft') return <AircraftView/>;
        if (id === 'airport-network' || id === 'traffic-flow' || id === 'aircraft-range') return <NetworkView id={id}/>;
        if (id === 'flight-tracker') return <TrackerView/>;
        if (id === 'delays') return <DelaysView/>;
        if (id === 'airport-congestion') return <CongestionView/>;
        if (id === 'boarding-performance') return <BoardingView/>;
        if (id === 'booking-search' || id === 'passenger-revenue') return <BookingView id={id}/>;
        if (id === 'passenger-journeys' || id === 'connections') return <JourneyView id={id}/>;
        if (id === 'route-performance' || id === 'airport-rankings' || id === 'aircraft-utilization' || id === 'revenue-analytics') return <AnalyticsView
            id={id}/>;
        if (id === 'query-benchmark' || id === 'execution-plans' || id === 'offset-vs-keyset' || id === 'index-experiments' || id === 'before-after') return <LabView
            id={id}/>;
        return <div className="space-y-6"><GenericTable id={id}/><ImplementationPlan id={id}/></div>;
    }, [id]);
    return <div className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-6 lg:p-8"><PageHeader id={id}/>{body}</div>;
}
