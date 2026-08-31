import { BadRequestException, Injectable } from "@nestjs/common";

import { DatabaseService } from "../database/database.service.js";
import { Airport, Option, PaginatedResponse } from "../database/models.js";

type ListAirportsArgs = {
  page?: number;
  size?: number;
  search?: string;
};

export const StaticKeys = ["timezone", "country", "city", "code"];
export type StaticKey = (typeof StaticKeys)[number];

@Injectable()
export class AirportsService {
  constructor(private readonly db: DatabaseService) {}

  async list(args: ListAirportsArgs): Promise<PaginatedResponse<Airport>> {
    const page = Math.max(args.page ?? 1, 1);
    const size = Math.min(Math.max(args.size ?? 20, 1), 100);
    const offset = (page - 1) * size;

    const values: unknown[] = [];
    const conditions: string[] = [];
    const search = args.search?.trim();

    if (search) {
      values.push(`%${search}%`);
      const param = `$${values.length}`;
      conditions.push(`(
        airport_code ILIKE ${param}
        OR airport_name ->> 'en' ILIKE ${param}
        OR city ->> 'en' ILIKE ${param}
        OR country ->> 'en' ILIKE ${param}
      )`);
    }

    values.push(size + 1);
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        airport_code AS "airportCode",
        airport_name ->> 'en' AS "airportName",
        city ->> 'en' AS "city",
        country ->> 'en' AS "country",
        json_build_object(
          'longitude', coordinates[0],
          'latitude', coordinates[1]
        ) AS "coordinates",
        timezone AS "timezone"
      FROM bookings.airports_data
      ${where}
      ORDER BY airport_code
      LIMIT ${limitParam}
      OFFSET ${offsetParam};
    `;

    const rows = await this.db.query<Airport>(sql, values);

    return {
      data: rows.slice(0, size),
      page,
      size,
      hasMore: rows.length > size,
    };
  }

  async listStatic(
    key: "timezone" | "country" | "city" | "code",
    args: ListAirportsArgs,
  ): Promise<PaginatedResponse<Option>> {
    // Implementation for listing static options

    if (!["timezone", "country", "city", "code"].includes(key)) {
      throw new BadRequestException(`Invalid key: ${key}`);
    }

    const page = Math.max(args.page ?? 1, 1);
    const size = Math.min(Math.max(args.size ?? 20, 1), 100);
    const offset = (page - 1) * size;

    const values: unknown[] = [];
    const conditions: string[] = [];
    const search = args.search?.trim();

    if (search) {
      values.push(`%${search}%`);
      const param = `$${values.length}`;
      conditions.push(`(
        ${key} ->> 'en' ILIKE ${param}
      )`);
    }

    values.push(size + 1);
    const limitParam = `$${values.length}`;
    values.push(offset);
    const offsetParam = `$${values.length}`;

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        distinct(${key} ->> 'en') AS "label",
        ${key} AS "value"
      FROM bookings.airports_data
      ${where}
      ORDER BY ${key}
      LIMIT ${limitParam}
      OFFSET ${offsetParam};
    `;

    const rows = await this.db.query<Option>(sql, values);

    return {
      data: rows.slice(0, size),
      page,
      size,
      hasMore: rows.length > size,
    };
  }
}
