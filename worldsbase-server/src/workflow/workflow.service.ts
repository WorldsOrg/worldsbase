import { Injectable } from '@nestjs/common';
import { Edge } from './entities/worflow.entities';
import { WalletService } from 'src/wallet/wallet.service';
import { TableService } from 'src/table/table.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { EthersService } from 'src/ethers/ethers.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly tableService: TableService,
    private readonly walletService: WalletService,
    private readonly thirdwebService: ThirdwebService,
    private readonly ethersService: EthersService,
  ) {}

  convertEtherToWei(etherAmount: string | number | bigint | boolean) {
    const weiPerEther = BigInt('1000000000000000000'); // 10^18 as BigInt
    return BigInt(etherAmount) * weiPerEther;
  }

  getNodeExecutionOrder(edges: Edge[]): string[] {
    if (!edges.length) return [];
    const order: string[] = [];
    const visited = new Set<string>();

    let current = edges[0];
    while (current) {
      if (!visited.has(current.source)) {
        order.push(current.source);
        visited.add(current.source);
      }

      const nextEdge = edges.find((edge) => edge.source === current.target);
      if (!nextEdge) {
        if (!visited.has(current.target)) {
          order.push(current.target);
          visited.add(current.target);
        }
        break;
      }
      current = nextEdge;
    }
    return order;
  }

  async executeNode(
    node: any,
    parsedData: any,
    variables: any[],
    index: any,
  ): Promise<void> {
    switch (node.type) {
      case 'tableNode':
        await this.processTableNode(node, parsedData, variables, index);
        break;
      case 'walletNode':
        console.log('walletNode');
        await this.processWalletNode(node, variables, index);
        break;
      case 'tokenNode':
        await this.processMintNode(node, parsedData, variables, index);
        break;
      case 'triggerNode':
        // do nothing
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async processTableNode(
    node: any,
    parsedData: any,
    variables: any[],
    index: number,
  ): Promise<void> {
    const { label, fields, tableName } = node.data;
    const fieldValues = this.prepareFieldValues(
      fields,
      parsedData,
      variables,
      index,
    );

    let query;
    switch (label) {
      case 'Delete':
        query = `DELETE FROM "${tableName}" WHERE ${fields[0].label} = '${parsedData.id}'`;
        break;
      case 'Insert':
        query = `INSERT INTO "${tableName}" (${fields.map((f: { label: any }) => f.label).join(', ')}) VALUES (${fieldValues.join(', ')})`;
        break;
      case 'Update':
        query = `UPDATE "${tableName}" SET ${fields.map((f: { label: any }, i: any) => `${f.label} = ${fieldValues[i]}`).join(', ')} WHERE ${fields[0].label} = '${parsedData.id}'`;
        break;
      default:
        throw new Error(`Unknown operation label: ${label}`);
    }
    await this.tableService.executeQuery(query);
  }

  private prepareFieldValues(
    fields: any[],
    parsedData: any,
    variables: any[],
    index: number,
  ): string[] {
    return fields.map((field) => {
      const value = field.value.startsWith('.')
        ? variables[index][field.value.slice(1)]
        : field.value;
      return value === undefined ? 'NULL' : `'${value.replace(/'/g, "''")}'`;
    });
  }

  private async processWalletNode(
    node: any,
    variables: any[],
    index: number,
  ): Promise<void> {
    const userId = node.data.userId.startsWith('.')
      ? variables[index][node.data.userId.slice(1)]
      : node.data.userId;
    if (userId === undefined) {
      console.warn(`Value for field ${userId} is undefined`);
      return;
    }

    const result = await this.walletService.createVaultWallet(userId);

    variables.push(result);
    const query = `UPDATE wtf_users SET provisioned_wallet = $1 WHERE id = $2`;
    const values = [result.address, userId];

    await this.tableService.executeQuery(query, values);
  }

  private async processMintNode(
    node: {
      data: {
        transaction: {
          to: any;
          amount: any;
          minter: any;
          chainId: any;
          contractAddress: any;
        };
      };
    },
    parsedData: any,
    variables: any[],
    index: any,
  ) {
    const to = node.data.transaction.to.startsWith('.')
      ? variables[index][node.data.transaction.to.slice(1)]
      : node.data.transaction.to;

    if (to === undefined) {
      console.warn(`Value for field ${to} is undefined`);
      return;
    }

    const amount = node.data.transaction.amount.startsWith('.')
      ? variables[index][node.data.transaction.amount.slice(1)]
      : node.data.transaction.amount;

    if (
      amount === undefined ||
      amount === null ||
      amount === '0' ||
      amount === 0
    ) {
      console.warn(`Value for field ${amount} is undefined`);
      return;
    }

    //const amountInWei = this.convertEtherToWei(amount);

    const result = await this.ethersService.mintErc20Vault(
      node.data.transaction.contractAddress,
      to,
      amount.toString(),
      node.data.transaction.minter,
      node.data.transaction.chainId,
    );
    console.log(result, 'tx');

    if (!result || !result.txHash) {
      console.error('Error minting token:', result);
      return;
    }

    const tx_query = `INSERT INTO wtf_tx (transactionHash, from_address, to_address, amount, contract_address, chain_id) VALUES ($1, $2, $3, $4, $5, $6)`;
    const tx_values = [
      result.txHash,
      node.data.transaction.minter,
      to,
      amount.toString(),
      node.data.transaction.contractAddress,
      node.data.transaction.chainId,
    ];
    await this.tableService.executeQuery(tx_query, tx_values);
    const query = `UPDATE wtf_users SET social_score = social_score + ${amount} WHERE provisioned_wallet = '${to}'`;
    await this.tableService.executeQuery(query);
  }

  async executeFlow(payload: {
    data: any;
    operation: string;
    table_name: string;
    triggered_function: string;
  }) {
    try {
      const { data, triggered_function } = payload;
      const query = `SELECT * FROM "workflows" WHERE "short_id" = $1`;
      const result = await this.tableService.executeQuery(query, [
        triggered_function,
      ]);

      if (result && result.data.length > 0) {
        const { nodes, edges } = result.data[0];
        const order = this.getNodeExecutionOrder(edges);
        order.shift(); // remove the trigger node
        const parsedData = JSON.parse(data);
        const variables = [parsedData];
        for (const nodeId of order) {
          const index = order.indexOf(nodeId);
          const node = nodes.find((n: { id: string }) => n.id === nodeId);
          if (node) await this.executeNode(node, parsedData, variables, index);
        }
        this.incrementExecutionCount(result.data[0].id);
      }
    } catch (error) {
      console.error('Error executing flow:', error);
      // TODO: log the error in a database or error monitoring service
    }
  }

  private async incrementExecutionCount(workflowId: string): Promise<void> {
    const query = `UPDATE workflows SET execution_count = execution_count + 1 WHERE id = $1`;
    await this.tableService.executeQuery(query, [workflowId]);
  }
}
