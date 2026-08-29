import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { GatewayController } from './gateway.controller.js';
import { GatewayMetricsInterceptor } from './gateway.interceptor.js';
import { GatewayService } from './gateway.service.js';

@Module({
  controllers: [GatewayController],
  providers: [
    GatewayService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GatewayMetricsInterceptor,
    },
  ],
  exports: [GatewayService],
})
export class GatewayModule {}
