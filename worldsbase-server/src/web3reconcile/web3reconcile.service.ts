import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DBService } from '../db/db.service';
import { ThirdwebService } from '../thirdweb/thirdweb.service';

@Injectable()
export class Web3ReconcileService {
  private chainId: string;
  private affectionPointsContract: string;
  private giftItemsContract: string;
  private adminWallet: string;
  private production: boolean;

  constructor(
    private thirdwebService: ThirdwebService,
    private dbService: DBService,
    private configService: ConfigService,
  ) {
    this.chainId = this.configService.get<string>('TOPUP_CHAIN_ID') as string;
    this.affectionPointsContract = this.configService.get<string>(
      'AFFECTION_POINTS_CONTRACT',
    ) as string;
    this.adminWallet = this.configService.get<string>(
      'TOPUP_ADMIN_WALLET_ADDRESS',
    ) as string;
    this.giftItemsContract = this.configService.get<string>(
      'GIFT_ITEMS_CONTRACT',
    ) as string;
    this.production = this.configService.get<string>('RAILWAY_ENVIRONMENT_NAME') as string == 'production' ? true : false;
  }

  @Cron('0 6,12 * * *')
  handleCronErc1155() {
    if (this.production) this.reconcileMiniGameErc1155();
  }

  @Cron('30 6,12 * * *')
  handleCronErc20() {
    if (this.production) this.reconcileMiniGameErc20();
  }

  async reconcileErc20(wallet: string, difference: number, contract: string) {
    try {
      if (difference === 0) return;
      else if (difference < 0) {
        const absAmount = Math.abs(difference);
        await this.thirdwebService.burnErc20Engine(
          wallet,
          absAmount.toString(),
          this.chainId,
          contract,
        );
      } else {
        await this.thirdwebService.mintErc20Engine(
          wallet,
          difference.toString(),
          this.chainId,
          contract,
          this.adminWallet,
        );
      }
    } catch (error) {
      console.error('Error reconciling ERC20:', error);
    }
  }

  async reconcileMiniGameErc20() {
    try {
      console.log('Reconciling MiniGame ERC20');
      const query = `SELECT score, social_score, provisioned_wallet FROM "wtf_users" WHERE "provisioned_wallet" IS NOT NULL`;
      const result = await this.dbService.executeQuery(query);
      const engineWallets = await this.thirdwebService.getWalletsEngine();
      if (result.status == 200) {
        const data = result.data;
        for (const row of data) {
          const score = Number(row.score);
          const socialScore = Number(row.social_score);
          const wallet = row.provisioned_wallet;
          const totalScore = score + socialScore;
          if (
            engineWallets.includes(wallet.toString().toLowerCase()) &&
            score > 0
          ) {
            const erc20BalanceAffection =
              await this.thirdwebService.getErc20BalanceEngine(
                wallet,
                this.chainId,
                this.affectionPointsContract,
              );
            const roundedDifference = Math.round(totalScore - erc20BalanceAffection);
            if (
              roundedDifference != 0
            ) {
              await this.reconcileErc20(
                wallet,
                roundedDifference,
                this.affectionPointsContract,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reconciling web3 erc20:', error);
    }
  }

  async reconcileMiniGameErc1155() {
    try {
      const query = `SELECT * FROM "user_inventory_summary"`;
      const result = await this.dbService.executeQuery(query);
      const engineWallets = await this.thirdwebService.getWalletsEngine();
      if (result.status == 200) {
        const data = result.data;
        for (const row of data) {
          const wallet = row.provisioned_wallet;
          const itemQuantities = [];
          itemQuantities.push(row.item_1_quantity);
          itemQuantities.push(row.item_2_quantity);
          itemQuantities.push(row.item_3_quantity);
          itemQuantities.push(row.item_4_quantity);
          itemQuantities.push(row.item_5_quantity);
          itemQuantities.push(row.item_6_quantity);
          if (engineWallets.includes(wallet.toString().toLowerCase())) {
            for (let i = 0; i < itemQuantities.length; i++) {
              const erc1155Balance =
                await this.thirdwebService.getErc1155BalanceEngine(
                  wallet,
                  i.toString(),
                  this.chainId,
                  this.giftItemsContract,
                );
              if (erc1155Balance != itemQuantities[i]) {
                const amount = Number(erc1155Balance) - itemQuantities[i];
                if (amount > 0) {
                  await this.thirdwebService.burnErc1155Engine(
                    wallet,
                    i.toString(),
                    amount.toString(),
                    this.chainId,
                    this.giftItemsContract,
                  );
                } else {
                  await this.thirdwebService.transferErc1155Engine(
                    wallet,
                    i.toString(),
                    Math.abs(amount).toString(),
                    this.chainId,
                    this.giftItemsContract,
                    this.adminWallet,
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reconciling web3 erc1155:', error);
    }
  }
}
