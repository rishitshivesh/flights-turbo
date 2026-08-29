import type {
  Airport,
  GatewayMetrics,
  PaginatedResponse,
  Route,
} from './api-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

async function apiFetch<T>(path: string): Promise<T> {
  const startedAt = performance.now();
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  const durationMs = Math.round(performance.now() - startedAt);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('flights:api-response', {
      detail: { path, status: response.status, ok: response.ok, durationMs },
    }));
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function getAirports(params: { page?: number; size?: number; search?: string } = {}): Promise<PaginatedResponse<Airport>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.search) searchParams.set('search', params.search);
  return apiFetch(`/api/airports${searchParams.size ? `?${searchParams.toString()}` : ''}`);
}

export function getRoutes(params: { page?: number; size?: number; departureAirport?: string; arrivalAirport?: string } = {}): Promise<PaginatedResponse<Route>> {
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
