import type {
  Airport,
  GatewayMetrics,
  PaginatedResponse,
  Route,
} from './api-types';
import type { FilterOption, QueryFilters, QueryValue } from '@/components/managed';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const startedAt = performance.now();
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
  const durationMs = Math.round(performance.now() - startedAt);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('flights:api-response', {
        detail: { path, status: response.status, ok: response.ok, durationMs },
      }),
    );
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function appendParam(params: URLSearchParams, key: string, value: QueryValue) {
  if (value === undefined || value === null || value === '') return;
  if (Array.isArray(value)) {
    const normalized = value.filter((entry) => entry !== undefined && entry !== null && entry !== '');
    if (normalized.length > 0) params.set(key, normalized.join(','));
    return;
  }
  if (typeof value === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
        params.set(`${key}.${nestedKey}`, String(nestedValue));
      }
    }
    return;
  }
  params.set(key, String(value));
}

function appendFilters(params: URLSearchParams, filters?: QueryFilters) {
  for (const [key, value] of Object.entries(filters ?? {})) appendParam(params, key, value);
}

export function getAirports(
  params: {
    page?: number;
    size?: number;
    search?: string;
    filters?: QueryFilters;
    signal?: AbortSignal;
  } = {},
): Promise<PaginatedResponse<Airport>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.search) searchParams.set('search', params.search);
  appendFilters(searchParams, params.filters);
  return apiFetch(`/api/airports${searchParams.size ? `?${searchParams.toString()}` : ''}`, { signal: params.signal });
}

export function getRoutes(
  params: {
    page?: number;
    size?: number;
    departureAirport?: string;
    arrivalAirport?: string;
    signal?: AbortSignal;
  } = {},
): Promise<PaginatedResponse<Route>> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.size) search.set('size', String(params.size));
  if (params.departureAirport) search.set('departureAirport', params.departureAirport);
  if (params.arrivalAirport) search.set('arrivalAirport', params.arrivalAirport);
  return apiFetch(`/api/routes${search.size ? `?${search.toString()}` : ''}`, { signal: params.signal });
}

export function getStaticData(
  key: string,
  params: {
    page?: number;
    size?: number;
    search?: string;
    filters?: QueryFilters;
    signal?: AbortSignal;
  } = {},
): Promise<PaginatedResponse<FilterOption>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.size) searchParams.set('size', String(params.size));
  if (params.search) searchParams.set('search', params.search);
  appendFilters(searchParams, params.filters);
  return apiFetch(`/api/airports/static/${key}${searchParams.size ? `?${searchParams.toString()}` : ''}`, { signal: params.signal });
}

export function getGatewayMetrics(): Promise<GatewayMetrics> {
  return apiFetch('/api/gateway/metrics');
}
