'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

type AirportsVariables = {
  page?: number;
  size?: number;
  search?: string;
};

type AirportsResult = {
  airports: {
    data: {
      airportCode: string;
      airportName: string;
      city: string;
      timezone: string;
    }[];
    page: number;
    size: number;
    hasMore: boolean;
  };
};

const AIRPORTS_QUERY: TypedDocumentNode<
    AirportsResult,
    AirportsVariables
> = gql`
  query Airports($page: Int, $size: Int, $search: String) {
    airports(page: $page, size: $size, search: $search) {
      data {
        airportCode
        airportName
        city
        timezone
      }
      page
      size
      hasMore
    }
  }
`;

export function Airports() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, loading, error } = useQuery(
    AIRPORTS_QUERY,
    {
      variables: {
        page,
        size: 20,
        search: search || undefined,
      },
    },
  );

  if (error) {
    return <p>GraphQL error: {error.message}</p>;
  }

  return (
    <section>
      <div className="toolbar">
        <input
          value={search}
          placeholder="Search airports"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <span>{loading ? 'Loading…' : `Page ${data?.airports.page ?? page}`}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Airport</th>
            <th>City</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody>
          {data?.airports.data.map((airport) => (
            <tr key={airport.airportCode}>
              <td>{airport.airportCode}</td>
              <td>{airport.airportName}</td>
              <td>{airport.city}</td>
              <td>{airport.timezone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <button
          disabled={!data?.airports.hasMore || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
