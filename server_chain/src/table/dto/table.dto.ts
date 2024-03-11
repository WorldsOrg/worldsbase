import { IsString, IsArray } from 'class-validator';
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
