import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';
import createSubscriber from 'pg-listen';
import { ConfigService } from '@nestjs/config';
import { WorkflowService } from 'src/workflow/workflow.service';

@Injectable()
export class DBService {
  private pool: Pool;
  private subscriber: ReturnType<typeof createSubscriber>;
  constructor(
    @Inject(PG_CONNECTION) private readonly connectionPool: Pool,
    private configService: ConfigService,
    private workflowService: WorkflowService,
  ) {
    this.pool = this.connectionPool;
  }

  async onModuleInit() {
    await this.initSubscriber();
    if (this.configService.get<string>('DATA_TEST') === 'true') {
      await this.test();
    }
  }

  private async initSubscriber() {
    this.subscriber = createSubscriber({
      connectionString: this.configService.get<string>('CONNECTION_STRING'),
    });

    this.subscriber.notifications.on('my_event_channel', (payload) => {
      console.log(
        'Received notification in channel my_event_channel:',
        payload,
      );
      this.workflowService.executeFlow(payload);
    });

    this.subscriber.events.on('error', (error) => {
      console.error('Fatal database connection error:', error);
      process.exit(1);
    });

    await this.subscriber.connect();
    await this.subscriber.listenTo('my_event_channel');
  }

  async executeQuery(query: string, queryParams: any[] = []) {
    try {
      const result = await this.pool.query(query, queryParams);
      return { status: 200, data: result.rows };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new BadRequestException('Error executing query');
    }
  }

  async test() {
    const query = `SELECT * FROM "twitter_engagement_score" WHERE "wallet" IS NOT NULL`;
    const result = await this.executeQuery(query);
    console.log(result);
    result.data.forEach((row) => {
      const query = `UPDATE "twitter_engagement_score" SET "total_engagement_points" = "total_engagement_points" + 1 WHERE "wallet" = $1`;
      this.executeQuery(query, [row.wallet]);
    });
  }
}
