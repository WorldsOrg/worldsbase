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
  DeleteDataDTO,
  DeleteTableColumnDTO,
  GetTableNameDTO,
  InsertDataDTO,
  JoinTablesDTO,
  QueryDTO,
  RenameColumnDTO,
  SchemaDTO,
  TableNameDTO,
  UpdateDataDTO,
  UpdateTableNameDTO,
} from './dto/table.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Table')
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
    @Param()
    getTableNameDTO: GetTableNameDTO,
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
    const query = `SELECT * FROM ${getTableNameDTO.tableName} WHERE ${getTableNameDTO.columnName} = $1;`;
    return this.tableService.executeQuery(query, [getTableNameDTO.columnValue]);
  }

  @Post('/joinTables')
  joinTables(@Body() joinTablesDTO: JoinTablesDTO): Promise<
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
    const joinQuery = `FROM ${joinTablesDTO.tables[0]} ${joinTablesDTO.joinType} JOIN ${joinTablesDTO.tables[1]} ON ${joinTablesDTO.tables[0]}.${joinTablesDTO.joinColumns[0]} = ${joinTablesDTO.tables[1]}.${joinTablesDTO.joinColumns[1]}`;
    let query = `SELECT * ${joinQuery}`;

    if (
      joinTablesDTO.filter &&
      joinTablesDTO.filter.column &&
      joinTablesDTO.filter.value !== undefined
    ) {
      query += ` WHERE ${joinTablesDTO.filter.column} = $1`;
    }

    query += ';';

    return this.tableService.executeQuery(
      query,
      joinTablesDTO.filter ? [joinTablesDTO.filter.value] : [],
    );
  }

  @Post('/executeSelectQuery')
  executeSelectQuery(@Body() queryDTO: QueryDTO): Promise<
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
    if (
      (queryDTO.query && !queryDTO.query.toLowerCase().startsWith('select')) ||
      /;\s*drop\s|;\s*delete\s|;\s*insert\s|;\s*update\s/.test(
        queryDTO.query.toLowerCase(),
      )
    ) {
      return Promise.resolve({
        status: 400,
        error: 'Invalid query',
      });
    }

    return this.tableService.executeQuery(queryDTO.query, []);
  }

  @Post('/insertData')
  insertData(@Body() insertDataDTO: InsertDataDTO): Promise<
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
    const columns = Object.keys(insertDataDTO.data).join(', ');
    const values = Object.values(insertDataDTO.data);
    const valuePlaceholders = values
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const query = `INSERT INTO ${insertDataDTO.tableName} (${columns}) VALUES (${valuePlaceholders});`;
    return this.tableService.executeQuery(query, values);
  }

  @Delete('/deleteData')
  deleteData(@Body() deleteDataDTO: DeleteDataDTO): Promise<
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
    const query = `DELETE FROM ${deleteDataDTO.tableName} WHERE ${deleteDataDTO.condition};`;
    return this.tableService.executeQuery(query);
  }

  @Put('/updateData')
  updateData(@Body() updateDataDTO: UpdateDataDTO): Promise<
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
    const values: any[] | undefined = [];

    // Generate the SET part of the SQL query, and populate the values array
    const updates = Object.entries(updateDataDTO.data)
      .map(([key, value], index) => {
        values.push(value); // Push each value into the array
        return `${key} = $${index + 1}`; // Use index for placeholder
      })
      .join(', ');

    // Construct the full SQL query
    const query = `UPDATE ${updateDataDTO.tableName} SET ${updates} WHERE ${updateDataDTO.condition};`;

    return this.tableService.executeQuery(query, values);
  }
}