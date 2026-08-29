import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../database/database.service.js';

type ListRoutesArgs = {
    page?: number;
    size?: number;
    departureAirport?: string;
    arrivalAirport?: string;
};

@Injectable()
export class RoutesService {
    constructor(private readonly db: DatabaseService) {
    }

    async list(args: ListRoutesArgs) {
        const page = Math.max(args.page ?? 1, 1);
        const size = Math.min(Math.max(args.size ?? 20, 1), 100);
        const offset = (page - 1) * size;

        const values: unknown[] = [];
        let where = '';

        const departureAirport = args.departureAirport?.trim();
        const arrivalAirport = args.arrivalAirport?.trim();

        if (departureAirport) {
            values.push(`%${departureAirport}%`);
            where = `
        WHERE departure_airport ILIKE $1
      `;
        }

        if (arrivalAirport) {
            values.push(`%${arrivalAirport}%`);
            where += `
           OR arrival_airport ILIKE $${values.length}
      `;
        }

        values.push(size + 1);
        const limitParam = `$${values.length}`;

        values.push(offset);
        const offsetParam = `$${values.length}`;

        const sql = `
            SELECT DISTINCT
            ON (r.departure_airport, r.arrival_airport)
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
                'timezone', dep.timezone,
                'country', dep.country ->> 'en'
                ) AS "departureAirport",

                json_build_object(
                'airportCode', arr.airport_code,
                'airportName', arr.airport_name ->> 'en',
                'city', arr.city ->> 'en',
                'timezone', arr.timezone,
                'country', arr.country ->> 'en'
                ) AS "arrivalAirport"

            FROM bookings.routes as r
                JOIN bookings.airports_data as dep
            ON dep.airport_code = r.departure_airport
                JOIN bookings.airports_data as arr ON arr.airport_code = r.arrival_airport ${where}
            ORDER BY r.departure_airport, r.arrival_airport, r.route_no
                LIMIT ${limitParam}
            OFFSET ${offsetParam};
        `;

        const rows = await this.db.query(sql, values);

        return {
            data: rows.slice(0, size),
            page,
            size,
            hasMore: rows.length > size,
        };
    }
}
