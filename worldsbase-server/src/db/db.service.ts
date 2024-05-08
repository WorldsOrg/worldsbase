import { Injectable, Inject, Logger } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';
import createSubscriber from 'pg-listen';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DBService {
  private pool: Pool;
  private subscriber: ReturnType<typeof createSubscriber>;
  private executionCount = 0;
  constructor(
    @Inject(PG_CONNECTION) private readonly connectionPool: Pool,
    private configService: ConfigService,
  ) {
    this.pool = this.connectionPool;
  }

  async onModuleInit() {
    await this.initSubscriber();
    if (this.configService.get<string>('DATA_TEST') === 'true') {
      console.log('Data test is enabled');
      await this.testTrigger();
    }
    //await this.testTrigger();
    //await this.sendSampleMessage();
  }

  private async initSubscriber() {
    this.subscriber = createSubscriber({
      connectionString: this.configService.get<string>('CONNECTION_STRING'),
    });

    this.subscriber.notifications.on('my_event_channel', (payload) => {
      this.executeFlow(payload);
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

  async executeFlow(payload: {
    data: any;
    operation: string;
    table_name: string;
  }) {
    try {
      console.log('Received payload:', payload);
      this.executionCount++; // Increment the counter each time the function is called
      Logger.log(`Executing flow for the ${this.executionCount} time`);
      const { data, operation, table_name } = payload;
      const query = `SELECT * FROM "workflows" WHERE "table_name" = $1 AND "operation" = $2`;
      const result = await this.executeQuery(query, [
        table_name,
        operation.toLowerCase(),
      ]);

      if (result && result.data && result.data.length > 0) {
        const nodes = result.data[0].nodes;
        const node = nodes.find(
          (node: { type: string }) => node.type === 'textUpdater',
        );
        console.log(node.data.label, node.data.fields, node.data.tableName);
        const parsedData = JSON.parse(data);
        console.log(parsedData);

        // Construct the INSERT query
        const fields = node.data.fields
          .map((field: { label: any }) => field.label)
          .join(', ');
        const values = node.data.fields
          .map((field: { value: string }) => {
            // if value starts with .
            let value = field.value;
            if (field.value.startsWith('.')) {
              value = parsedData[field.value.slice(1)];
            }
            if (value === undefined) {
              console.warn(`Value for field ${field.value} is undefined`);
              return 'NULL';
            }
            return `'${value.replace(/'/g, "''")}'`;
          })
          .join(', ');

        const insertQuery = `INSERT INTO "${node.data.tableName}" (${fields}) VALUES (${values})`;
        await this.executeQuery(insertQuery);
      }
    } catch (error) {
      console.error('Error executing flow:', error);
    }
  }

  async sendSampleMessage() {
    await this.subscriber.notify('my_event_channel', {
      message: 'Listening functions works!',
      timestamp: Date.now(),
    });
  }

  async testTrigger() {
    for (let i = 0; i < 10000; i++) {
      const email = `email_${i}@test.com`;
      const insertQuery = `INSERT INTO "wtf_users_test" ("email") VALUES ($1)`;
      this.executeQuery(insertQuery, [email]);
    }
  }
}
