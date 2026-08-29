# Flights SQL Lab — Database Learning Plan

This repository is a PostgreSQL learning lab disguised as an airline product. The frontend is intentionally ahead of the backend: each page already defines the user experience, mock response shape, filters, charts/maps/tables, and an **Implementation plan**. Your job is to write the SQL and thin REST endpoint that makes the page real.

The rule for every exercise is:

1. **Write the simplest correct query first.**
2. Run `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`.
3. Record planning time, execution time, actual rows vs estimates, scans, join algorithms, buffer hits/reads.
4. Load-test the API and record p50/p95/p99, throughput, errors and DB pool pressure.
5. Change one thing: query structure, pagination strategy, index, pre-aggregation, etc.
6. Re-run the exact same measurement.
7. Keep the before/after evidence. Do not delete the ugly V1 query; it is part of the lesson.

---

## Dataset mental model

```text
bookings
  └─ tickets
       └─ segments ───── flights ───── routes
              │                         │   │
              └─ boarding_passes        │   ├─ airports_data (departure)
                                        │   ├─ airports_data (arrival)
                                        │   └─ airplanes_data
                                        │
                                        └─ seats (via airplane_code)
```

Important PostgreSQL-native types in this dataset:

- `jsonb`: localized aircraft/airport names, cities and countries.
- `point`: airport longitude/latitude.
- `int4[]`: route days of week.
- `interval`: route duration.
- `tstzrange`: route validity windows.
- `numeric(10,2)`: booking totals and segment prices.
- `timestamptz`: schedules, actual flight times and boarding events.
- GiST exclusion constraint/index on `(route_no, validity)`.
- Composite primary/unique keys across seats, segments and boarding passes.

Do not flatten these types just because JavaScript prefers boring strings. Learn what PostgreSQL can do with them.

---

# Curriculum order

## Level 1 — Correct SQL and result shaping

### 1. Explore → Airports
**Route:** `/explore/airports`  
**Existing API:** `GET /api/airports`

Learn:
- `SELECT` discipline: return only required columns.
- aliases from snake_case to API camelCase.
- `jsonb ->>` extraction.
- `ILIKE` and search.
- parameterized queries.
- `LIMIT/OFFSET` fundamentals.
- joins to routes for departure/arrival counts.
- `COUNT(*) FILTER (WHERE ...)`.

Exercises:
- country, city and timezone filters.
- `hasRoutes` filter.
- route count without N+1 queries.
- compare searching the localized `airports` view vs `airports_data` JSONB directly.
- measure before adding an expression/search index.

### 2. Explore → Routes
**Route:** `/explore/routes`  
**Existing API:** `GET /api/routes`

Learn:
- two joins to the same table with aliases (`dep`, `arr`).
- `DISTINCT ON` and its `ORDER BY` rule.
- `int[]` operators for weekday filters.
- `interval` handling.
- `tstzrange` and validity.
- `point` coordinate extraction.
- `json_build_object` / result shaping.

Exercises:
- Wednesday flights/routes: `days_of_week @> ARRAY[3]` or equivalent.
- aircraft-code filter.
- min/max duration.
- active-at timestamp: `validity @> $timestamp`.
- compare `SELECT *` payload/time against only visualization fields.

### 3. Explore → Flights
**Route:** `/explore/flights`

Learn:
- temporal filters.
- scheduled vs actual timestamps.
- `CASE`, `COALESCE`.
- timestamp subtraction to derive delay.
- sorting and stable pagination.
- using `timetable` view vs explicit joins.

Build:
- `GET /api/flights`
- `GET /api/flights/:id`

Experiments:
- compare `bookings.timetable` with hand-written `flights JOIN routes JOIN airports_data`.
- status + date-range filtering.
- delayed-only filter.
- keyset pagination using `flight_id`.

### 4. Explore → Aircraft
**Route:** `/explore/aircraft`

Learn:
- JSONB model extraction.
- aggregation by aircraft type.
- composite key structure in seats.
- conditional aggregation by `fare_conditions`.
- parsing `seat_no` with regex/string functions.
- `array_agg` / `json_agg` for seat maps.

Build:
- aircraft detail.
- real seat layout from `bookings.seats`.
- seat counts: Economy / Comfort / Business.
- configured route count per aircraft type.

---

## Level 2 — Aggregation and network data

### 5. Network → Route Map
**Route:** `/network/route-map`

