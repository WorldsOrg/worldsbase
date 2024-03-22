import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DBService } from 'src/db/db.service';
import { ChainService } from 'src/onchain/chain.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TasksService {
  constructor(
    private chainService: ChainService,
    private dbService: DBService,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 */10 * * * *')
  handleCron() {
    this.updateDirectListings();
    this.updateAuctionListings();
  }

  async updateDirectListings() {
    if (!this.configService.get<string>('MARKETPLACE_CONTRACT_ADDRESS')) {
      this.logger.error('MARKETPLACE_CONTRACT_ADDRESS not found');
      return;
    }
    const result = await this.chainService.marketplaceDirect(
      this.configService.get<string>('MARKETPLACE_CONTRACT_ADDRESS') as string,
    );

    const dataToWrite = result.map((item) => [
      item.assetContractAddress,
      item.id,
      item.asset,
      item.endTimeInSeconds,
      item.status,
    ]);

    // Flatten the array to pass as query parameters
    const flattenedData = dataToWrite.flat();

    // Generate placeholders for each row, considering each item has 5 fields
    const placeholders = dataToWrite
      .map(
        (_, index) =>
          `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`,
      )
      .join(', ');

    const query = `
          INSERT INTO direct_listings ("assetContractAddress", id, "asset", "endTimeInSeconds", status)
          VALUES ${placeholders}
          ON CONFLICT (id) DO UPDATE SET
              "assetContractAddress" = EXCLUDED."assetContractAddress",
              "asset" = EXCLUDED."asset",
              "endTimeInSeconds" = EXCLUDED."endTimeInSeconds",
              status = EXCLUDED.status;
      `;

    this.dbService.executeQuery(query, flattenedData);
    this.logger.debug('Direct listings updated');
  }

  async updateAuctionListings() {
    if (!this.configService.get<string>('MARKETPLACE_CONTRACT_ADDRESS')) {
      this.logger.error('MARKETPLACE_CONTRACT_ADDRESS not found');
      return;
    }
    const result = await this.chainService.marketplaceAuction(
      this.configService.get<string>('MARKETPLACE_CONTRACT_ADDRESS') as string,
    );
    const dataToWrite = result.map((item) => [
      item.assetContractAddress,
      item.id,
      item.asset,
      item.endTimeInSeconds,
      item.status,
      item.minimumBidAmount,
      item.buyoutBidAmount,
    ]);

    // Flatten the array to pass as query parameters
    const flattenedData = dataToWrite.flat();

    // Generate placeholders for each row, considering each item has 5 fields
    const placeholders = dataToWrite
      .map(
        (_, index) =>
          `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5} , $${index * 7 + 6} , $${index * 7 + 7})`,
      )
      .join(', ');

    const query = `
            INSERT INTO auction_listings ("assetContractAddress", id, "asset", "endTimeInSeconds", status, "minimumBidAmount", "buyoutBidAmount")
            VALUES ${placeholders}
            ON CONFLICT (id) DO UPDATE SET
                "assetContractAddress" = EXCLUDED."assetContractAddress",
                "asset" = EXCLUDED."asset",
                "endTimeInSeconds" = EXCLUDED."endTimeInSeconds",
                status = EXCLUDED.status,
                "minimumBidAmount" = EXCLUDED."minimumBidAmount",
                "buyoutBidAmount" = EXCLUDED."buyoutBidAmount";
        `;

    this.dbService.executeQuery(query, flattenedData);
    this.logger.debug('Auction listings updated');
  }
}
