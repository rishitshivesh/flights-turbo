import { Injectable, Logger } from '@nestjs/common';
import { appendFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import type {
  GatewayDailyMetric,
  GatewayMetrics,
  GatewayRequestLog,
  GatewayRouteMetric,
} from './gateway.types.js';

const RETENTION_DAYS = 7;

function percentile(values: number[], percentileValue: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1),
  );
  return Number(sorted[index].toFixed(2));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly directory = join(process.cwd(), '.data', 'gateway');
  private writeQueue = Promise.resolve();
  private recordedSinceCleanup = 0;

  constructor() {
    void this.cleanup();
  }

  record(entry: GatewayRequestLog): void {
    this.writeQueue = this.writeQueue
      .then(async () => {
        await mkdir(this.directory, { recursive: true });
        const date = entry.timestamp.slice(0, 10);
        await appendFile(
          join(this.directory, `requests-${date}.jsonl`),
          `${JSON.stringify(entry)}\n`,
          'utf8',
        );
      })
      .catch((error: unknown) => {
        this.logger.error('Failed to persist gateway metric', error);
      });

    this.recordedSinceCleanup += 1;
    if (this.recordedSinceCleanup >= 100) {
      this.recordedSinceCleanup = 0;
      void this.cleanup();
    }
  }

  async metrics(): Promise<GatewayMetrics> {
    const logs = await this.readLogs();
    const durations = logs.map((log) => log.durationMs);
    const errors = logs.filter((log) => log.statusCode >= 500).length;

    const routeGroups = new Map<string, GatewayRequestLog[]>();
    const dailyGroups = new Map<string, GatewayRequestLog[]>();

    for (const log of logs) {
      const routeKey = `${log.method} ${log.path}`;
      routeGroups.set(routeKey, [...(routeGroups.get(routeKey) ?? []), log]);

      const day = log.timestamp.slice(0, 10);
      dailyGroups.set(day, [...(dailyGroups.get(day) ?? []), log]);
    }

    const routes: GatewayRouteMetric[] = [...routeGroups.entries()]
      .map(([key, entries]) => {
        const [method, ...pathParts] = key.split(' ');
        const routeDurations = entries.map((entry) => entry.durationMs);
        const routeErrors = entries.filter((entry) => entry.statusCode >= 500).length;
        return {
          method,
          path: pathParts.join(' '),
          requests: entries.length,
          errors: routeErrors,
          errorRate: entries.length ? Number(((routeErrors / entries.length) * 100).toFixed(2)) : 0,
          p50Ms: percentile(routeDurations, 50),
          p95Ms: percentile(routeDurations, 95),
          p99Ms: percentile(routeDurations, 99),
          avgMs: average(routeDurations),
        };
      })
      .sort((a, b) => b.requests - a.requests);

    const daily: GatewayDailyMetric[] = [...dailyGroups.entries()]
      .map(([date, entries]) => ({
        date,
        requests: entries.length,
        errors: entries.filter((entry) => entry.statusCode >= 500).length,
        p95Ms: percentile(entries.map((entry) => entry.durationMs), 95),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      retentionDays: RETENTION_DAYS,
      generatedAt: new Date().toISOString(),
      totalRequests: logs.length,
      totalErrors: errors,
      errorRate: logs.length ? Number(((errors / logs.length) * 100).toFixed(2)) : 0,
      p50Ms: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      p99Ms: percentile(durations, 99),
      avgMs: average(durations),
      routes,
      daily,
      recent: logs.slice(-50).reverse(),
    };
  }

  private async readLogs(): Promise<GatewayRequestLog[]> {
    await mkdir(this.directory, { recursive: true });
    await this.writeQueue;

    const files = (await readdir(this.directory))
      .filter((file) => /^requests-\d{4}-\d{2}-\d{2}\.jsonl$/.test(file))
      .sort();

    const logs: GatewayRequestLog[] = [];
    for (const file of files) {
      const content = await readFile(join(this.directory, file), 'utf8');
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        try {
          logs.push(JSON.parse(line) as GatewayRequestLog);
        } catch {
          this.logger.warn(`Skipping malformed metric line in ${file}`);
        }
      }
    }
    return logs;
  }

  private async cleanup(): Promise<void> {
    try {
      await mkdir(this.directory, { recursive: true });
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - (RETENTION_DAYS - 1));
      const cutoffDate = cutoff.toISOString().slice(0, 10);

      for (const file of await readdir(this.directory)) {
        const match = /^requests-(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(file);
        if (match?.[1] && match[1] < cutoffDate) {
          await rm(join(this.directory, file), { force: true });
        }
      }
    } catch (error) {
      this.logger.error('Failed to clean gateway metric files', error);
    }
  }
}
