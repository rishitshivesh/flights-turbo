import { Module } from '@nestjs/common';
import { AirportsResolver } from './airports.resolver.js';
import { AirportsService } from './airports.service.js';

@Module({
  providers: [AirportsResolver, AirportsService],
})
export class AirportsModule {}
