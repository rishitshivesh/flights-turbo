'use client';

import {
  type FilterFieldConfig,
  type FilterOptionsFetcher,
  type ManagedColumnConfig,
  ManagedDataTable,
} from '@/components/managed';
import { getAirports, getStaticData } from '@/lib/api';
import type { Airport } from '@/lib/api-types';

const countryFetcher: FilterOptionsFetcher = ({ page, size, search, signal }) =>
  getStaticData('country', { page, size, search, signal });

const cityFetcher: FilterOptionsFetcher = ({ page, size, search, dependencies, signal }) =>
  getStaticData('city', {
    page,
    size,
    search,
    signal,
    filters: { country: dependencies.country },
  });

const filters = [
  {
    queryKey: 'airportCode',
    label: 'Code',
    type: 'string',
    placeholder: 'DME',
  },
  {
    queryKey: 'name',
    label: 'Airport Name',
    type: 'string',
    placeholder: 'Domodedovo',
  },
  {
    queryKey: 'timezone',
    label: 'Timezone',
    type: 'string',
  },
  {
    queryKey: 'country',
    label: 'Country',
    type: 'async-select',
    fetcher: countryFetcher,
    searchable: true,
    optionPageSize: 20,
  },
  {
    queryKey: 'city',
    label: 'City',
    type: 'async-select',
    fetcher: cityFetcher,
    dependsOn: { queryKey: 'country' },
    searchable: true,
    clearOnDependencyChange: true,
    optionPageSize: 20,
  },
] satisfies FilterFieldConfig[];

const columns = [
  { key: 'airportCode', label: 'Airport Code', format: 'text', sortable: true },
  { key: 'airportName', label: 'Airport Name', format: 'text' },
  { key: 'city', label: 'City', format: 'text' },
  { key: 'country', label: 'Country', format: 'text' },
  { key: 'timezone', label: 'Timezone', format: 'text' },
] satisfies ManagedColumnConfig<Airport>[];

export default function AirportsTable() {
  return (
    <ManagedDataTable<Airport>
      title="Airports"
      description="Async options, dependent filters and filter-sheet state are owned by the managed layer."
      queryFunction={({ page, size, filters: values, signal }) =>
        getAirports({ page, size, filters: values, signal })
      }
      columns={columns}
      filters={filters}
      rowKey={(row) => row.airportCode}
    />
  );
}
