import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';

@Injectable()
export class TableService {
  constructor(@Inject(PG_CONNECTION) private pool: any) {}

  async executeQuery(query: string, queryParams: any[] = []) {
    try {
      const result = await this.pool.query(query, queryParams);

      return { status: 200, data: result.rows };
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        status: 500,
        error: 'Error executing query',
      };
    }
  }
}
