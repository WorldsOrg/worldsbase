import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCronDTO, CronApiResponse } from './dto/db.dto';

type ScheduleKey =
  | 'every minute'
  | 'every 10 minutes'
  | 'every 30 minutes'
  | 'every hour'
  | 'every 4 hours'
  | 'every 6 hours'
  | 'every 12 hours'
  | 'every day'
  | 'every week'
  | 'every month'
  | 'every year';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('DB')
@Controller('db')
export class DbController {
  scheduleMapping: { [key in ScheduleKey]: string } = {
    'every minute': '* * * * *',
    'every 10 minutes': '*/10 * * * *',
    'every 30 minutes': '*/30 * * * *',
    'every hour': '0 * * * *',
    'every 4 hours': '0 */4 * * *',
    'every 6 hours': '0 */6 * * *',
    'every 12 hours': '0 */12 * * *',
    'every day': '0 0 * * *',
    'every week': '0 0 * * 0',
    'every month': '0 0 1 * *',
    'every year': '0 0 1 1 *',
  };

  translateScheduleToCron(schedule: ScheduleKey): string {
    return this.scheduleMapping[schedule];
  }

  @Post('cron')
  async cron(
    @Body() createCronDTO: CreateCronDTO,
  ): Promise<CronApiResponse<any>> {
    // const cronExpression = this.translateScheduleToCron(
    //   createCronDTO.cronExpression,
    // );
    const cronExpression = createCronDTO.cronExpression;
    const functionName = createCronDTO.cronFunction;

    // Here you would actually call `pg_cron` or equivalent functionality
    // // For demonstration, we just simulate the call:
    // console.log(
    //   `Scheduling: CALL ${functionName}() with schedule ${cronExpression}`,
    // );

    // Simulate successful scheduling
    return {
      status: 200,
      data: `Successfully scheduled ${functionName} with schedule ${cronExpression}`,
    };
  }
}
