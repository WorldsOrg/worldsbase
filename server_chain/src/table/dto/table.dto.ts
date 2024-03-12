import { IsString, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTableDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
  @ApiProperty()
  @IsArray()
  readonly columns: any[];
}

export class DeleteTableColumnDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
  @ApiProperty()
  @IsString()
  readonly columnName: string;
}

export class UpdateTableNameDTO {
  @ApiProperty()
  @IsString()
  readonly oldTableName: string;
  @ApiProperty()
  @IsString()
  readonly newTableName: string;
}

export class DeleteTableDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
}

export class AddColumnDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
  @ApiProperty()
  @IsString()
  readonly columnName: string;
  @ApiProperty()
  @IsString()
  readonly columnType: string;
}

export class RenameColumnDTO {
  @ApiProperty()
  @IsString()
  readonly tableName: string;
  @ApiProperty()
  @IsString()
  readonly oldColumnName: string;
  @ApiProperty()
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
  @ApiProperty()
  @IsArray()
  tables: string[];
  @ApiProperty()
  @IsArray()
  joinColumns: string[];
  @ApiProperty()
  @IsString()
  joinType: string;
  @ApiProperty()
  @IsObject()
  filter: {
    column: string;
    value: string;
  };
}

export class QueryDTO {
  @ApiProperty()
  @IsString()
  query: string;
}

export class InsertDataDTO {
  @ApiProperty()
  @IsString()
  tableName: string;
  @ApiProperty()
  @IsObject()
  data: any;
}

export class DeleteDataDTO {
  @ApiProperty()
  @IsString()
  tableName: string;
  @ApiProperty()
  @IsString()
  condition: string;
}

export class UpdateDataDTO {
  @ApiProperty()
  @IsString()
  tableName: string;
  @ApiProperty()
  @IsString()
  condition: string;
  @ApiProperty()
  @IsObject()
  data: any;
}

export class TableApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
}
