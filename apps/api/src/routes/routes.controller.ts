import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import type { PaginatedResponse, Route } from '../database/models.js';
import { RoutePageDto } from '../docs/api-models.js';
import { RoutesService } from './routes.service.js';

@ApiTags('Routes')
@Controller('api/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List unique airport-to-airport routes' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'departureAirport', required: false, type: String, example: 'DME' })
  @ApiQuery({ name: 'arrivalAirport', required: false, type: String, example: 'LED' })
  @ApiOkResponse({ description: 'Paginated unique route list', type: RoutePageDto })
  list(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('departureAirport') departureAirport?: string,
    @Query('arrivalAirport') arrivalAirport?: string,
  ): Promise<PaginatedResponse<Route>> {
    return this.routesService.list({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      departureAirport,
      arrivalAirport,
    });
  }
}
