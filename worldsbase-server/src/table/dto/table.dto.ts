import {
  IsString,
  IsArray,
  IsObject,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTableDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  readonly tableName: string;
  @ApiProperty({
    example: [
      {
        name: 'id',
        type: 'serial',
        constraints: 'PRIMARY KEY',
      },
      {
        name: 'email',
        type: 'TEXT',
      },
      {
        name: 'password',
        type: 'TEXT',
      },
    ],
    description: 'Columns',
  })
  @IsArray()
  readonly columns: any[];
  @IsString()
  readonly schemaName: string;
}

export class DeleteTableColumnDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  readonly tableName: string;
  @ApiProperty({
    example: 'email',
    description: 'Column Name',
  })
  @IsString()
  readonly columnName: string;
}

export class UpdateTableNameDTO {
  @ApiProperty({
    example: 'users',
    description: 'Old Table Name',
  })
  @IsString()
  readonly oldTableName: string;
  @ApiProperty({
    example: 'players',
    description: 'New Table Name',
  })
  @IsString()
  readonly newTableName: string;
}

export class DeleteTableDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
}

export class AddColumnDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  readonly tableName: string;
  @ApiProperty({
    example: 'username',
    description: 'Column Name',
  })
  @IsString()
  readonly columnName: string;
  @ApiProperty({
    example: 'TEXT',
    description: 'Column Type',
  })
  @IsString()
  readonly columnType: string;
}

export class RenameColumnDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  readonly tableName: string;
  @ApiProperty({
    example: 'username',
    description: 'Old Column Name',
  })
  @IsString()
  readonly oldColumnName: string;
  @ApiProperty({
    example: 'user_name',
    description: 'New Column Name',
  })
  @IsString()
  readonly newColumnName: string;
}

export class TableNameDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
}

export class SchemaDTO {
  @ApiProperty()
  @IsString()
  readonly schema: string;
}

export class GetTableNameDTO {
  @ApiProperty()
  @IsString()
  tableName: string;
  @ApiProperty()
  @IsString()
  columnName: string;
  @ApiProperty()
  @IsString()
  columnValue: string;
}

export class JoinTablesDTO {
  @ApiProperty({
    example: ['table1', 'table2'],
    description: 'Tables to join',
  })
  @IsArray()
  tables: string[];
  @ApiProperty({
    example: ['column1', 'column2'],
    description: 'Columns to join',
  })
  @IsArray()
  joinColumns: string[];
  @ApiProperty({
    example: 'INNER',
    description: 'Join Type',
  })
  @IsString()
  joinType: string;
  @ApiProperty({
    example: {
      column: 'table1.someColumn',
      value: 'someValue',
    },
    description: 'Filter',
  })
  @IsObject()
  filter: {
    column: string;
    value: string;
  };
}

export class QueryDTO {
  @ApiProperty({
    example: 'SELECT * FROM users',
    description: 'SQL Query',
  })
  @IsString()
  query: string;
}

export class InsertDataDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: {
      email: 'test@user.com',
      username: 'testuser',
    },
  })
  @IsObject()
  data: any;
}

export class DeleteDataDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: 'user_id=1',
    description: 'Condition',
  })
  @IsString()
  condition: string;
}

export class UpdateDataDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: 'username=testuser',
    description: 'Condition',
  })
  @IsString()
  condition: string;
  @ApiProperty({
    example: {
      email: 'test@user.com',
      username: 'testuser',
    },
  })
  @IsObject()
  data: any;
}

export class UpdateFilterDataDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: {
      email: 'test@user.com',
      username: 'testuser',
    },
  })
  @IsObject()
  data: any;
  @ApiProperty({
    example: 'username=testuser',
    description: 'Condition',
  })
  @IsObject()
  filters: Record<string, any>;
}

export class TableApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
}

export class IncrementDataDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: 'user_id=1',
    description: 'Condition',
  })
  @IsString()
  condition: string;
  @ApiProperty({
    example: 'points',
    description: 'Column Name',
  })
  @IsString()
  columnName: string;
  @ApiProperty({
    example: 10,
    description: 'Value to increment',
  })
  @IsNumber()
  value: number;
}

export class TriggerDTO {
  @ApiProperty({
    example: 'users',
    description: 'Table Name',
  })
  @IsString()
  tableName: string;
  @ApiProperty({
    example: 'notify_event',
    description: 'Trigger Name',
  })
  @IsString()
  triggerName: string;
  @ApiProperty({
    example: 'INSERT',
    description: 'Trigger Method',
  })
  @IsString()
  method: string;
  @ApiProperty({
    example: "NEW.twitter_added = ''true''",
    description: 'Trigger Condition',
  })
  @IsOptional()
  @IsString({ each: true })
  condition: string | null;
}