Already uses the routes endpoint. Optimize it for visualization:
- minimum payload.
- unique airport pairs.
- optional filters.
- compare page sizes and API serialization cost.
- measure cold vs warm buffer behavior.

### 6. Network → Airport Network
**Route:** `/network/airport-network`

Build weighted edges from **actual flights**, not configured routes.

Learn:
- aggregate before joining when useful.
- `GROUP BY` route pair.
- `HAVING`.
- node degree / weighted degree.
- CTE decomposition.

Return roughly:

```json
{ "from": "DME", "to": "LED", "value": 144 }
```

Then add node metrics:
- outgoing routes.
- incoming routes.
- total flights.
- passenger-weighted centrality proxy.

### 7. Network → Traffic Flow
**Route:** `/network/traffic-flow`

Implement weighting modes:
- flights.
- passengers.
- revenue.

This is your first serious **join fan-out correctness** exercise.

Learn:
- `COUNT(DISTINCT ...)` only when semantically correct.
- pre-aggregate segments before joining.
- `FILTER` by fare condition.
- why a query can be fast and wrong.

### 8. Network → Aircraft Range
**Route:** `/network/aircraft-range`

No PostGIS initially.

Learn:
- extract longitude/latitude from `point`.
- radians, `sin`, `cos`, `acos`.
- great-circle distance.
- `CROSS JOIN` and filtering computed distances.
- `LATERAL` alternatives.

Question to answer:
> From DME, which airports are within the range of aircraft 773, sorted by distance?

Only after implementing this manually should you investigate how PostGIS would change the problem.

---

## Level 3 — Temporal operations and window functions

### 9. Operations → Live-ish Flight Tracker
**Route:** `/operations/flight-tracker`

The frontend already simulates progress. Your endpoint only needs flight facts.

Learn:
- route temporal join: `r.validity @> f.scheduled_departure`.
- scheduled vs actual times.
- `COALESCE`.
- bounded ratios with `GREATEST`/`LEAST`.

Return:
- flight + status.
- origin/destination coordinates.
- aircraft model/speed/range.
- scheduled/actual departure + arrival.

Compare server-derived progress against frontend-derived progress.

### 10. Operations → Delays
**Route:** `/operations/delays`

Learn window functions properly:
- `RANK()` globally.
- `RANK() OVER (PARTITION BY route_no ...)`.
- `percentile_cont` for p50/p95 delay.
- filtered aggregates.

Questions:
- worst individual delay.
- worst route average.
- p95 delay by route.
- cancellation rate by route.

### 11. Operations → Airport Congestion
**Route:** `/operations/airport-congestion`

Learn time-series SQL:
- `date_trunc`.
- `EXTRACT(DOW/HOUR ...)`.
- `generate_series` to fill missing time buckets.
- rolling windows.

Then solve peak concurrency:

```text
departure event = +1
arrival event   = -1
ORDER BY event_time
SUM(delta) OVER (...) = active flights
```

This event-stream transformation is one of the most reusable techniques in the entire project.

### 12. Operations → Boarding Performance
**Route:** `/operations/boarding-performance`

Learn:
- composite joins `(ticket_no, flight_id)`.
- `MIN/MAX` boarding times.
- `LAG(boarding_time)`.
- minute bucketing.
- cumulative `SUM`.
- ordered seat/passenger data.

Questions:
- boarding duration.
- passengers per minute.
- cumulative boarded count.
- gaps between boardings.
- fare-condition boarding order.
- seat map populated from real boarding passes.

---

## Level 4 — Passenger journey reconstruction

### 13. Passengers → Booking Search
**Route:** `/passengers/booking-search`

Learn nested one-to-many data without accidental duplication.

Build two query shapes:
1. list query: booking summary only.
2. detail query: booking → tickets → segments → flights → boarding pass.

Compare:
- nested `json_agg` in SQL.
- flat rows grouped in Node.

Neither is universally correct; measure and understand both.

### 14. Passengers → Passenger Journeys
**Route:** `/passengers/journeys`

Learn sequencing:
- `ROW_NUMBER()`.
- `LAG/LEAD`.
- ordered `array_agg`.
- layover intervals.

Produce an ordered waypoint list that plugs directly into the existing `FlightMultiRoute` frontend.

### 15. Passengers → Connections
**Route:** `/passengers/connections`

Use `LEAD` to pair each segment with the next.

Calculate:
- scheduled layover.
- incoming delay.
- effective layover.
- `SAFE`, `TIGHT`, `MISSED` using `CASE`.

