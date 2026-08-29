import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { catchError, tap, throwError } from 'rxjs';

import { GatewayService } from './gateway.service.js';

@Injectable()
export class GatewayMetricsInterceptor implements NestInterceptor {
  constructor(private readonly gatewayService: GatewayService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
      route?: { path?: string };
      baseUrl?: string;
    }>();

    const rawPath = (request.originalUrl ?? request.url ?? '').split('?')[0];
    if (rawPath === '/api/gateway/metrics' || rawPath.startsWith('/docs')) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const startedAt = performance.now();

    const record = (statusCode: number) => {
      const durationMs = Number((performance.now() - startedAt).toFixed(2));
      const routePath = request.route?.path
        ? `${request.baseUrl ?? ''}${request.route.path}`
        : rawPath || 'unknown';

      this.gatewayService.record({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: routePath,
        statusCode,
        durationMs,
      });
    };

    return next.handle().pipe(
      tap(() => record(response.statusCode)),
      catchError((error: unknown) => {
        const statusCode =
          typeof error === 'object' && error !== null && 'status' in error
            ? Number((error as { status: number }).status)
            : 500;
        record(statusCode || 500);
        return throwError(() => error);
      }),
    );
  }
}
