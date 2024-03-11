import {
  Controller,
  Delete,
  Post,
  Put,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { TableService } from './table.service';
import {
  AddColumnDTO,
  CreateTableDTO,
  DeleteTableColumnDTO,
  RenameColumnDTO,
  SchemaDTO,
  TableNameDTO,
  UpdateTableNameDTO,
} from './dto/table.dto';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('/createTable')
  createTable(@Body() createTableDTO: CreateTableDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    const columnDefinitions = createTableDTO.columns
      .map((col) => `${col.name} ${col.type} ${col.constraints || ''}`)
      .join(', ');

    return this.tableService.executeQuery(
      `CREATE TABLE IF NOT EXISTS ${createTableDTO.tableName} (${columnDefinitions});`,
    );
  }

  @Delete('/deleteTable/:tableName')
  deleteTable(@Param('tableName') tableNameDTO: TableNameDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `DROP TABLE IF EXISTS ${tableNameDTO.tableName};`,
    );
  }

  @Put('/updateTableName')
  updateTableName(@Body() updateTableNameDTO: UpdateTableNameDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `ALTER TABLE ${updateTableNameDTO.oldTableName} RENAME TO ${updateTableNameDTO.newTableName};`,
    );
  }

  @Post('/addColumn')
  addColumn(@Body() addColumnDTO: AddColumnDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `ALTER TABLE ${addColumnDTO.tableName} ADD COLUMN ${addColumnDTO.columnName} ${addColumnDTO.columnType};`,
    );
  }

  @Delete('/deleteColumn')
  deleteColumn(@Body() deleteTableColumnDTO: DeleteTableColumnDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `ALTER TABLE ${deleteTableColumnDTO.tableName} DROP COLUMN ${deleteTableColumnDTO.columnName};`,
    );
  }

  @Put('/renameColumn')
  renameColumn(@Body() renameColumnDTO: RenameColumnDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `ALTER TABLE ${renameColumnDTO.tableName} RENAME COLUMN ${renameColumnDTO.oldColumnName} TO ${renameColumnDTO.newColumnName};`,
    );
  }

  @Get('/getColumns/:tableName')
  getColumns(@Param() tableNameDTO: TableNameDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      "SELECT c.column_name, c.data_type, CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key FROM information_schema.columns AS c LEFT JOIN information_schema.key_column_usage AS kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name LEFT JOIN information_schema.table_constraints AS tc ON kcu.table_name = tc.table_name AND kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY' WHERE c.table_name = $1 AND c.table_schema = 'public';",
      [tableNameDTO.tableName],
    );
  }

  @Get('/getTables/:schema')
  getTables(@Param() schemaDTO: SchemaDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schemaDTO.schema}';`,
    );
  }

  @Get('/getTable/:tableName')
  getTable(@Param() tableNameDTO: TableNameDTO): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    return this.tableService.executeQuery(
      `SELECT * FROM ${tableNameDTO.tableName};`,
    );
  }

  @Get('/getTableValue/:tableName/:columnName/:columnValue')
  getTableValue(
    @Param() tableName: string,
    columnName: string,
    columnValue: string,
  ): Promise<
    | {
        status: number;
        data: any;
        error?: undefined;
      }
    | {
        status: number;
        error: string;
        data?: undefined;
      }
  > {
    const query = `SELECT * FROM ${tableName} WHERE ${columnName} = $1;`;
    return this.tableService.executeQuery(query, [columnValue]);
  }

  // @Post('/joinTables')
  // joinTables(): Promise<
  //   | {
  //       status: number;
  //       data: any;
  //       error?: undefined;
  //     }
  //   | {
  //       status: number;
  //       error: string;
  //       data?: undefined;
  //     }
  // > {
  //   return this.tableService.executeQuery();
  // }

  // @Post('/executeSelectQuery')
  // executeSelectQuery(): Promise<
  //   | {
  //       status: number;
  //       data: any;
  //       error?: undefined;
  //     }
  //   | {
  //       status: number;
  //       error: string;
  //       data?: undefined;
  //     }
  // > {
  //   return this.tableService.executeQuery();
  // }

  // @Post('/insertData')
  // insertData(): Promise<
  //   | {
  //       status: number;
  //       data: any;
  //       error?: undefined;
  //     }
  //   | {
  //       status: number;
  //       error: string;
  //       data?: undefined;
  //     }
  // > {
  //   return this.tableService.executeQuery();
  // }

  // @Delete('/deleteData')
  // deleteData(): Promise<
  //   | {
  //       status: number;
  //       data: any;
  //       error?: undefined;
  //     }
  //   | {
  //       status: number;
  //       error: string;
  //       data?: undefined;
  //     }
  // > {
  //   return this.tableService.executeQuery();
  // }

  // @Put('/updateData')
  // updateData(): Promise<
  //   | {
  //       status: number;
  //       data: any;
  //       error?: undefined;
  //     }
  //   | {
  //       status: number;
  //       error: string;
  //       data?: undefined;
  //     }
  // > {
  //   return this.tableService.executeQuery();
  // }
}
