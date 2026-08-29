import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../database/database.service.js';

type ListAirportsArgs = {
    page?: number;
    size?: number;
    search?: string;
};

@Injectable()
export class AirportsService {
    constructor(private readonly db: DatabaseService) {
    }

    async list(args: ListAirportsArgs) {
        const page = Math.max(args.page ?? 1, 1);
        const size = Math.min(Math.max(args.size ?? 20, 1), 100);
        const offset = (page - 1) * size;

        const values: unknown[] = [];
        let where = '';

        const search = args.search?.trim();

        if (search) {
            values.push(`%${search}%`);
            where = `
        WHERE airport_code ILIKE $1
           OR airport_name ILIKE $1
           OR city ILIKE $1
      `;
        }

        values.push(size + 1);
        const limitParam = `$${values.length}`;

        values.push(offset);
        const offsetParam = `$${values.length}`;

        const sql = `
            SELECT airport_code AS "airportCode",
                   airport_name AS "airportName",
                   city         AS "city",
                   coordinates::text AS "coordinates", timezone AS "timezone"
                country AS "country"
            FROM bookings.airports ${where}
            ORDER BY airport_code
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
