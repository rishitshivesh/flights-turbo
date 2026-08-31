# Managed query UI

The managed layer is meant to make a SQL-backed screen mostly configuration plus a fetcher. It owns filter drawer state, React Hook Form wiring, option loading, dependency resets, pagination, table loading/error states and request cancellation.

## Basic filters

```ts
const filters = [
  {
    type: 'string',
    label: 'Source Airport',
    queryKey: 'source',
    required: true,
  },
  {
    type: 'multi-select',
    label: 'Days of week',
    queryKey: 'days',
    searchable: true,
    options: [
      { label: 'Monday', value: 1 },
      { label: 'Wednesday', value: 3 },
    ],
  },
] satisfies FilterFieldConfig[];
```

Built-in field types are `string`, `number`, `select`, `multi-select`, `async-select`, `async-multi-select`, `boolean`, `date`, `date-range` and `custom`.

All built-in interactive controls are composed from the repo's shadcn components.

## Async select

The field owns React Query caching, debounced search, AbortSignal cancellation and infinite scrolling. The fetcher can return either a `FilterOption[]` or a paginated object.

```ts
const airportFetcher: FilterOptionsFetcher = ({
  search,
  page,
  size,
  signal,
}) => getStaticData('code', { search, page, size, signal });

const filters = [
  {
    type: 'async-select',
    queryKey: 'airport',
    label: 'Airport',
    fetcher: airportFetcher,
    optionPageSize: 20,
    searchDebounceMs: 250,
  },
] satisfies FilterFieldConfig[];
```

Fetcher input:

```ts
{
  search: string;
  page: number;
  size: number;
  cursor?: string | number | null;
  dependencies: QueryFilters;
  signal?: AbortSignal;
}
```

Supported fetcher responses:

```ts
FilterOption[]
```

or:

```ts
{
  data: FilterOption[];
  page?: number;
  size?: number;
  hasMore?: boolean;
  total?: number;
  nextCursor?: string | number | null;
}
```

`nextCursor` lets the same component work with cursor-backed option APIs later. If `hasMore` is true, scrolling near the bottom fetches the next page automatically.

## Async multi-select

Exactly the same contract, only the RHF value becomes an array.

```ts
{
  type: 'async-multi-select',
  queryKey: 'airports',
  label: 'Airports',
  fetcher: airportFetcher,
}
```

Search and selection are linked to the same RHF field. Search text is intentionally UI state and is not submitted as a separate filter.

## Dependent fields

Use `dependsOn` for a dependency that also controls whether the child field is available.

```ts
const filters = [
  {
    type: 'async-select',
    queryKey: 'country',
    label: 'Country',
    fetcher: countryFetcher,
  },
  {
    type: 'async-select',
    queryKey: 'city',
    label: 'City',
    dependsOn: { queryKey: 'country' },
    fetcher: cityFetcher,
  },
] satisfies FilterFieldConfig[];
```

The city fetcher automatically receives:

```ts
{
  dependencies: {
    country: 'Russia'
  }
}
```

Changing `country` clears `city`, changes the React Query option cache key, and refetches page 1 when the city field is opened. The child is disabled/hidden until its dependency is satisfied.

For dependencies that should affect option loading without controlling visibility, use:

```ts
optionDependencies: ['country']
```

Multiple dependencies are supported as an array and are ANDed.

Set `clearOnDependencyChange: false` only when retaining the old child value is genuinely valid.

## Managed table

```tsx
<ManagedDataTable
  queryFunction={queryFlights}
  filters={filters}
  columns={columns}
  rowKey={(row) => String(row.flightId)}
/>
```

The table owns filter-sheet open/close state internally. Do not create `filtersOpen`, `setFiltersOpen`, `onInitialFilterOpen`, or page-level option queries.

The query function receives:

```ts
{
  page,
  size,
  filters,
  sort,
  signal,
}
```

and returns:

```ts
{
  data: T[];
  page: number;
  size: number;
  hasMore: boolean;
  total?: number;
  meta?: Record<string, unknown>;
}
```

`ManagedDataTable` owns loading/error/empty states, sorting, refresh, page size, previous/next pagination, filter state, request cancellation and stale-response protection.

## Columns

```ts
const columns = [
  { key: 'flightId', label: 'Flight', sortable: true, format: 'number' },
  { key: 'city', label: 'Origin', path: 'departureAirport.city' },
  { key: 'status', label: 'Status', format: 'badge' },
  { key: 'scheduledDeparture', label: 'Departure', format: 'datetime' },
] satisfies ManagedColumnConfig<Flight>[];
```

Custom cells remain registry-based:

```ts
const cellRenderers = {
  route: ({ row }) => <RouteChip from={row.from} to={row.to} />,
};
```

and:

```ts
{ key: 'route', label: 'Route', customRenderer: 'route' }
```

## Custom RHF controls

If a built-in type is not enough:

```ts
{
  type: 'custom',
  queryKey: 'radius',
  label: 'Radius',
  customComponent: 'radius-slider',
}
```

```tsx
const customComponents = {
  'radius-slider': ({ field }) => (
    <RadiusSlider value={field.value} onValueChange={field.onChange} />
  ),
};
```

The custom renderer receives the RHF `field`, the full RHF `form`, and the field config.
