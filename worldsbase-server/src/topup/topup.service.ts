import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DBService } from 'src/db/db.service';
import { ConfigService } from '@nestjs/config';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';

@Injectable()
export class TopUpService {
  constructor(
    private dbService: DBService,
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
    const minBalance = this.configService.get<number>(
      'TOPUP_MIN_BALANCE',
    ) as number;
    const minTransfer = this.configService.get<number>(
      'TOPUP_MIN_TRANSFER',
    ) as number;

    const { status, data } = await this.dbService.executeQuery(
      'SELECT * FROM "users" WHERE "wallet" IS NOT NULL',
    );

    if (status != 200) throw new Error('Error fetching data from tables');

    const totalUsers = data.length;

    try {
      const availableBalance = await this.thirdwebService.getBalanceVault(
        adminWallet,
        chainId,
      );

      if (availableBalance.lt(totalUsers * minBalance))
        throw new Error('Not enough funds in admin wallet');

      for (const user of data) {
        const balance = await this.thirdwebService.getBalanceVault(
          user.wallet,
          chainId,
        );
        const transferValue = balance.sub(minBalance);
        if (balance.sub(minBalance).gt(minTransfer)) continue;
        await this.thirdwebService.transferNativeVault(
          adminWallet,
          user.wallet,
          chainId,
          transferValue.toString(),
        );
      }
    } catch (error) {
      // TODO: notify error through discord? Specially for admin missing funds
      this.logger.error(error);
      return;
    }
  }
}
