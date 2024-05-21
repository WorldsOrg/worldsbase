import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCronDTO, CronApiResponse } from './dto/db.dto';
import { DBService } from './db.service';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('DB')
@Controller('db')
export class DbController {
  constructor(private readonly dbService: DBService) {}

  @Post('cron')
  async cron(
    @Body() createCronDTO: CreateCronDTO,
  ): Promise<CronApiResponse<any>> {
    const query = `SELECT cron.schedule('${createCronDTO.schedule}', $$CALL ${createCronDTO.function}()$$);`;
    const result = await this.dbService.executeQuery(query);
    console.log(result);
    return {
      status: 200,
      data: `Successfully scheduled ${createCronDTO.schedule} with schedule ${createCronDTO.function}`,
    };
  }

  @Delete('cron')
  async deleteCron(
    @Body() createCronDTO: CreateCronDTO,
  ): Promise<CronApiResponse<any>> {
    const query = `SELECT cron.unschedule('${createCronDTO.schedule}', $$CALL ${createCronDTO.function}()$$);`;
    const result = await this.dbService.executeQuery(query);
    console.log(result);
    return {
      status: 200,
      data: `Successfully unscheduled ${createCronDTO.schedule} with schedule ${createCronDTO.function}`,
    };
  }
}
