import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCronDTO {
  @ApiProperty({
    example: '0 0 * * *',
    description: 'Cron Expression',
  })
  @IsString()
  readonly cronExpression: string;
  @ApiProperty({
    example: 'update_table()',
    description: 'Function to be executed by cron job',
  })
  @IsString()
  readonly cronFunction: string;
}

export class CronApiResponse<T> {
  status: number;
  data?: T;
  error?: string;
}
