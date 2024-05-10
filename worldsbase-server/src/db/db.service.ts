import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { Pool } from 'pg';
import createSubscriber from 'pg-listen';
import { ConfigService } from '@nestjs/config';
import { WalletService } from 'src/wallet/wallet.service';

type Edge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
};

@Injectable()
export class DBService {
  private pool: Pool;
  private subscriber: ReturnType<typeof createSubscriber>;
  private executionCount = 0;
  constructor(
    @Inject(PG_CONNECTION) private readonly connectionPool: Pool,
    private configService: ConfigService,
    private readonly walletService: WalletService,
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
  }

  getNodeExecutionOrder(edges: Edge[]) {
    if (!edges.length) return [];

    const order = [];
    let current = edges[0];

    const addedEdges = new Set();

    while (current) {
      if (!addedEdges.has(current.source)) {
        order.push(current.source);
        addedEdges.add(current.source);
      }

      if (!edges.find((edge) => edge.source === current.target)) {
        if (!addedEdges.has(current.target)) {
          order.push(current.target);
          addedEdges.add(current.target);
        }
        break;
      }

      current = edges.find((edge) => edge.source === current.target) as Edge;
    }

    return order;
  }

  async executeQuery(query: string, queryParams: any[] = []) {
    try {
      console.log(query, queryParams);
      const result = await this.pool.query(query, queryParams);
      console.log(result);
      return { status: 200, data: result.rows };
    } catch (error) {
      console.error('Error executing query:', error);
      throw new BadRequestException('Error executing query');
    }
  }

  async executeFlow(payload: {
    data: any;
    operation: string;
    table_name: string;
  }) {
    try {
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
        const edges = result.data[0].edges;
        const order: string[] = this.getNodeExecutionOrder(edges);
        order.shift();
        const parsedData = JSON.parse(data);
        const variables = [parsedData];
        for (const nodeId of order) {
          const index = order.indexOf(nodeId);
          const node = nodes.find((node: { id: string }) => node.id === nodeId);
          if (node) {
            if (node.type === 'tableNode') {
              if (node.data.label === 'Delete') {
                const deleteQuery = `DELETE FROM "${node.tableName}" WHERE ${node.fields[0].label} = '${data.id}'`;
                await this.executeQuery(deleteQuery);
              } else if (node.data.label === 'Insert') {
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
                      console.warn(
                        `Value for field ${field.value} is undefined`,
                      );
                      return 'NULL';
                    }
                    return `'${value.replace(/'/g, "''")}'`;
                  })
                  .join(', ');

                const insertQuery = `INSERT INTO "${node.data.tableName}" (${fields}) VALUES (${values})`;
                await this.executeQuery(insertQuery);
              } else if (node.data.label === 'Update') {
                const fields = node.data.fields
                  .map((field: { label: string }) => field.label)
                  .join(', ');
                const values = node.data.fields
                  .map((field: { value: string }) => {
                    // if value starts with .
                    let value = field.value;
                    if (field.value.startsWith('.')) {
                      value = variables[index][field.value.slice(1)];
                    }
                    if (value === undefined) {
                      console.warn(
                        `Value for field ${field.value} is undefined`,
                      );
                      return 'NULL';
                    }
                    return `'${value.replace(/'/g, "''")}'`;
                  })
                  .join(', ');

                console.log(fields, values);

                let filterValue = node.data.filters.value;

                if (filterValue.startsWith('.')) {
                  filterValue = variables[index][filterValue.slice(1)];
                }
                if (filterValue === undefined) {
                  console.warn(`Value for field ${filterValue} is undefined`);
                  return 'NULL';
                }

                const updateQuery = `UPDATE "${node.data.tableName}" SET ${fields} = ${values} WHERE ${node.data.filters.key} = '${filterValue}'`;

                await this.executeQuery(updateQuery);
              }
            } else if (node.type === 'walletNode') {
              let userId = node.data.userId;

              if (userId.startsWith('.')) {
                userId = variables[index][userId.slice(1)];
              }
              if (userId === undefined) {
                console.warn(`Value for field ${userId} is undefined`);
                return 'NULL';
              }

              const result = await this.walletService.createVaultWallet(userId);
              variables.push(result);
            }
          }
        }
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
    for (let i = 101; i < 200; i++) {
      const email = `email_${i}@test.com`;
      const insertQuery = `INSERT INTO "wtf_users" ("email") VALUES ($1)`;
      await this.executeQuery(insertQuery, [email]);
    }
  }
}
