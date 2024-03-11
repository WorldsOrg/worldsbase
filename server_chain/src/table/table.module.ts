import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  controllers: [TableController],
  providers: [TableService],
  imports: [DbModule],
})
export class TableModule {}
