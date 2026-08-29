'use client';

import { useCallback, useEffect, useState } from 'react';

import type { GatewayMetrics } from '@/lib/api-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

export function MonitorDashboard() {
  const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/gateway/metrics`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      setMetrics((await response.json()) as GatewayMetrics);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to fetch metrics');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  if (error && !metrics) {
    return <div className="p-8 text-sm text-destructive">Gateway metrics unavailable: {error}</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-sm text-muted-foreground">Loading API performance metrics…</div>;
  }

  return (
    <main className="min-h-screen bg-muted/20 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Flights SQL Lab</p>
            <h1 className="text-3xl font-semibold tracking-tight">API Performance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Local gateway telemetry · {metrics.retentionDays}-day retention · refreshes every 5s
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(metrics.generatedAt).toLocaleTimeString()}
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Requests" value={metrics.totalRequests.toLocaleString()} />
          <MetricCard label="p95 latency" value={`${metrics.p95Ms} ms`} detail={`p50 ${metrics.p50Ms} ms`} />
          <MetricCard label="p99 latency" value={`${metrics.p99Ms} ms`} detail={`avg ${metrics.avgMs} ms`} />
          <MetricCard label="Error rate" value={`${metrics.errorRate}%`} detail={`${metrics.totalErrors} server errors`} />
        </section>

        <section className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold">Endpoints</h2>
            <p className="text-sm text-muted-foreground">Percentiles are computed from requests retained locally.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="px-5 py-3">Endpoint</th>
                  <th className="px-5 py-3 text-right">Calls</th>
                  <th className="px-5 py-3 text-right">Avg</th>
                  <th className="px-5 py-3 text-right">p50</th>
                  <th className="px-5 py-3 text-right">p95</th>
                  <th className="px-5 py-3 text-right">p99</th>
                  <th className="px-5 py-3 text-right">Errors</th>
                </tr>
              </thead>
              <tbody>
                {metrics.routes.map((route) => (
                  <tr key={`${route.method}-${route.path}`} className="border-b last:border-0">
                    <td className="px-5 py-3 font-mono text-xs">
                      <span className="mr-2 rounded bg-muted px-2 py-1 font-semibold">{route.method}</span>
                      {route.path}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{route.requests}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{route.avgMs} ms</td>
                    <td className="px-5 py-3 text-right tabular-nums">{route.p50Ms} ms</td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium">{route.p95Ms} ms</td>
                    <td className="px-5 py-3 text-right tabular-nums">{route.p99Ms} ms</td>
                    <td className="px-5 py-3 text-right tabular-nums">{route.errorRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Daily traffic</h2>
            <div className="mt-4 space-y-3">
              {metrics.daily.map((day) => {
                const max = Math.max(...metrics.daily.map((item) => item.requests), 1);
                return (
                  <div key={day.date}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{day.date}</span>
                      <span>{day.requests} calls · p95 {day.p95Ms} ms</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${(day.requests / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-5">
              <h2 className="font-semibold">Recent requests</h2>
            </div>
            <div className="max-h-80 overflow-auto">
              {metrics.recent.map((request, index) => (
                <div key={`${request.timestamp}-${index}`} className="flex items-center justify-between gap-4 border-b px-5 py-3 text-xs last:border-0">
                  <div className="min-w-0">
                    <span className="mr-2 font-semibold">{request.method}</span>
                    <span className="font-mono">{request.path}</span>
                  </div>
                  <div className="flex shrink-0 gap-4 tabular-nums text-muted-foreground">
                    <span>{request.statusCode}</span>
                    <span>{request.durationMs} ms</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
