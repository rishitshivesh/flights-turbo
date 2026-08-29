export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type Duration = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export type Airport = {
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  timezone: string;
};

export type Route = {
  routeNo: string;
  airplaneCode: string;
  daysOfWeek: number[];
  scheduledTime: string;
  duration: Duration;
  departureCoordinates: Coordinates;
  arrivalCoordinates: Coordinates;
  departureAirport: Airport;
  arrivalAirport: Airport;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  size: number;
  hasMore: boolean;
};

export type GatewayRequestLog = {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
};

export type GatewayRouteMetric = {
  method: string;
  path: string;
  requests: number;
  errors: number;
  errorRate: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  avgMs: number;
};

export type GatewayDailyMetric = {
  date: string;
  requests: number;
  errors: number;
  p95Ms: number;
};

export type GatewayMetrics = {
  retentionDays: number;
  generatedAt: string;
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  avgMs: number;
  routes: GatewayRouteMetric[];
  daily: GatewayDailyMetric[];
  recent: GatewayRequestLog[];
};
