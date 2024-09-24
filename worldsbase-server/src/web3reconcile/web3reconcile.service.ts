import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DBService } from '../db/db.service';
import { ThirdwebService } from '../thirdweb/thirdweb.service';

@Injectable()
export class Web3ReconcileService {
  private chainId: string;
  private affectionPointsContract: string;
  private steamWaifusContract: string;
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
    this.steamWaifusContract = this.configService.get<string>(
      'STEAM_WAIFUS_CONTRACT',
    ) as string;
    this.production =
      (this.configService.get<string>('RAILWAY_ENVIRONMENT_NAME') as string) ==
      'production'
        ? true
        : false;
  }

  @Cron('30 6,12 * * *')
  handleCronSteamErc20() {
    if (this.production) {
      console.log('Reconciling Steam MiniGame ERC20');
      this.reconcileSteamMiniGameErc20();
    }
  }

  @Cron('45 6,12 * * *')
  handleCronSteamErc1155() {
    if (this.production) {
      console.log('Reconciling Steam MiniGame ERC1155');
      this.reconcileSteamMiniGameErc1155();
    }
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

  async reconcileSteamMiniGameErc20() {
    try {
      const query = `SELECT num_clicks, provisioned_wallet FROM "wtf_steam_users" WHERE "provisioned_wallet" IS NOT NULL`;
      const result = await this.dbService.executeQuery(query);
      const engineWallets = await this.thirdwebService.getWalletsEngine();
      if (result.status == 200) {
        const data = result.data;
        for (const row of data) {
          const numClicks = Number(row.num_clicks);
          const wallet = row.provisioned_wallet;
          if (
            engineWallets.includes(wallet.toString().toLowerCase()) &&
            numClicks > 0
          ) {
            const erc20BalanceAffection =
              await this.thirdwebService.getErc20BalanceEngine(
                wallet,
                this.chainId,
                this.affectionPointsContract,
              );
            const roundedDifference = Math.round(
              numClicks - erc20BalanceAffection,
            );
            if (roundedDifference != 0) {
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

  async getErc1155Dictionary() {
    try {
      const query = `SELECT template_id, token_id FROM "wtf_steam_erc1155"`;
      const result = await this.dbService.executeQuery(query);

      const erc1155Dictionary = new Map<number, number>();

      if (result.status === 200) {
        const data = result.data;
        for (const row of data) {
          const key = Number(row.template_id);
          const value = Number(row.token_id);
          erc1155Dictionary.set(key, value);
        }
      }

      return erc1155Dictionary;
    } catch (error) {
      console.error('Error getting erc1155 reference:', error);
    }
  }

  async reconcileSteamMiniGameErc1155() {
    try {
      const erc1155Dictionary = await this.getErc1155Dictionary();
      const query = `SELECT * FROM "steam_user_item_summary"`;
      const result = await this.dbService.executeQuery(query);
      const engineWallets = await this.thirdwebService.getWalletsEngine();
      if (result.status == 200) {
        const data = result.data;
        for (const row of data) {
          const wallet = row.provisioned_wallet;
          const templateId = row.template_id;
          const tokenId = erc1155Dictionary
            ?.get(Number(templateId))
            ?.toString();
          const quantity = row.quantity;
          if (
            wallet &&
            engineWallets.includes(wallet.toString().toLowerCase()) &&
            tokenId
          ) {
            const erc1155Balance =
              await this.thirdwebService.getErc1155BalanceEngine(
                wallet,
                tokenId,
                this.chainId,
                this.steamWaifusContract,
              );
            if (erc1155Balance != quantity) {
              const amount = Number(erc1155Balance) - Number(quantity);
              if (amount > 0) {
                await this.thirdwebService.burnErc1155Engine(
                  wallet,
                  tokenId,
                  amount.toString(),
                  this.chainId,
                  this.steamWaifusContract,
                );
              } else {
                await this.thirdwebService.transferErc1155Engine(
                  wallet,
                  tokenId,
                  Math.abs(amount).toString(),
                  this.chainId,
                  this.steamWaifusContract,
                  this.adminWallet,
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(
        'Error reconciling web3 for steam minigame erc1155:',
        error,
      );
    }
  }
}
