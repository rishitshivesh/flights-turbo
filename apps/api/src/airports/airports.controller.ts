import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import type { Airport, PaginatedResponse } from '../database/models.js';
import { AirportsService } from './airports.service.js';

@ApiTags('Airports')
@Controller('api/airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Get()
  @ApiOperation({ summary: 'List airports' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ description: 'Paginated airport list' })
  list(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<Airport>> {
    return this.airportsService.list({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      search,
    });
  }
}
