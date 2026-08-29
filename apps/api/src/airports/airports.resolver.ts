import { Args, Query, Resolver } from '@nestjs/graphql';
import { AirportsService } from './airports.service.js';

@Resolver()
export class AirportsResolver {
  constructor(private readonly airportsService: AirportsService) {}

  @Query('airports')
  airports(
    @Args('page') page?: number,
    @Args('size') size?: number,
    @Args('search') search?: string,
  ) {
    return this.airportsService.list({ page, size, search });
  }
}
