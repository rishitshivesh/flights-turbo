"use client";

import { ManagedColumnConfig, ManagedDataTable } from "@/components/managed";
import { getAirports, getStaticData } from "@/lib/api";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const staticFields = [
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

  const { data: countryData } = useQuery({
    queryKey: ["country"],
    queryFn: () => getStaticData("country"),
  });

  const filters = [
    ...staticFields,
    {
      queryKey: "country",
      label: "Country",
      type: "select",
      options: countryData?.data || [],
    },
    {
      queryKey: "city",
      label: "City",
      type: "text",
    },
  ];

  return (
    <div>
      <ManagedDataTable
        queryFunction={getAirports}
        columns={columns}
        filters={filters as any}
        rowKey={(row: any) => String(row.flightId)}
        onInitialFilterOpen={() => setFiltersOpen(true)}
      />
    </div>
  );
}
