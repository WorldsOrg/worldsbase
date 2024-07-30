import { Injectable } from '@nestjs/common';
import { Edge } from './entities/worflow.entities';
import { WalletService } from 'src/wallet/wallet.service';
import { TableService } from 'src/table/table.service';
import { EthersService } from 'src/ethers/ethers.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { TopUpService } from 'src/topup/topup.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly tableService: TableService,
    private readonly walletService: WalletService,
    private readonly ethersService: EthersService,
    private readonly thirdwebService: ThirdwebService,
    private readonly topupService: TopUpService,
  ) {}

  convertEtherToWei(etherAmount: string | number | bigint | boolean) {
    const weiPerEther = BigInt('1000000000000000000'); // 10^18 as BigInt
    return BigInt(etherAmount) * weiPerEther;
  }

  getNodeExecutionOrder(edges: Edge[]): [string[], Map<string, number>] {
    if (!edges.length) return [[], new Map<string, number>()];
    const order: string[] = [];
    const visited = new Set<string>();
    // track the depth of each node to handle when a node has multiple edges
    const depthMap = new Map<string, number>();

    function dfs(node: string, depth: number) {
      if (!visited.has(node)) {
        visited.add(node);
        order.push(node);
        depthMap.set(node, depth);
        const children = edges.filter((edge) => edge.source === node);
        for (const child of children) {
          dfs(child.target, depth + 1);
        }
      }
    }

    dfs(edges[0].source, 0);
    return [order, depthMap];
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
        await this.processWalletNode(node, variables, index);
        break;
      case 'transferPackNode':
        await this.processTransferPackNode(node, variables, index);
        break;
      case 'topOffEthNode':
        await this.processTopOffEthNode(node, variables, index);
        break;
      case 'tokenNode':
        await this.processMintNode(node, parsedData, variables, index);
        break;
      case 'batchMintNode':
        await this.processBatchMintNode(node);
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
    console.log('node data:', node.data);
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
    console.log('Query:', query);
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

    const result = await this.thirdwebService.createEngineWallet(userId);

    variables.push(result);
    const query = `UPDATE wtf_users SET provisioned_wallet = $1 WHERE id = $2`;
    const values = [result.address, userId];

    await this.tableService.executeQuery(query, values);
  }

  private async processTransferPackNode(
    node: any,
    variables: any[],
    index: number,
  ): Promise<void> {
    const wallet = node.data.wallet.startsWith('.')
      ? variables[index][node.data.wallet.slice(1)]
      : node.data.wallet;
    if (wallet === undefined) {
      console.warn(`Value for field ${wallet} is undefined`);
      return;
    }

    const result = await this.thirdwebService.transferPackEngine(wallet);

    variables.push(result);
  }

  private async processTopOffEthNode(
    node: any,
    variables: any[],
    index: number,
  ): Promise<void> {
    const wallet = node.data.wallet.startsWith('.')
      ? variables[index][node.data.wallet.slice(1)]
      : node.data.wallet;
    if (wallet === undefined) {
      console.warn(`Value for field ${wallet} is undefined`);
      return;
    }

    const result = await this.topupService.topUpUserWallet(wallet);

    variables.push(result);
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

  private async processBatchMintNode(node: {
    data: {
      table: string;
      transaction: {
        toAddress: any;
        amount: any;
        minter: any;
        chainId: any;
        contractAddress: any;
      };
    };
  }) {
    const toAddressColumnName = node.data.transaction.toAddress.slice(1);

    if (toAddressColumnName === undefined) {
      console.warn(`Value for field ${toAddressColumnName} is undefined`);
      return;
    }

    const amountColumnName = node.data.transaction.amount.slice(1);

    if (amountColumnName === undefined) {
      console.warn(`Value for field ${amountColumnName} is undefined`);
      return;
    }

    const getTableQuery = `SELECT * FROM ${node.data.table} WHERE ${toAddressColumnName} IS NOT NULL AND ${amountColumnName} IS NOT NULL AND ${amountColumnName} > 0`;
    const result = await this.tableService.executeQuery(getTableQuery);

    if (result.status === 200) {
      const batchData = result.data.map((row: any) => ({
        toAddress: row[toAddressColumnName],
        amount: row[amountColumnName],
      }));
      console.log('Start minting', batchData);
      const tx = await this.thirdwebService.mintErc20BatchEngine(
        node.data.transaction.contractAddress,
        batchData,
        node.data.transaction.minter,
        node.data.transaction.chainId,
      );
      console.log(tx);
    }
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
        const [order, depth] = this.getNodeExecutionOrder(edges);
        console.log('Execution order:', order);
        order.shift(); // remove the trigger node
        const parsedData = JSON.parse(data);
        const variables = [parsedData];
        for (const nodeId of order) {
          // get the depth of the node
          const nodeDepth = depth.get(nodeId);
          // subtract 1 from the depth to get the index of the node in the variables array since we remove the trigger node
          const index =
            typeof nodeDepth === 'number' && nodeDepth !== undefined
              ? nodeDepth - 1
              : 0;
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