Then answer:
> Which bookings contain at least one connection that is likely to be missed?

### 16. Passengers → Revenue
**Route:** `/passengers/revenue`

Learn financial aggregation safely:
- `numeric` precision.
- segment revenue vs booking total.
- filtered revenue by Economy/Comfort/Business.
- high-value passenger ranking.
- `COUNT(DISTINCT ticket_no)` vs passenger IDs.

Reconcile totals instead of assuming different grains should match perfectly.

---

## Level 5 — Analytical SQL

### 17. Analytics → Route Performance
**Route:** `/analytics/route-performance`

Return one row per route with:
- flights.
- passengers.
- revenue.
- average fare.
- average delay.
- cancellation rate.
- fare mix.

This teaches staged aggregation. A giant raw join can multiply rows. Try:

```text
flight_stats CTE
revenue_stats CTE
passenger_stats CTE
JOIN aggregated CTEs by route
```

Compare against the giant-query version.

### 18. Analytics → Airport Rankings
**Route:** `/analytics/airport-rankings`

Create a common airport fact stream with `UNION ALL` for arrivals + departures.

Rank by:
- flights.
- passengers.
- revenue.
- network degree.
- delay.

Learn `RANK` vs `DENSE_RANK` vs `ROW_NUMBER`.

### 19. Analytics → Aircraft Utilization
**Route:** `/analytics/aircraft-utilization`

The dataset has aircraft **types**, not tail registrations. Be precise about what the metric means.

Compute:
- flights per type.
- total scheduled flight hours.
- average flights/day.
- routes served.
- seat capacity.
- passenger/capacity proxy.

Learn how joining seats directly to flights can multiply every flight by every seat. Aggregate seat capacity first.

### 20. Analytics → Revenue Analytics
**Route:** `/analytics/revenue`

Heavy analytical query territory.

Learn:
- daily/weekly/monthly buckets.
- `percentile_cont(0.5/0.75/0.9/0.95)`.
- fare-condition mix.
- route contribution percentage using window aggregates.
- rolling revenue windows.

Load-test full-year requests. This is intentionally expensive.

---

# Level 6 — Performance engineering

The pages in SQL Lab should never directly accept arbitrary SQL from a public request. Use a **named allowlist of experiment queries**.

### 21. SQL Lab → Query Benchmark
**Route:** `/sql-lab/query-benchmark`

For each experiment keep:

```text
V1 naive
V2 rewritten
V3 indexed
V4 load-optimized
```

Record:
- DB execution time.
- full request duration.
- p50/p95/p99.
- RPS.
- error rate.
- pool wait if instrumented.
- rows.
- shared buffer hits/reads.

Important: benchmark repeatedly. A single query timing is anecdote, not evidence.

### 22. SQL Lab → Execution Plans
**Route:** `/sql-lab/execution-plans`

Master plan nodes:
- Seq Scan.
- Index Scan.
- Index Only Scan.
- Bitmap Heap / Bitmap Index Scan.
- Nested Loop.
- Hash Join.
- Merge Join.
- Sort.
- Aggregate / HashAggregate.
- Materialize.
- Gather / parallel workers.

For every plan ask:
1. Where did most actual time go?
2. Where are estimated and actual rows wildly different?
3. Are buffers coming from cache or disk?
4. Did a filter discard huge numbers of rows late?
5. Is a nested loop repeating expensive work?

### 23. SQL Lab → Offset vs Keyset
**Route:** `/sql-lab/offset-vs-keyset`

Compare:

```sql
ORDER BY flight_id
LIMIT 50 OFFSET 500000;
```

with:

```sql
WHERE flight_id > $cursor
ORDER BY flight_id
LIMIT 50;
```

Test shallow and deep pages.

Then implement composite keyset pagination for a sort such as:

```text
scheduled_departure DESC, flight_id DESC
```

and understand why the unique tie-breaker matters.

### 24. SQL Lab → Index Experiments
**Route:** `/sql-lab/index-experiments`

Study all major index ideas in context:

- B-tree single column.
- composite indexes and column order.
- partial indexes.
- expression indexes.
- covering indexes with `INCLUDE`.
- GiST ranges.
- existing exclusion constraint.

For each experiment record:
- query it is intended to help.
- index DDL.
- index size.
- plan before/after.
- latency before/after.
- whether PostgreSQL actually chose it.
- tradeoff: storage/write maintenance.

Never collect indexes like Pokémon. An unused index is not free.

