# Managed Query UI

The goal is to make a SQL-backed page mostly configuration.

## 1. Define filters

```ts
const filters = [
  {
    type: 'string',
    label: 'Source Airport',
    queryKey: 'source',
    required: true,
    placeholder: 'DME',
  },
  {
    type: 'multi-select',
    label: 'Days of week',
    queryKey: 'days',
    options: [
      { label: 'Monday', value: 1 },
      { label: 'Wednesday', value: 3 },
      { label: 'Friday', value: 5 },
    ],
  },
  {
    type: 'date-range',
    label: 'Departure window',
    queryKey: 'departureRange',
  },
] satisfies FilterFieldConfig[];
```

`ManagedFilters` renders these inside a right-hand sheet using React Hook Form. Applying filters returns a plain query object.

Built-in types:

- `string`
- `number`
- `select`
- `multi-select`
- `boolean`
- `date`
- `date-range`
- `custom`

Validation, dependencies, defaults and serialization can be expressed in config.

## 2. Define columns

```ts
const columns = [
  { key: 'flightId', label: 'Flight', format: 'number', sortable: true },
  { key: 'route', label: 'Route', customRenderer: 'route' },
  { key: 'status', label: 'Status', format: 'badge' },
  { key: 'scheduledDeparture', label: 'Departure', format: 'datetime' },
  { key: 'price', label: 'Price', format: 'currency', formatOptions: { currency: 'RUB' } },
] satisfies ManagedColumnConfig<FlightRow>[];
```

Nested values use `path`, for example `{ key: 'city', path: 'departureAirport.city', label: 'Origin city' }`.

## 3. Supply one query function

```ts
const queryFlights: ManagedQueryFunction<FlightRow> = async ({
  page,
  size,
  filters,
  sort,
  signal,
}) => {
  const params = filtersToSearchParams({
    ...filters,
    page,
    size,
    sortBy: sort?.key,
    sortDir: sort?.direction,
  });

  const response = await fetch(`/api/flights?${params}`, { signal });
  if (!response.ok) throw new Error('Could not fetch flights');
  return response.json();
};
```

Expected response:

```ts
{
  data: FlightRow[];
  page: number;
  size: number;
  hasMore: boolean;
  total?: number;
  meta?: Record<string, unknown>;
}
```

Then the page is basically:

```tsx
<ManagedDataTable
  title="Flights"
  queryFunction={queryFlights}
  filters={filters}
  columns={columns}
  rowKey={(row) => String(row.flightId)}
  customCellRenderers={{
    route: ({ row }) => `${row.from} → ${row.to}`,
  }}
/>
```

The component owns:

- loading, error and empty states
- filter drawer
- React Hook Form state/validation
- active-filter count
- page and page size
- next/previous pagination
- sorting state
- stale-request protection and AbortSignal
- refresh
- basic cell formatting

## Custom form components

Keep configuration JSON-friendly by storing a registry key instead of a React component in the field config.

```ts
const filters: FilterFieldConfig[] = [
  {
    type: 'custom',
    label: 'Airport',
    queryKey: 'airport',
    customComponent: 'airport-picker',
  },
];

const customComponents: CustomFilterRegistry = {
  'airport-picker': ({ field }) => (
    <AirportPicker value={field.value} onChange={field.onChange} />
  ),
};
```

This gives custom components full RHF field control without making the JSON config executable.

## Custom table cells

Same pattern:

```ts
const columns = [
  { key: 'route', label: 'Route', customRenderer: 'route-preview' },
];

const customCellRenderers = {
  'route-preview': ({ row }) => <RoutePreview from={row.from} to={row.to} />,
};
```

## API response adapters

If an API does not already return the standard paginated shape, adapt it inside `queryFunction`. The managed component deliberately does not understand endpoint-specific response formats. That keeps the UI contract stable while your SQL/API experiments change underneath it.
