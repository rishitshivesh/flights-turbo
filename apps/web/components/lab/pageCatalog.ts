export type LabPageId =
  | 'airports'
  | 'routes'
  | 'flights'
  | 'aircraft'
  | 'route-map'
  | 'airport-network'
  | 'traffic-flow'
  | 'aircraft-range'
  | 'flight-tracker'
  | 'delays'
  | 'airport-congestion'
  | 'boarding-performance'
  | 'booking-search'
  | 'passenger-journeys'
  | 'connections'
  | 'passenger-revenue'
  | 'route-performance'
  | 'airport-rankings'
  | 'aircraft-utilization'
  | 'revenue-analytics'
  | 'query-benchmark'
  | 'execution-plans'
  | 'offset-vs-keyset'
  | 'index-experiments'
  | 'before-after';

export type LabPagePlan = {
  id: LabPageId;
  group: 'Explore' | 'Network' | 'Operations' | 'Passengers' | 'Analytics' | 'SQL Lab';
  title: string;
  description: string;
  endpoint: string;
  tables: string[];
  concepts: string[];
  tasks: string[];
  filters: string[];
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Heavy';
};

export const PAGE_PLANS: Record<LabPageId, LabPagePlan> = {
  airports: {
    id: 'airports', group: 'Explore', title: 'Airports', difficulty: 'Foundation',
    description: 'Search the airport catalogue, inspect localized JSONB fields and compare route activity around an airport.',
    endpoint: 'GET /api/airports', tables: ['airports_data', 'airports', 'routes', 'flights'],
    filters: ['search', 'country', 'city', 'timezone', 'has routes'],
    concepts: ['JSONB ->>', 'ILIKE', 'pagination', 'joins', 'COUNT FILTER'],
    tasks: ['Extend the existing airport API with country/city/timezone filters.', 'Return departure and arrival route counts without N+1 queries.', 'Compare OFFSET pagination with a cursor on airport_code.', 'Add an expression index only after measuring search performance.'],
  },
  routes: {
    id: 'routes', group: 'Explore', title: 'Routes', difficulty: 'Foundation',
    description: 'Explore unique airport pairs, schedules, operating days, durations and assigned aircraft types.',
    endpoint: 'GET /api/routes', tables: ['routes', 'airports_data', 'airplanes_data'],
    filters: ['departure', 'arrival', 'aircraft', 'day of week', 'duration'],
    concepts: ['DISTINCT ON', 'int[] operators', 'interval', 'tstzrange', 'composite indexes'],
    tasks: ['Keep the existing routes integration and add day-of-week filtering using array operators.', 'Add duration min/max and aircraft filters.', 'Explain why DISTINCT ON requires matching ORDER BY prefixes.', 'Measure the existing departure_airport + lower(validity) index.'],
  },
  flights: {
    id: 'flights', group: 'Explore', title: 'Flights', difficulty: 'Intermediate',
    description: 'Browse scheduled and historical flights with status, actual times, delay math and route details.',
    endpoint: 'GET /api/flights', tables: ['flights', 'routes', 'timetable'],
    filters: ['status', 'date range', 'airport', 'route', 'delayed only'],
    concepts: ['timestamp arithmetic', 'CASE', 'date ranges', 'keyset pagination', 'covering indexes'],
    tasks: ['Create the flights list endpoint from timetable or explicit joins and compare both.', 'Return delay_minutes as derived data.', 'Implement flight_id keyset pagination.', 'Benchmark filtering by status + scheduled_departure before adding an index.'],
  },
  aircraft: {
    id: 'aircraft', group: 'Explore', title: 'Aircraft', difficulty: 'Intermediate',
    description: 'Inspect aircraft model JSONB, speed, range and a real seat layout derived from the seats table.',
    endpoint: 'GET /api/aircraft/:code', tables: ['airplanes_data', 'airplanes', 'seats', 'routes'],
    filters: ['model', 'range', 'speed', 'fare condition'],
    concepts: ['JSONB', 'GROUP BY', 'conditional aggregation', 'string parsing', 'array_agg'],
    tasks: ['Return aircraft details plus seat counts by fare_conditions.', 'Return seat_no rows for the seat-map renderer.', 'Calculate number of configured routes per aircraft code.', 'Compare one aggregate query against separate seat-count queries.'],
  },
  'route-map': {
    id: 'route-map', group: 'Network', title: 'Route Map', difficulty: 'Intermediate',
    description: 'Render unique configured airport connections from your real routes API and progressively enrich each arc.',
    endpoint: 'GET /api/routes', tables: ['routes', 'airports_data'],
    filters: ['departure', 'arrival', 'aircraft', 'day'], concepts: ['DISTINCT ON', 'point', 'JSON building', 'join selectivity'],
    tasks: ['Keep the existing route-map integration.', 'Add filter parameters without changing the map component.', 'Return only fields required by the visualization and compare payload size.', 'Benchmark route map cold vs warm-cache query timings.'],
  },
  'airport-network': {
    id: 'airport-network', group: 'Network', title: 'Airport Network', difficulty: 'Advanced',
    description: 'Weight airport nodes and route edges by actual flight volume to reveal network hubs.',
    endpoint: 'GET /api/network/airports', tables: ['flights', 'routes', 'airports_data'],
    filters: ['date range', 'minimum flights', 'airport', 'status'], concepts: ['GROUP BY', 'CTEs', 'weighted graph data', 'HAVING', 'aggregate joins'],
    tasks: ['Aggregate operated flights by departure/arrival pair.', 'Return edge weight and node degree in one response.', 'Add HAVING minimum-flight threshold.', 'Compare pre-filtering flights in a CTE against filtering after joins.'],
  },
  'traffic-flow': {
    id: 'traffic-flow', group: 'Network', title: 'Traffic Flow', difficulty: 'Advanced',
    description: 'Animate weighted traffic between airports using actual flights, passengers or revenue as the weight.',
    endpoint: 'GET /api/network/traffic-flow', tables: ['flights', 'routes', 'segments', 'tickets'],
    filters: ['metric', 'date range', 'status', 'fare condition'], concepts: ['multi-table aggregation', 'COUNT DISTINCT', 'SUM', 'FILTER', 'fan-out correctness'],
    tasks: ['Implement FLIGHTS, PASSENGERS and REVENUE weighting modes.', 'Prove your joins do not double-count tickets.', 'Use FILTER for fare-condition breakdowns.', 'Load-test the heaviest metric and inspect pool pressure.'],
  },
  'aircraft-range': {
    id: 'aircraft-range', group: 'Network', title: 'Aircraft Range', difficulty: 'Advanced',
    description: 'Pick an aircraft and origin airport, visualize its range and rank airports that are geographically reachable.',
    endpoint: 'GET /api/network/range', tables: ['airplanes_data', 'airports_data'],
    filters: ['origin airport', 'aircraft code', 'within range'], concepts: ['point extraction', 'trigonometry', 'CROSS JOIN', 'computed distance', 'LATERAL'],
    tasks: ['Implement great-circle distance in SQL without PostGIS.', 'Return reachable airports sorted by distance.', 'Compare CROSS JOIN + WHERE against LATERAL strategies.', 'Record the query plan before considering PostGIS.'],
  },
  'flight-tracker': {
    id: 'flight-tracker', group: 'Operations', title: 'Live-ish Flight Tracker', difficulty: 'Intermediate',
    description: 'Select one flight, use actual timestamps when present, otherwise simulate current progress entirely on the frontend.',
    endpoint: 'GET /api/flights/:id', tables: ['flights', 'routes', 'airports_data', 'airplanes_data'],
    filters: ['flight id', 'status'], concepts: ['COALESCE', 'GREATEST/LEAST', 'interval ratios', 'temporal joins'],
    tasks: ['Return origin/destination coordinates, aircraft speed and scheduled/actual timestamps.', 'Derive server-side progress once, then compare with frontend derivation.', 'Use routes.validity @> scheduled_departure correctly.', 'Handle cancelled/completed flights explicitly.'],
  },
  delays: {
    id: 'delays', group: 'Operations', title: 'Delays', difficulty: 'Intermediate',
    description: 'Rank delayed flights and routes, compare scheduled vs actual times and trend delay severity.',
    endpoint: 'GET /api/operations/delays', tables: ['flights', 'routes'],
    filters: ['date range', 'airport', 'route', 'minimum delay', 'status'], concepts: ['interval math', 'RANK', 'PARTITION BY', 'FILTER', 'percentiles'],
    tasks: ['Return delay_minutes only for departed flights.', 'Add global and per-route delay ranks.', 'Calculate p50/p95 delay with percentile_cont.', 'Find the index that helps the date-window query, not just a single-row lookup.'],
  },
  'airport-congestion': {
    id: 'airport-congestion', group: 'Operations', title: 'Airport Congestion', difficulty: 'Advanced',
    description: 'Measure arrivals/departures by time bucket and identify the busiest airport windows.',
    endpoint: 'GET /api/operations/congestion', tables: ['flights', 'routes'],
    filters: ['airport', 'date', 'bucket size', 'direction'], concepts: ['date_trunc', 'generate_series', 'gap filling', 'window functions', 'peak concurrency'],
    tasks: ['Bucket traffic by hour and day of week.', 'Fill empty buckets using generate_series.', 'Build departure +1 / arrival -1 events and cumulative SUM for concurrency.', 'Compare materializing a bucket CTE with an inline plan.'],
  },
  'boarding-performance': {
    id: 'boarding-performance', group: 'Operations', title: 'Boarding Performance', difficulty: 'Advanced',
    description: 'Inspect boarding order, assigned seats, boarding duration and passenger throughput for one flight.',
    endpoint: 'GET /api/operations/boarding/:flightId', tables: ['boarding_passes', 'segments', 'tickets', 'seats'],
    filters: ['flight id', 'fare condition', 'boarding minute'], concepts: ['LAG', 'running totals', 'date_trunc', 'composite keys', 'ordered aggregates'],
    tasks: ['Return boarding timeline and assigned seat_no for a flight.', 'Calculate first/last boarding time and rate per minute.', 'Build cumulative boarded passengers with a window function.', 'Join seat fare_conditions without multiplying boarding rows.'],
  },
  'booking-search': {
    id: 'booking-search', group: 'Passengers', title: 'Booking Search', difficulty: 'Intermediate',
    description: 'Search bookings, inspect passengers and expand into all ticket segments and assigned seats.',
    endpoint: 'GET /api/bookings', tables: ['bookings', 'tickets', 'segments', 'boarding_passes', 'flights'],
    filters: ['book ref', 'passenger', 'date range', 'amount'], concepts: ['one-to-many joins', 'JSON aggregation', 'numeric', 'nested result shaping'],
    tasks: ['Build booking search without fetching every child row up front.', 'Create a detail endpoint returning tickets and segments.', 'Aggregate nested segments with json_agg and compare to application grouping.', 'Add assigned seat when a boarding pass exists.'],
  },
  'passenger-journeys': {
    id: 'passenger-journeys', group: 'Passengers', title: 'Passenger Journeys', difficulty: 'Advanced',
    description: 'Reconstruct ordered multi-leg journeys for a passenger and visualize their itinerary.',
    endpoint: 'GET /api/passengers/:id/journeys', tables: ['tickets', 'segments', 'flights', 'routes'],
    filters: ['passenger id', 'booking', 'outbound'], concepts: ['ROW_NUMBER', 'LAG/LEAD', 'ordered joins', 'array_agg', 'journey reconstruction'],
    tasks: ['Order segments chronologically per ticket.', 'Return layover duration between consecutive legs.', 'Derive ordered airport waypoints for FlightMultiRoute.', 'Handle outbound and return tickets separately.'],
  },
  connections: {
    id: 'connections', group: 'Passengers', title: 'Connections', difficulty: 'Advanced',
    description: 'Identify connecting legs, compute effective layover after delays and flag tight or missed connections.',
    endpoint: 'GET /api/passengers/connections', tables: ['tickets', 'segments', 'flights', 'routes'],
    filters: ['airport', 'minimum layover', 'risk', 'date'], concepts: ['LEAD', 'CASE', 'interval arithmetic', 'self-sequencing', 'CTEs'],
    tasks: ['Pair each segment with the next segment using LEAD.', 'Compute scheduled and effective connection minutes.', 'Classify SAFE/TIGHT/MISSED in SQL.', 'Find bookings with at least one risky connection efficiently.'],
  },
  'passenger-revenue': {
    id: 'passenger-revenue', group: 'Passengers', title: 'Revenue', difficulty: 'Advanced',
    description: 'Break passenger spend down by booking, route and fare condition with realistic mock fare labels in the UI.',
    endpoint: 'GET /api/passengers/revenue', tables: ['segments', 'tickets', 'bookings', 'flights', 'routes'],
    filters: ['date range', 'fare condition', 'airport', 'passenger'], concepts: ['SUM', 'COUNT DISTINCT', 'FILTER', 'fan-out control', 'numeric precision'],
    tasks: ['Calculate revenue from segments.price, not bookings.total_amount when analyzing legs.', 'Break revenue out by fare_conditions using FILTER.', 'Reconcile segment revenue to booking totals and explain differences.', 'Rank high-value passengers without duplicate spend.'],
  },
  'route-performance': {
    id: 'route-performance', group: 'Analytics', title: 'Route Performance', difficulty: 'Advanced',
    description: 'Compare route flight volume, passenger volume, revenue, cancellation and delay metrics in one leaderboard.',
    endpoint: 'GET /api/analytics/routes', tables: ['routes', 'flights', 'segments', 'tickets'],
    filters: ['metric', 'date range', 'airport', 'aircraft'], concepts: ['multiple aggregates', 'FILTER', 'NULLIF', 'ranking windows', 'CTE decomposition'],
    tasks: ['Return all route KPIs without accidental row multiplication.', 'Calculate cancellation rate with NULLIF.', 'Rank by a requested metric.', 'Compare one large query with staged CTE aggregation.'],
  },
  'airport-rankings': {
    id: 'airport-rankings', group: 'Analytics', title: 'Airport Rankings', difficulty: 'Advanced',
    description: 'Rank airports by flights, passengers, revenue, connectivity and average delay.',
    endpoint: 'GET /api/analytics/airports', tables: ['routes', 'flights', 'segments', 'tickets', 'airports_data'],
    filters: ['metric', 'date range', 'country', 'top N'], concepts: ['UNION ALL', 'RANK', 'DENSE_RANK', 'aggregate joins', 'derived metrics'],
    tasks: ['Represent departures and arrivals in one airport fact set using UNION ALL.', 'Rank airports by multiple selectable metrics.', 'Add network degree as a separate metric.', 'Explain why combining all metrics too early can explode row counts.'],
  },
  'aircraft-utilization': {
    id: 'aircraft-utilization', group: 'Analytics', title: 'Aircraft Utilization', difficulty: 'Advanced',
    description: 'Analyze aircraft-type schedule density, flight hours, route count and seat capacity utilization proxies.',
    endpoint: 'GET /api/analytics/aircraft', tables: ['airplanes_data', 'routes', 'flights', 'seats'],
    filters: ['aircraft', 'date range', 'metric'], concepts: ['interval SUM', 'GROUP BY', 'capacity aggregation', 'CTEs', 'utilization proxies'],
    tasks: ['Aggregate flight hours by airplane_code.', 'Join seat capacity once per aircraft type without multiplying flights.', 'Calculate flights per day and routes served.', 'Document why this is type-level utilization, not physical tail utilization.'],
  },
  'revenue-analytics': {
    id: 'revenue-analytics', group: 'Analytics', title: 'Revenue Analytics', difficulty: 'Heavy',
    description: 'Explore revenue over time, fare mix, percentiles and route contribution using the largest fact joins.',
    endpoint: 'GET /api/analytics/revenue', tables: ['segments', 'tickets', 'bookings', 'flights', 'routes'],
    filters: ['date range', 'route', 'airport', 'fare condition', 'bucket'], concepts: ['percentile_cont', 'date_trunc', 'FILTER', 'window contribution %', 'large joins'],
    tasks: ['Build daily/monthly revenue buckets.', 'Calculate p50/p75/p90/p95 fare prices.', 'Return fare-condition mix.', 'Calculate each route share of total revenue with a window aggregate.', 'Load-test the full-period query.'],
  },
  'query-benchmark': {
    id: 'query-benchmark', group: 'SQL Lab', title: 'Query Benchmark', difficulty: 'Heavy',
    description: 'Run controlled API/query variants and compare latency, rows, throughput and buffer behavior.',
    endpoint: 'GET /api/lab/benchmark/:query', tables: ['pg_stat*', 'your query variants'],
    filters: ['query', 'variant', 'concurrency', 'iterations'], concepts: ['benchmark methodology', 'p50/p95/p99', 'cold vs warm cache', 'connection pools'],
    tasks: ['Create named V1/V2/V3 query variants.', 'Capture DB execution time separately from request duration.', 'Run repeated samples before declaring a winner.', 'Compare single-user latency against concurrent throughput.'],
  },
  'execution-plans': {
    id: 'execution-plans', group: 'SQL Lab', title: 'Execution Plans', difficulty: 'Heavy',
    description: 'Visualize EXPLAIN ANALYZE output and learn to identify scans, joins, estimates, buffers and expensive nodes.',
    endpoint: 'POST /api/lab/explain', tables: ['EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)'],
    filters: ['saved query', 'variant', 'analyze', 'buffers'], concepts: ['Seq Scan', 'Index Scan', 'Bitmap Scan', 'Nested Loop', 'Hash Join', 'Merge Join', 'cardinality estimates', 'buffers'],
    tasks: ['Return JSON-format execution plans from a safe allowlist of lab queries.', 'Extract planning time, execution time and top-cost nodes.', 'Compare estimated vs actual rows.', 'Track shared hit/read buffers before and after indexes.'],
  },
  'offset-vs-keyset': {
    id: 'offset-vs-keyset', group: 'SQL Lab', title: 'Offset vs Keyset', difficulty: 'Intermediate',
    description: 'Benchmark deep OFFSET pagination against keyset/cursor pagination on flights and tickets.',
    endpoint: 'GET /api/lab/pagination', tables: ['flights', 'tickets'],
    filters: ['strategy', 'page depth', 'size'], concepts: ['OFFSET cost', 'seek method', 'stable ordering', 'composite cursors'],
    tasks: ['Implement the same list using OFFSET and flight_id cursor.', 'Measure pages 1, 100, 1,000 and deeper.', 'Build a composite cursor for non-unique sort columns.', 'Explain consistency differences under inserts.'],
  },
  'index-experiments': {
    id: 'index-experiments', group: 'SQL Lab', title: 'Index Experiments', difficulty: 'Heavy',
    description: 'Track hypotheses for single, composite, partial, expression, covering and GiST indexes and prove their value.',
    endpoint: 'Manual SQL + benchmark endpoints', tables: ['routes', 'flights', 'segments', 'tickets'],
    filters: ['query', 'index type', 'before/after'], concepts: ['B-tree', 'GiST', 'partial index', 'expression index', 'INCLUDE', 'selectivity', 'write/storage cost'],
    tasks: ['Never add an index without a measured query problem.', 'Record index size and plan changes.', 'Test column order in composite indexes.', 'Compare partial status/date indexes.', 'Study the existing routes GiST exclusion/index behavior.'],
  },
  'before-after': {
    id: 'before-after', group: 'SQL Lab', title: 'Before / After Optimization', difficulty: 'Heavy',
    description: 'Document optimization case studies from naive query through rewrite, indexing and load-test results.',
    endpoint: 'GET /api/lab/cases', tables: ['all lab query families'],
    filters: ['case', 'stage', 'metric'], concepts: ['baseline discipline', 'query rewrites', 'indexes', 'EXPLAIN', 'load testing', 'regression tracking'],
    tasks: ['Keep V1 naive queries for comparison instead of deleting them.', 'Save EXPLAIN summaries and latency percentiles for each stage.', 'Document the reason each change helped.', 'Re-run old cases after schema/query changes to catch regressions.'],
  },
};

export function getPagePlan(id: LabPageId) {
  return PAGE_PLANS[id];
}
