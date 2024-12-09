import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';

export const databaseProviders = [
  {
    provide: PG_CONNECTION,
    useFactory: () => {
      const pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '6543'),
        max: 15, // Maximum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        maxUses: 7500,
        allowExitOnIdle: true,
        keepAlive: true,
        statement_timeout: 10000, // 10 seconds
        query_timeout: 10000, // 10 seconds
      });

      // Log pool events for debugging
      pool.on('connect', () => {
        console.log('New client connected to pool');
      });

      pool.on('remove', () => {
        console.log('Client removed from pool');
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });

      return pool;
    },
  },
];
