import { Injectable } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';

@Injectable()
export class TableService {
  private pool: Pool;

  constructor() {
    const poolConfig: PoolConfig = {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      max: 20, // maximum number of clients in the pool
      idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
    };

    this.pool = new Pool(poolConfig);

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async executeQuery(query: string, values: any[] = []): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, values);
      return {
        status: 200,
        data: result.rows,
      };
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        status: 400,
        error: error.message,
      };
    } finally {
      client.release(); // Always release the client back to the pool
    }
  }

  // Add cleanup method for application shutdown
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
