import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GatewayMetricsDto } from '../docs/api-models.js';
import { GatewayService } from './gateway.service.js';
import type { GatewayMetrics } from './gateway.types.js';

@ApiTags('Gateway')
@Controller('api/gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get API performance metrics for the last 7 days' })
  @ApiOkResponse({
    description: 'Aggregated request metrics including p50, p95 and p99.',
    type: GatewayMetricsDto,
  })
  metrics(): Promise<GatewayMetrics> {
    return this.gatewayService.metrics();
  }
}
