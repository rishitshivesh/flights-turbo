import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { Airport, Option, PaginatedResponse } from "../database/models.js";
import { AirportPageDto, OptionPageDto } from "../docs/api-models.js";
import { AirportsService, StaticKey } from "./airports.service.js";

@ApiTags("Airports")
@Controller("api/airports")
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Get()
  @ApiOperation({ summary: "List airports" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "size", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiOkResponse({
    description: "Paginated airport list",
    type: AirportPageDto,
  })
  list(
    @Query("page") page?: string,
    @Query("size") size?: string,
    @Query("search") search?: string,
  ): Promise<PaginatedResponse<Airport>> {
    return this.airportsService.list({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      search,
    });
  }

  @Get("/static/:key")
  @ApiOperation({ summary: "List static options" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "size", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiParam({ name: "key", required: true, type: String })
  @ApiOkResponse({
    description: "Paginated static options list",
    type: OptionPageDto,
  })
  listStatic(
    @Param("key") key: StaticKey,
    @Query("page") page?: string,
    @Query("size") size?: string,
    @Query("search") search?: string,
    @Query("country") country?: string,
  ): Promise<PaginatedResponse<Option>> {
    return this.airportsService.listStatic(key as any, {
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      search,
      country,
    });
  }
}
