'use client';

import { useEffect, useState } from 'react';

import type { PaginatedResponse, Airport } from '@/lib/api-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

export function Airports() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<PaginatedResponse<Airport> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          size: '20',
        });
        if (search.trim()) params.set('search', search.trim());

        const response = await fetch(`${API_URL}/api/airports?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        setResult((await response.json()) as PaginatedResponse<Airport>);
        setError(null);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') return;
        setError(caught instanceof Error ? caught.message : 'Failed to load airports');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [page, search]);

  if (error) {
    return <p>API error: {error}</p>;
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
        <span>{loading ? 'Loading…' : `Page ${result?.page ?? page}`}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Airport</th>
            <th>City</th>
            <th>Country</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody>
          {result?.data.map((airport) => (
            <tr key={airport.airportCode}>
              <td>{airport.airportCode}</td>
              <td>{airport.airportName}</td>
              <td>{airport.city}</td>
              <td>{airport.country}</td>
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
          disabled={!result?.hasMore || loading}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
