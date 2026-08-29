import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';
import type { PaginatedResponse, Route } from '../database/models.js';

type ListRoutesArgs = {
  page?: number;
  size?: number;
  departureAirport?: string;
  arrivalAirport?: string;
};

@Injectable()
export class RoutesService {
  constructor(private readonly db: DatabaseService) {}

  async list(args: ListRoutesArgs): Promise<PaginatedResponse<Route>> {
    const page = Math.max(args.page ?? 1, 1);
    const size = Math.min(Math.max(args.size ?? 20, 1), 100);
    const offset = (page - 1) * size;

    const values: unknown[] = [];
    const conditions: string[] = [];

    const departureAirport = args.departureAirport?.trim();
    if (departureAirport) {
      values.push(departureAirport);
      conditions.push(`r.departure_airport = $${values.length}`);
    }

    const arrivalAirport = args.arrivalAirport?.trim();
    if (arrivalAirport) {
      values.push(arrivalAirport);
      conditions.push(`r.arrival_airport = $${values.length}`);
    }

    values.push(size + 1);
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT DISTINCT ON (r.departure_airport, r.arrival_airport)
        r.route_no AS "routeNo",
        r.airplane_code AS "airplaneCode",
        r.days_of_week AS "daysOfWeek",
        r.scheduled_time AS "scheduledTime",
        r.duration AS "duration",
        json_build_object(
          'longitude', dep.coordinates[0],
          'latitude', dep.coordinates[1]
        ) AS "departureCoordinates",
        json_build_object(
          'longitude', arr.coordinates[0],
          'latitude', arr.coordinates[1]
        ) AS "arrivalCoordinates",
        json_build_object(
          'airportCode', dep.airport_code,
          'airportName', dep.airport_name ->> 'en',
          'city', dep.city ->> 'en',
          'country', dep.country ->> 'en',
          'coordinates', json_build_object(
            'longitude', dep.coordinates[0],
            'latitude', dep.coordinates[1]
          ),
          'timezone', dep.timezone
        ) AS "departureAirport",
        json_build_object(
          'airportCode', arr.airport_code,
          'airportName', arr.airport_name ->> 'en',
          'city', arr.city ->> 'en',
          'country', arr.country ->> 'en',
          'coordinates', json_build_object(
            'longitude', arr.coordinates[0],
            'latitude', arr.coordinates[1]
          ),
          'timezone', arr.timezone
        ) AS "arrivalAirport"
      FROM bookings.routes AS r
      JOIN bookings.airports_data AS dep
        ON dep.airport_code = r.departure_airport
      JOIN bookings.airports_data AS arr
        ON arr.airport_code = r.arrival_airport
      ${where}
      ORDER BY r.departure_airport, r.arrival_airport, r.route_no
      LIMIT ${limitParam}
      OFFSET ${offsetParam};
    `;

    const rows = await this.db.query<Route>(sql, values);

    return {
      data: rows.slice(0, size),
      page,
      size,
      hasMore: rows.length > size,
    };
  }
}
