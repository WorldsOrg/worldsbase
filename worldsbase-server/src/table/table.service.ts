import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolConfig, PoolClient } from 'pg';

@Injectable()
export class TableService implements OnModuleDestroy {
  private pool: Pool;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    const poolConfig: PoolConfig = {
      user: process.env.POSTGRES_USER,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(
        process.env.POSTGRES_CONNECTION_TIMEOUT || '2000',
      ),
      // Add connection error handling
      allowExitOnIdle: true,
    };

    this.pool = new Pool(poolConfig);

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });

    // Log pool statistics periodically
    setInterval(() => {
      console.log('Pool statistics:', {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
      });
    }, 60000); // Log every minute
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (error.message?.includes('too many clients')) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          continue;
        }
        throw error;
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  private async getClient(): Promise<PoolClient> {
    return this.withRetry(async () => {
      const client = await this.pool.connect();
      const release = client.release;

      // Override release method to catch double-release errors
      client.release = () => {
        client.release = release;
        return release.apply(client);
      };

      return client;
    });
  }

  async executeQuery(query: string, values: any[] = []): Promise<any> {
    let client: PoolClient | null = null;

    try {
      client = await this.getClient();

      const result = await client.query(query, values);
      return {
        status: 200,
        data: result.rows,
      };
    } catch (error) {
      console.error('Error executing query:', {
        query,
        values,
        error: error.message,
        stack: error.stack,
      });

      return {
        status: 400,
        error: error.message,
      };
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          console.error('Error releasing client:', releaseError);
        }
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
    } catch (error) {
      console.error('Error closing pool:', error);
    }
  }
}