### 25. SQL Lab → Before / After Optimization
**Route:** `/sql-lab/before-after`

Turn your best exercises into documented case studies:

```text
Problem
↓
Naive SQL
↓
Baseline EXPLAIN ANALYZE
↓
Observed bottleneck
↓
Rewrite / index hypothesis
↓
New plan
↓
Single-user benchmark
↓
Concurrent load test
↓
Conclusion
```

This page becomes your evidence that you understand database performance rather than merely know SQL syntax.

---

# Stretch work — beyond the sidebar

These are deliberately harder and can be added after the 25 pages are backed by real endpoints.

## Recursive journey finder

Given `from`, `to`, and `maxStops`, find paths through configured routes using:

```sql
WITH RECURSIVE ...
```

Learn:
- graph traversal.
- depth limits.
- path arrays.
- cycle detection (`next_airport <> ALL(path)`).
- shortest by hops vs shortest by duration.

## Reachable airports within N stops

Return every airport reachable from an origin in 1, 2 or 3 hops. Rank minimum hops and retain the path.

## Origin / destination passenger analysis

A segment is not the same as a passenger journey.

Reconstruct the first origin and final destination using:
- `FIRST_VALUE` / `LAST_VALUE`, or
- ranked first/last segments.

Build a true passenger OD matrix.

## Seat popularity

Parse `seat_no` into row and letter. Rank frequently assigned seats and compare by fare condition / aircraft type.

## Simulated aircraft trail in SQL

Use `generate_series` to create interpolation steps between airport coordinates. This is intentionally mathematical and not necessarily the best production design; the point is learning set-generating functions and LATERAL queries.

---

# PostgreSQL concept checklist

By the end of this project you should be comfortable explaining and using:

## Query fundamentals
- [ ] parameterized SQL
- [ ] joins: inner / left / self
- [ ] join grain and fan-out
- [ ] `GROUP BY`, `HAVING`
- [ ] `DISTINCT` vs `DISTINCT ON`
- [ ] subqueries
- [ ] `EXISTS` vs `IN`
- [ ] `CASE`, `COALESCE`, `NULLIF`

## PostgreSQL types/features
- [ ] JSONB operators
- [ ] arrays and array operators
- [ ] interval arithmetic
- [ ] timestamp/timezone handling
- [ ] range types and `@>`
- [ ] point coordinates
- [ ] numeric precision
- [ ] `FILTER` aggregates
- [ ] `generate_series`
- [ ] `LATERAL`

## Window functions
- [ ] `ROW_NUMBER`
- [ ] `RANK`
- [ ] `DENSE_RANK`
- [ ] `LAG`
- [ ] `LEAD`
- [ ] `FIRST_VALUE` / `LAST_VALUE`
- [ ] rolling windows with `ROWS BETWEEN`
- [ ] cumulative sums

## Advanced query construction
- [ ] CTEs
- [ ] recursive CTEs
- [ ] cycle detection
- [ ] ordered aggregates
- [ ] JSON aggregation
- [ ] percentiles
- [ ] event-stream transformations
- [ ] staged/pre-aggregation

## Performance
- [ ] planner estimates / cardinality
- [ ] scan types
- [ ] join algorithms
- [ ] sort and aggregate strategies
- [ ] buffers
- [ ] cold vs warm cache
- [ ] index selectivity
- [ ] B-tree / GiST
- [ ] composite index column order
- [ ] partial indexes
- [ ] expression indexes
- [ ] covering / index-only scans
- [ ] OFFSET vs keyset
- [ ] connection pool saturation
- [ ] p50/p95/p99
- [ ] throughput vs latency
- [ ] regression benchmarking

---

# Definition of done for every page

A page is **not done** merely because it displays data.

It is done when:

- [ ] mock data has been replaced by your API.
- [ ] SQL is parameterized.
- [ ] endpoint returns only required fields.
- [ ] empty/error/loading states work.
- [ ] filters are server-side where appropriate.
- [ ] pagination strategy is intentional.
- [ ] query has an `EXPLAIN ANALYZE, BUFFERS` record.
- [ ] you can explain every major node in its plan.
- [ ] you know which indexes it uses and why.
- [ ] baseline p50/p95/p99 is recorded.
- [ ] concurrent test is recorded for expensive endpoints.
- [ ] any optimization has before/after evidence.
- [ ] `DB_PLAN.md` notes are updated with what you learned.

The frontend has been built to remove excuses. Now PostgreSQL gets to judge the rest.
