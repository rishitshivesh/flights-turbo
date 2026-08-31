"use client";

import { ManagedColumnConfig, ManagedDataTable } from "@/components/managed";
import { getAirports } from "@/lib/api";
import { useState } from "react";

const staticFields = [
  {
    queryKey: "country",
    label: "Country",
    type: "select",
    options: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" },
      { label: "Mexico", value: "MX" },
    ],
  },
  {
    queryKey: "city",
    label: "City",
    type: "text",
  },
  {
    queryKey: "airportCode",
    label: "Code",
    type: "text",
  },
  {
    queryKey: "name",
    label: "Airport Name",
    type: "text",
  },
  {
    queryKey: "timezone",
    label: "Timezone",
    type: "text",
  },
];

const columns = [
  { key: "airportCode", label: "Airport Code", format: "text", sortable: true },
  { key: "airportName", label: "Airport Name", format: "text" },
  { key: "city", label: "City", format: "text" },
  { key: "country", label: "Country", format: "text" },
  { key: "timezone", label: "Timezone", format: "text" },
] satisfies ManagedColumnConfig<any>[];

export default function AirportsTable() {
  const [filtersOpen, setFiltersOpen] = useState(false);


  return (
    <div>
      <ManagedDataTable
        queryFunction={getAirports}
        columns={columns}
        filters={staticFields as any}
        rowKey={(row: any) => String(row.flightId)}
        onInitialFilterOpen={() => setFiltersOpen(true)}
      />
    </div>
  );
}
