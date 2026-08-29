import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CoordinatesDto {
  @ApiProperty({ example: 37.9063 })
  longitude!: number;

  @ApiProperty({ example: 55.4088 })
  latitude!: number;
}

export class DurationDto {
  @ApiPropertyOptional()
  years?: number;

  @ApiPropertyOptional()
  months?: number;

  @ApiPropertyOptional()
  days?: number;

  @ApiPropertyOptional()
  hours?: number;

  @ApiPropertyOptional()
  minutes?: number;

  @ApiPropertyOptional()
  seconds?: number;
}

export class AirportDto {
  @ApiProperty({ example: 'DME' })
  airportCode!: string;

  @ApiProperty({ example: 'Domodedovo International Airport' })
  airportName!: string;

  @ApiProperty({ example: 'Moscow' })
  city!: string;

  @ApiProperty({ example: 'Russia' })
  country!: string;

  @ApiProperty({ type: () => CoordinatesDto })
  coordinates!: CoordinatesDto;

  @ApiProperty({ example: 'Europe/Moscow' })
  timezone!: string;
}

export class RouteDto {
  @ApiProperty({ example: 'PG0001' })
  routeNo!: string;

  @ApiProperty({ example: '773' })
  airplaneCode!: string;

  @ApiProperty({ type: [Number], example: [1, 3, 5] })
  daysOfWeek!: number[];

  @ApiProperty({ example: '09:30:00' })
  scheduledTime!: string;

  @ApiProperty({ type: () => DurationDto })
  duration!: DurationDto;

  @ApiProperty({ type: () => CoordinatesDto })
  departureCoordinates!: CoordinatesDto;

  @ApiProperty({ type: () => CoordinatesDto })
  arrivalCoordinates!: CoordinatesDto;

  @ApiProperty({ type: () => AirportDto })
  departureAirport!: AirportDto;

  @ApiProperty({ type: () => AirportDto })
  arrivalAirport!: AirportDto;
}

export class AirportPageDto {
  @ApiProperty({ type: [AirportDto] })
  data!: AirportDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  size!: number;

  @ApiProperty({ example: true })
  hasMore!: boolean;
}

export class RoutePageDto {
  @ApiProperty({ type: [RouteDto] })
  data!: RouteDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 50 })
  size!: number;

  @ApiProperty({ example: true })
  hasMore!: boolean;
}

export class GatewayRouteMetricDto {
  @ApiProperty({ example: 'GET' })
  method!: string;

  @ApiProperty({ example: '/api/routes' })
  path!: string;

  @ApiProperty({ example: 1250 })
  requests!: number;

  @ApiProperty({ example: 2 })
  errors!: number;

  @ApiProperty({ example: 0.16 })
  errorRate!: number;

  @ApiProperty({ example: 12.4 })
  p50Ms!: number;

  @ApiProperty({ example: 38.7 })
  p95Ms!: number;

  @ApiProperty({ example: 71.2 })
  p99Ms!: number;

  @ApiProperty({ example: 16.8 })
  avgMs!: number;
}

export class GatewayMetricsDto {
  @ApiProperty({ example: 7 })
  retentionDays!: number;

  @ApiProperty()
  generatedAt!: string;

  @ApiProperty()
  totalRequests!: number;

  @ApiProperty()
  totalErrors!: number;

  @ApiProperty()
  errorRate!: number;

  @ApiProperty()
  p50Ms!: number;

  @ApiProperty()
  p95Ms!: number;

  @ApiProperty()
  p99Ms!: number;

  @ApiProperty()
  avgMs!: number;

  @ApiProperty({ type: [GatewayRouteMetricDto] })
  routes!: GatewayRouteMetricDto[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  daily!: unknown[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  recent!: unknown[];
}
