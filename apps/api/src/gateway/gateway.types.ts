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
