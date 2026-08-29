import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { Pool, type QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    this.pool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      options: '-c default_transaction_read_only=on -c statement_timeout=30000',
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: readonly unknown[] = [],
  ): Promise<T[]> {
    const startedAt = performance.now();

    const result = await this.pool.query<T>(sql, [...params]);

    this.logger.debug(
      `Query returned ${result.rowCount ?? 0} row(s) in ${(performance.now() - startedAt).toFixed(2)}ms`,
    );

    return result.rows;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
