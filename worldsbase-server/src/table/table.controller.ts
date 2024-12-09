/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  Post,
  Put,
  Get,
  Body,
  Param,
  BadRequestException,
  Query,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TableService } from './table.service';
import {
  AddColumnDTO,
  AdminQueryDTO,
  BatchUpdateDTO,
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
  TableNameDTO,
  TriggerDTO,
  UpdateDataDTO,
  UpdateFilterDataDTO,
  UpdateTableNameDTO,
} from './dto/table.dto';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Table')
@Controller('table')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('/createtable')
  @ApiOperation({ summary: 'Create a new table' })
  @ApiBody({ type: CreateTableDTO })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTable(@Body() createTableDTO: CreateTableDTO): Promise<any> {
    const columnDefinitions = createTableDTO.columns
      .map((col) => `"${col.name}" ${col.type} ${col.constraints || ''}`)
      .join(', ');
    const query = `CREATE TABLE IF NOT EXISTS ${createTableDTO.schemaName || 'public'}."${createTableDTO.tableName}" (${columnDefinitions});`;
    const result = await this.tableService.executeQuery(query);

    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Delete('/deletetable/:tableName')
  @ApiOperation({ summary: 'Delete an existing table' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'Name of the table to delete',
  })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async deleteTable(
    @Param('tableName') tableNameDTO: TableNameDTO,
  ): Promise<any> {
    const result = await this.tableService.executeQuery(
      `DROP TABLE IF EXISTS "${tableNameDTO.tableName}";`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Put('/updatetablename')
  @ApiOperation({ summary: 'Update the name of an existing table' })
  @ApiBody({ type: UpdateTableNameDTO })
  @ApiResponse({ status: 200, description: 'Table name updated successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async updateTableName(
    @Body() updateTableNameDTO: UpdateTableNameDTO,
  ): Promise<any> {
    const result = await this.tableService.executeQuery(
      `ALTER TABLE "${updateTableNameDTO.oldTableName}" RENAME TO "${updateTableNameDTO.newTableName}";`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/addcolumn')
  @ApiOperation({ summary: 'Add a new column to an existing table' })
  @ApiBody({ type: AddColumnDTO })
  @ApiResponse({ status: 200, description: 'Column added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async addColumn(@Body() addColumnDTO: AddColumnDTO): Promise<any> {
    const result = await this.tableService.executeQuery(
      `ALTER TABLE "${addColumnDTO.tableName}" ADD COLUMN "${addColumnDTO.columnName}" ${addColumnDTO.columnType};`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Delete('/deletecolumn')
  @ApiOperation({ summary: 'Delete a column from a table' })
  @ApiBody({ type: DeleteTableColumnDTO })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  async deleteColumn(
    @Body() deleteTableColumnDTO: DeleteTableColumnDTO,
  ): Promise<any> {
    const result = await this.tableService.executeQuery(
      `ALTER TABLE "${deleteTableColumnDTO.tableName}" DROP COLUMN "${deleteTableColumnDTO.columnName}";`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Put('/renamecolumn')
  @ApiOperation({ summary: 'Rename an existing column in a table' })
  @ApiBody({ type: RenameColumnDTO })
  @ApiResponse({ status: 200, description: 'Column renamed successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  async renameColumn(@Body() renameColumnDTO: RenameColumnDTO): Promise<any> {
    const result = await this.tableService.executeQuery(
      `ALTER TABLE "${renameColumnDTO.tableName}" RENAME COLUMN "${renameColumnDTO.oldColumnName}" TO "${renameColumnDTO.newColumnName}";`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/getcolumns/:tableName')
  @ApiOperation({ summary: 'Get all columns from a specific table' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve columns from',
  })
  @ApiResponse({ status: 200, description: 'Columns retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async getColumns(@Param() tableNameDTO: TableNameDTO): Promise<any> {
    const result = await this.tableService.executeQuery(
      "SELECT c.column_name, c.data_type, CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key FROM information_schema.columns AS c LEFT JOIN information_schema.key_column_usage AS kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name LEFT JOIN information_schema.table_constraints AS tc ON kcu.table_name = tc.table_name AND kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY' WHERE c.table_name = $1 AND c.table_schema = 'public';",
      [tableNameDTO.tableName],
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/gettables/:schema')
  @ApiOperation({ summary: 'Get all tables from a specific schema' })
  @ApiParam({
    name: 'schema',
    type: 'string',
    description: 'The schema to list tables from',
  })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
  async getTables(@Param() schemaDTO: SchemaDTO): Promise<any> {
    const result = await this.tableService.executeQuery(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schemaDTO.schema}';`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @Get('/gettable/:tableName')
  @ApiOperation({ summary: 'Get the entire table data by table name' })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve data from',
  })
  @ApiQuery({
    name: 'cache',
    type: 'boolean',
    required: false,
    description: 'Whether to use cache or not',
  })
  @ApiResponse({
    status: 200,
    description: 'Table data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async getTable(
    @Param() tableNameDTO: TableNameDTO,
    @Query('cache') useCache: string,
  ): Promise<any> {
    const shouldUseCache = useCache === 'true';
    if (shouldUseCache) {
      const cachedValue = await this.cacheManager.get<string>(
        tableNameDTO.tableName,
      );
      if (cachedValue) {
        return JSON.parse(cachedValue);
      }
    }

    const result = await this.tableService.executeQuery(
      `SELECT * FROM "${tableNameDTO.tableName}";`,
    );
    if (result.status === 200) {
      await this.cacheManager.set(
        tableNameDTO.tableName,
        JSON.stringify(result.data),
        10000,
      );

      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/gettablevalue/:tableName/:columnName/:columnValue')
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
  async getTableValue(
    @Param()
    getTableNameDTO: GetTableNameDTO,
  ): Promise<any> {
    const query = `SELECT * FROM "${getTableNameDTO.tableName}" WHERE "${getTableNameDTO.columnName}" = $1;`;
    const result = await this.tableService.executeQuery(query, [
      getTableNameDTO.columnValue,
    ]);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/gettablevalues/:tableName')
  @ApiOperation({
    summary:
      'Get the table data with optional filtering by multiple column values.',
  })
  @ApiParam({
    name: 'tableName',
    type: 'string',
    description: 'The name of the table to retrieve data from',
  })
  @ApiQuery({
    name: 'filters',
    type: 'string',
    description:
      'Optional filters in a key=value format, separated by commas. Example: item_id=3,player_id=2',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Table data retrieved successfully',
  })
  async getTableValues(
    @Param('tableName') tableName: string,
    @Query('filters') filters?: string,
  ): Promise<any> {
    const queryConditions: string[] = [];
    const queryParams: any[] = [];
    if (filters) {
      const filterPairs = filters.split(',');

      filterPairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key && value) {
          queryConditions.push(`"${key}" = $${queryConditions.length + 1}`);
          queryParams.push(value);
        }
      });
    }

    const whereClause =
      queryConditions.length > 0
        ? `WHERE ${queryConditions.join(' AND ')}`
        : '';
    const query = `SELECT * FROM "${tableName}" ${whereClause};`;

    const result = await this.tableService.executeQuery(query, queryParams);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/jointables')
  @ApiOperation({ summary: 'Joins two tables' })
  @ApiBody({ type: JoinTablesDTO })
  async joinTables(@Body() joinTablesDTO: JoinTablesDTO): Promise<any> {
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

    const result = await this.tableService.executeQuery(
      query,
      joinTablesDTO.filter ? [joinTablesDTO.filter.value] : [],
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/executeselectquery')
  @ApiOperation({ summary: 'Execute a select query' })
  @ApiBody({ type: QueryDTO })
  async executeSelectQuery(@Body() queryDTO: QueryDTO): Promise<any> {
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

    const result = await this.tableService.executeQuery(queryDTO.query, []);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/adminquery')
  @ApiOperation({ summary: 'Execute a admin query' })
  @ApiBody({ type: QueryDTO })
  async adminQuery(@Body() adminQueryDTO: AdminQueryDTO): Promise<any> {
    const result = await this.tableService.executeQuery(
      adminQueryDTO.query,
      adminQueryDTO.values,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/insertdata')
  @ApiOperation({ summary: 'Insert data into a table' })
  @ApiBody({ type: InsertDataDTO })
  async insertData(@Body() insertDataDTO: InsertDataDTO): Promise<any> {
    try {
      const columns = Object.keys(insertDataDTO.data).join(', ');
      const values = Object.values(insertDataDTO.data);
      const valuePlaceholders = values
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const query = `INSERT INTO "${insertDataDTO.tableName}" (${columns}) 
                    VALUES (${valuePlaceholders}) 
                    ON CONFLICT DO NOTHING 
                    RETURNING *;`;

      const result = await this.tableService.executeQuery(query, values);

      if (result.status === 200) {
        if (result.data && result.data.length > 0) {
          return result.data;
        } else {
          return {
            status: 409,
            message: 'Record already exists',
          };
        }
      } else {
        throw new BadRequestException(result.error || 'Insert failed');
      }
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation error code
        throw new BadRequestException(`Duplicate entry: ${error.detail}`);
      }
      throw new BadRequestException(`Insert failed: ${error.message}`);
    }
  }

  @Delete('/deletedata')
  @ApiOperation({ summary: 'Delete data from a table' })
  @ApiBody({ type: DeleteDataDTO })
  async deleteData(@Body() deleteDataDTO: DeleteDataDTO): Promise<any> {
    const query = `DELETE FROM "${deleteDataDTO.tableName}" WHERE ${deleteDataDTO.condition} RETURNING *;`;
    const result = await this.tableService.executeQuery(query);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Put('/updatedata')
  @ApiOperation({ summary: 'Update data in a table' })
  @ApiBody({ type: UpdateDataDTO })
  async updateData(@Body() updateDataDTO: UpdateDataDTO): Promise<any> {
    try {
      const values: any[] = [];

      // Generate the SET part of the SQL query, and populate the values array
      const updates = Object.entries(updateDataDTO.data)
        .filter(([, value]) => value !== undefined) // Just use comma for unused param
        .map(([key, value], index) => {
          // Handle null values and type conversions
          if (value === null || value === '') {
            values.push(null);
          } else if (typeof value === 'string' && !isNaN(Number(value))) {
            // Convert numeric strings to numbers
            values.push(Number(value));
          } else {
            values.push(value);
          }
          return `"${key}" = $${index + 1}`; // Use index for placeholder
        })
        .join(', ');

      if (!updates) {
        throw new BadRequestException('No valid fields to update');
      }

      // Construct the full SQL query
      const query = `
        UPDATE "${updateDataDTO.tableName}" 
        SET ${updates} 
        WHERE ${updateDataDTO.condition} 
        RETURNING *;
      `;

      const result = await this.tableService.executeQuery(query, values);

      if (result.status === 200) {
        if (!result.data || result.data.length === 0) {
          throw new NotFoundException('No records were updated');
        }
        return result.data;
      } else {
        throw new BadRequestException(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(`Update failed: ${error.message}`);
    }
  }

  @Post('/batchupdate')
  @ApiOperation({ summary: 'Batch update multiple records in a table' })
  @ApiBody({ type: BatchUpdateDTO })
  @ApiResponse({
    status: 200,
    description: 'Batch update completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async batchUpdateData(@Body() batchUpdateDTO: BatchUpdateDTO): Promise<any> {
    // Input validation

    if (
      !batchUpdateDTO.tableName ||
      !Array.isArray(batchUpdateDTO.updates) ||
      batchUpdateDTO.updates.length === 0
    ) {
      throw new BadRequestException(
        'Invalid input: updates must be an array of {data, condition} objects',
      );
    }

    try {
      // Start transaction
      await this.tableService.executeQuery('BEGIN');

      const results = [];

      // Process each update
      for (const update of batchUpdateDTO.updates) {
        const { data, condition } = update;

        if (!data || !condition) {
          // Rollback and throw error if update is invalid
          await this.tableService.executeQuery('ROLLBACK');
          throw new BadRequestException(
            'Each update must contain data and condition',
          );
        }

        const values: any[] = [];
        const updates = Object.entries(data)
          .map(([key, value], index) => {
            values.push(value);
            return `"${key}" = $${index + 1}`;
          })
          .join(', ');

        const query = `UPDATE "${batchUpdateDTO.tableName}" SET ${updates} WHERE ${condition} RETURNING *;`;

        const result = await this.tableService.executeQuery(query, values);

        if (result.status !== 200) {
          // Rollback and throw error if query fails
          await this.tableService.executeQuery('ROLLBACK');
          throw new Error(result.error || 'Update failed');
        }

        results.push(result.data);
      }

      // Commit transaction if all updates succeed
      await this.tableService.executeQuery('COMMIT');

      return {
        status: 200,
        message: `Batch update on table ${batchUpdateDTO.tableName} completed successfully`,
        results,
      };
    } catch (error) {
      // Ensure rollback happens on any error
      try {
        await this.tableService.executeQuery('ROLLBACK');
      } catch (rollbackError) {
        // Log rollback error but throw original error
        console.error('Rollback failed:', rollbackError);
      }

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Batch update failed: ${error.message}`);
    }
  }

  @Put('/updatefiltereddata')
  @ApiOperation({ summary: 'Update data in a table with filters' })
  @ApiBody({ type: UpdateFilterDataDTO })
  async updateFilteredData(
    @Body() updateDataDTO: UpdateFilterDataDTO,
  ): Promise<any> {
    const values: any[] = [];
    const queryConditions: string[] = [];

    Object.entries(updateDataDTO.filters).forEach(([key, value]) => {
      queryConditions.push(`"${key}" = $${values.length + 1}`);
      values.push(value);
    });

    const setClauses = Object.entries(updateDataDTO.data)
      .map(([key, value]) => {
        values.push(value);
        return `"${key}" = $${values.length}`;
      })
      .join(', ');

    const whereClause =
      queryConditions.length > 0
        ? `WHERE ${queryConditions.join(' AND ')}`
        : '';
    const query = `UPDATE "${updateDataDTO.tableName}" SET ${setClauses} ${whereClause};`;

    const result = await this.tableService.executeQuery(query, values);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/incrementdata')
  @ApiOperation({ summary: 'Increment data in a table' })
  @ApiBody({ type: IncrementDataDTO })
  async incrementData(
    @Body() incrementDataDTO: IncrementDataDTO,
  ): Promise<any> {
    const query = `UPDATE "${incrementDataDTO.tableName}" SET ${incrementDataDTO.columnName} = ${incrementDataDTO.columnName} + ${incrementDataDTO.value} WHERE ${incrementDataDTO.condition};`;
    const result = await this.tableService.executeQuery(query);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/decrementdata')
  @ApiOperation({ summary: 'Decrement data in a table' })
  @ApiBody({ type: IncrementDataDTO })
  async decrementData(
    @Body() decrementDataDTO: IncrementDataDTO,
  ): Promise<any> {
    const query = `UPDATE "${decrementDataDTO.tableName}" SET ${decrementDataDTO.columnName} = ${decrementDataDTO.columnName} - ${decrementDataDTO.value} WHERE ${decrementDataDTO.condition};`;
    const result = await this.tableService.executeQuery(query);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/defaulttables')
  @ApiOperation({
    summary: 'Get default tables to prevent creating tables with same names',
  })
  async getDefaultDefinedTables(): Promise<any> {
    const result = await this.tableService.executeQuery(
      "SELECT table_name FROM information_schema.tables WHERE table_schema != 'public';",
    );

    const tableNames = result?.data
      ?.filter((item: any) => item.table_schema !== 'public')
      ?.map((item: any) => item.table_name)
      .filter(Boolean);

    if (result.status === 200) {
      return tableNames;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/addtrigger')
  @ApiOperation({ summary: 'Add a trigger to a table' })
  async addTrigger(@Body() triggerDTO: TriggerDTO): Promise<any> {
    if (!/^[A-Za-z0-9_]+$/.test(triggerDTO.tableName)) {
      throw new BadRequestException('Invalid table name');
    }

    if (!/^[A-Za-z0-9_]+$/.test(triggerDTO.triggerName)) {
      throw new BadRequestException('Invalid trigger name');
    }

    if (
      !['INSERT', 'UPDATE', 'DELETE'].includes(triggerDTO.method.toUpperCase())
    ) {
      throw new BadRequestException('Invalid method');
    }

    let createTriggerQuery = `
    CREATE TRIGGER "${triggerDTO.triggerName}"
    AFTER "${triggerDTO.method}" ON "${triggerDTO.tableName}"
    FOR EACH ROW
    EXECUTE FUNCTION notify_event();
`;

    if (triggerDTO.condition) {
      createTriggerQuery = `
      CREATE TRIGGER "${triggerDTO.triggerName}"
          AFTER "${triggerDTO.method}" ON "${triggerDTO.tableName}"
          FOR EACH ROW
          WHEN (${triggerDTO.condition})
          EXECUTE FUNCTION notify_event();
  `;
    }

    const result = await this.tableService.executeQuery(createTriggerQuery);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Delete('/removetrigger')
  @ApiOperation({ summary: 'Remove a trigger from a table' })
  async removeTrigger(
    @Body('shortId') shortId: string,
    @Body('tableName') tableName: string,
  ): Promise<any> {
    // Validate the tableName to ensure it's a valid identifier
    if (!/^[A-Za-z0-9_]+$/.test(shortId)) {
      throw new BadRequestException('Invalid table name');
    }

    // const triggerName = `notify_trigger_${tableName}`;
    const dropTriggerQuery = `
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = '${shortId}') THEN
        EXECUTE format('DROP TRIGGER %I ON %I', '${shortId}', '${tableName}');
      END IF;
    END
    $$;
    `;

    const result = await this.tableService.executeQuery(dropTriggerQuery);
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Get('/getschemas')
  @ApiOperation({ summary: 'Get all schemas' })
  @ApiResponse({ status: 200, description: 'Schemas retrieved successfully' })
  async getSchemas(): Promise<any> {
    const result = await this.tableService.executeQuery(
      `SELECT schema_name FROM information_schema.schemata;`,
    );
    if (result.status === 200) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }

  @Post('/createschema')
  @ApiOperation({ summary: 'Create a new schema' })
  @ApiResponse({ status: 201, description: 'Schema created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSchema(@Body('schemaName') schemaName: string): Promise<any> {
    const query = `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`;
    const result = await this.tableService.executeQuery(query);
    if (result.status === 201) {
      return result.data;
    } else {
      return result.error || result.data;
    }
  }
}
