import type { GatewayMetrics, PaginatedResponse, Route } from './api-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getRoutes(params: {
  page?: number;
  size?: number;
  departureAirport?: string;
  arrivalAirport?: string;
} = {}): Promise<PaginatedResponse<Route>> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.size) search.set('size', String(params.size));
  if (params.departureAirport) search.set('departureAirport', params.departureAirport);
  if (params.arrivalAirport) search.set('arrivalAirport', params.arrivalAirport);

  return apiFetch(`/api/routes${search.size ? `?${search.toString()}` : ''}`);
}

export function getGatewayMetrics(): Promise<GatewayMetrics> {
  return apiFetch('/api/gateway/metrics');
}
