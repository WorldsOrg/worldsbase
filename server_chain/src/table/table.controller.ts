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
  IncrementDataDTO,
  InsertDataDTO,
  JoinTablesDTO,
  QueryDTO,
  RenameColumnDTO,
  SchemaDTO,
  TableApiResponse,
  TableNameDTO,
  UpdateDataDTO,
  UpdateTableNameDTO,
} from './dto/table.dto';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Table')
@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('/createTable')
  @ApiOperation({ summary: 'Create a new table' })
  @ApiBody({ type: CreateTableDTO })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createTable(
    @Body() createTableDTO: CreateTableDTO,
  ): Promise<TableApiResponse<any>> {
    const columnDefinitions = createTableDTO.columns
      .map((col) => `"${col.name}" ${col.type} ${col.constraints || ''}`)
      .join(', ');

    return this.tableService.executeQuery(
      `CREATE TABLE IF NOT EXISTS "${createTableDTO.tableName}" (${columnDefinitions});`,
    );
  }

  @Delete('/deleteTable/:tableName')
  @ApiOperation({ summary: 'Delete an existing table' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'Name of the table to delete',
  })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  deleteTable(
    @Param('tableName') tableNameDTO: TableNameDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `DROP TABLE IF EXISTS "${tableNameDTO.tableName}";`,
    );
  }

  @Put('/updateTableName')
  @ApiOperation({ summary: 'Update the name of an existing table' })
  @ApiBody({ type: UpdateTableNameDTO })
  @ApiResponse({ status: 200, description: 'Table name updated successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  updateTableName(
    @Body() updateTableNameDTO: UpdateTableNameDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `ALTER TABLE "${updateTableNameDTO.oldTableName}" RENAME TO "${updateTableNameDTO.newTableName}";`,
    );
  }

  @Post('/addColumn')
  @ApiOperation({ summary: 'Add a new column to an existing table' })
  @ApiBody({ type: AddColumnDTO })
  @ApiResponse({ status: 200, description: 'Column added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  addColumn(
    @Body() addColumnDTO: AddColumnDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `ALTER TABLE "${addColumnDTO.tableName}" ADD COLUMN "${addColumnDTO.columnName}" ${addColumnDTO.columnType};`,
    );
  }

  @Delete('/deleteColumn')
  @ApiOperation({ summary: 'Delete a column from a table' })
  @ApiBody({ type: DeleteTableColumnDTO })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  deleteColumn(
    @Body() deleteTableColumnDTO: DeleteTableColumnDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `ALTER TABLE "${deleteTableColumnDTO.tableName}" DROP COLUMN "${deleteTableColumnDTO.columnName}";`,
    );
  }

  @Put('/renameColumn')
  @ApiOperation({ summary: 'Rename an existing column in a table' })
  @ApiBody({ type: RenameColumnDTO })
  @ApiResponse({ status: 200, description: 'Column renamed successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  renameColumn(
    @Body() renameColumnDTO: RenameColumnDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `ALTER TABLE "${renameColumnDTO.tableName}" RENAME COLUMN "${renameColumnDTO.oldColumnName}" TO "${renameColumnDTO.newColumnName}";`,
    );
  }

  @Get('/getColumns/:tableName')
  @ApiOperation({ summary: 'Get all columns from a specific table' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve columns from',
  })
  @ApiResponse({ status: 200, description: 'Columns retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  getColumns(
    @Param() tableNameDTO: TableNameDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      "SELECT c.column_name, c.data_type, CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key FROM information_schema.columns AS c LEFT JOIN information_schema.key_column_usage AS kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name LEFT JOIN information_schema.table_constraints AS tc ON kcu.table_name = tc.table_name AND kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY' WHERE c.table_name = $1 AND c.table_schema = 'public';",
      [tableNameDTO.tableName],
    );
  }

  @Get('/getTables/:schema')
  @ApiOperation({ summary: 'Get all tables from a specific schema' })
  @ApiParam({
    name: 'schema',
    type: 'string',
    description: 'The schema to list tables from',
  })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
  getTables(@Param() schemaDTO: SchemaDTO): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schemaDTO.schema}';`,
    );
  }

  @Get('/getTable/:tableName')
  @ApiOperation({ summary: 'Get the entire table data by table name' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve data from',
  })
  @ApiResponse({
    status: 200,
    description: 'Table data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  getTable(
    @Param() tableNameDTO: TableNameDTO,
  ): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      `SELECT * FROM "${tableNameDTO.tableName}";`,
    );
  }

  @Get('/getTableValue/:tableName/:columnName/:columnValue')
  @ApiOperation({
    summary:
      'Get the table data by column value, example: /getTableValue/users/username/johndoe',
  })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve data from',
  })
  @ApiParam({
    name: 'columnName',
    type: 'string',
    description: 'The name of the column to retrieve data from',
  })
  @ApiParam({
    name: 'columnValue',
    type: 'string',
    description: 'The value of the column to retrieve data from',
  })
  @ApiResponse({
    status: 200,
    description: 'Table data retrieved successfully',
  })
  getTableValue(
    @Param()
    getTableNameDTO: GetTableNameDTO,
  ): Promise<TableApiResponse<any>> {
    const query = `SELECT * FROM "${getTableNameDTO.tableName}" WHERE "${getTableNameDTO.columnName}" = $1;`;
    return this.tableService.executeQuery(query, [getTableNameDTO.columnValue]);
  }

  @Post('/joinTables')
  @ApiOperation({ summary: 'Joins two tables' })
  @ApiBody({ type: JoinTablesDTO })
  joinTables(
    @Body() joinTablesDTO: JoinTablesDTO,
  ): Promise<TableApiResponse<any>> {
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
  @ApiOperation({ summary: 'Execute a select query' })
  @ApiBody({ type: QueryDTO })
  executeSelectQuery(
    @Body() queryDTO: QueryDTO,
  ): Promise<TableApiResponse<any>> {
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
  @ApiOperation({ summary: 'Insert data into a table' })
  @ApiBody({ type: InsertDataDTO })
  insertData(
    @Body() insertDataDTO: InsertDataDTO,
  ): Promise<TableApiResponse<any>> {
    const columns = Object.keys(insertDataDTO.data).join(', ');
    const values = Object.values(insertDataDTO.data);
    const valuePlaceholders = values
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const query = `INSERT INTO "${insertDataDTO.tableName}" (${columns}) VALUES (${valuePlaceholders});`;
    return this.tableService.executeQuery(query, values);
  }

  @Delete('/deleteData')
  deleteData(
    @Body() deleteDataDTO: DeleteDataDTO,
  ): Promise<TableApiResponse<any>> {
    const query = `DELETE FROM "${deleteDataDTO.tableName}" WHERE ${deleteDataDTO.condition};`;
    return this.tableService.executeQuery(query);
  }

  @Put('/updateData')
  updateData(
    @Body() updateDataDTO: UpdateDataDTO,
  ): Promise<TableApiResponse<any>> {
    const values: any[] | undefined = [];

    // Generate the SET part of the SQL query, and populate the values array
    const updates = Object.entries(updateDataDTO.data)
      .map(([key, value], index) => {
        values.push(value); // Push each value into the array
        return `${key} = $${index + 1}`; // Use index for placeholder
      })
      .join(', ');

    // Construct the full SQL query
    const query = `UPDATE "${updateDataDTO.tableName}" SET ${updates} WHERE ${updateDataDTO.condition};`;

    return this.tableService.executeQuery(query, values);
  }

  @Post('/incrementData')
  incrementData(
    @Body() incrementDataDTO: IncrementDataDTO,
  ): Promise<TableApiResponse<any>> {
    const query = `UPDATE "${incrementDataDTO.tableName}" SET ${incrementDataDTO.columnName} = ${incrementDataDTO.columnName} + ${incrementDataDTO.value} WHERE ${incrementDataDTO.condition};`;
    return this.tableService.executeQuery(query);
  }

  @Post('/decrementData')
  decrementData(
    @Body() decrementDataDTO: IncrementDataDTO,
  ): Promise<TableApiResponse<any>> {
    const query = `UPDATE "${decrementDataDTO.tableName}" SET ${decrementDataDTO.columnName} = ${decrementDataDTO.columnName} - ${decrementDataDTO.value} WHERE ${decrementDataDTO.condition};`;
    return this.tableService.executeQuery(query);
  }

  @Get('/defaultTables')
  getDefaultDefinedTables(): Promise<TableApiResponse<any>> {
    return this.tableService.executeQuery(
      "SELECT table_name FROM information_schema.tables WHERE table_schema != 'public';",
    );
  }
}
