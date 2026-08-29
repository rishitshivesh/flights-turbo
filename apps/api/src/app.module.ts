import { Module } from '@nestjs/common';

import { AirportsModule } from './airports/airports.module.js';
import { DatabaseModule } from './database/database.module.js';
import { GatewayModule } from './gateway/gateway.module.js';
import { RoutesModule } from './routes/routes.module.js';

@Module({
  imports: [DatabaseModule, GatewayModule, AirportsModule, RoutesModule],
})
export class AppModule {}
