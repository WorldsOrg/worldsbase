import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCronDTO {
  @ApiProperty({
    example: '0 0 * * *',
    description: 'Cron Expression',
  })
  @IsString()
  readonly schedule: string;
  @ApiProperty({
    example: 'update_table()',
    description: 'Function to be executed by cron job',
  })
  @IsString()
  readonly function: string;
}

export class DeleteCronDTO {
  @ApiProperty({
    example: '1',
    description: 'Cron Id',
  })
  @IsString()
  readonly cron_id: string;
}

export class CronApiResponse {
  status: number;
  error?: string;
  message?: string;
  id?: string;
}
