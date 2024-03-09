import { Controller, Delete, Post, Put, Get } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post('/createTable')
  createTable(): Promise<string> {
    return this.tablesService.createTable();
  }

  @Delete('/deleteTable')
  deleteTable(): Promise<string> {
    return this.tablesService.deleteTable();
  }

  @Put('/updateTableName')
  updateTableName(): Promise<string> {
    return this.tablesService.updateTableName();
  }

  @Post('/addColumn')
  addColumn(): Promise<string> {
    return this.tablesService.addColumn();
  }

  @Delete('/deleteColumn')
  deleteColumn(): Promise<string> {
    return this.tablesService.deleteColumn();
  }

  @Put('/renameColumn')
  renameColumn(): Promise<string> {
    return this.tablesService.renameColumn();
  }

  @Get('/getColumns')
  getColumns(): Promise<string> {
    return this.tablesService.getColumns();
  }

  @Get('/getTables')
  getTables(): Promise<string> {
    return this.tablesService.getTables();
  }

  @Get('/getTable')
  getTable(): Promise<string> {
    return this.tablesService.getTable();
  }

  @Get('/getTableValue')
  getTableValue(): Promise<string> {
    return this.tablesService.getTableValue();
  }

  @Post('/joinTables')
  joinTables(): Promise<string> {
    return this.tablesService.joinTables();
  }

  @Post('/executeSelectQuery')
  executeSelectQuery(): Promise<string> {
    return this.tablesService.executeSelectQuery();
  }

  @Post('/insertData')
  insertData(): Promise<string> {
    return this.tablesService.insertData();
  }

  @Delete('/deleteData')
  deleteData(): Promise<string> {
    return this.tablesService.deleteData();
  }

  @Put('/updateData')
  updateData(): Promise<string> {
    return this.tablesService.updateData();
  }
}
