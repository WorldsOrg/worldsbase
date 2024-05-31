import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { parseUnits } from 'ethersV6';

@Injectable()
export class TopUpService {
  constructor(
    private thirdwebService: ThirdwebService,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(TopUpService.name);

  @Cron('0 0 * * *')
  handleCron() {
    this.topUpUsersWallets();
  }

  async topUpUsersWallets() {
    const adminWallet = this.configService.get<string>(
      'TOPUP_ADMIN_WALLET_ADDRESS',
    ) as string;
    const chainId = this.configService.get<string>('TOPUP_CHAIN_ID') as string;
    const minBalanceString = this.configService.get<string>(
      'TOPUP_MIN_BALANCE',
    ) as string;
    const minTransferString = this.configService.get<string>(
      'TOPUP_MIN_TRANSFER',
    ) as string;

    const minBalance = parseUnits(minBalanceString, 'wei');
    const minTransfer = parseUnits(minTransferString, 'wei');

    const wallets = await this.thirdwebService.getWalletsEngine();
    const totalUsers = wallets.length;
    try {
      const availableBalance = await this.thirdwebService.getBalanceEngine(
        adminWallet,
        chainId,
      );

      if (availableBalance < BigInt(totalUsers) * minBalance)
        throw new Error('Not enough funds in admin wallet');

      for (const wallet of wallets) {
        const balance = await this.thirdwebService.getBalanceEngine(
          wallet,
          chainId,
        );
        const transferValue = balance - minBalance;
        if (balance - minBalance > minTransfer) continue;
        await this.thirdwebService.transferNativeEngine(
          adminWallet,
          wallet,
          chainId,
          transferValue,
        );
      }
    } catch (error) {
      // TODO: notify error through discord? Specially for admin missing funds
      this.logger.error(error);
      return;
    }
  }
}
