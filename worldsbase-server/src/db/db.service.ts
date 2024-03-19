import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';
import createSubscriber from 'pg-listen';

@Injectable()
export class DBService {
  private pool: Pool;
  private subscriber: ReturnType<typeof createSubscriber>;

  constructor(@Inject(PG_CONNECTION) private readonly connectionPool: Pool) {
    this.pool = this.connectionPool;
  }
  async onModuleInit() {
    await this.initSubscriber();
    await this.sendSampleMessage();
  }

  private async initSubscriber() {
    this.subscriber = createSubscriber({
      connectionString: process.env.CONNECTION_STRING,
    });

    this.subscriber.notifications.on('my_event_channel', (payload) => {
      console.log("Received notification in 'my_event_channel':", payload);
    });

    this.subscriber.events.on('error', (error) => {
      console.error('Fatal database connection error:', error);
      process.exit(1);
    });

    await this.subscriber.connect();
    await this.subscriber.listenTo('my_event_channel');
    console.log('Listening for changes on my_event_channel...');
  }

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

  async sendSampleMessage() {
    await this.subscriber.notify('my_event_channel', {
      message: 'Listening functions works!',
      timestamp: Date.now(),
    });
  }
}
