import { Body, Controller, Delete, Post, Get } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CreateCronDTO, CronApiResponse, DeleteCronDTO } from './dto/db.dto';
import { DBService } from './db.service';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('DB')
@Controller('db')
export class DbController {
  constructor(private readonly dbService: DBService) {}

  @Get('functions')
  async getFunctions(): Promise<any> {
    const query = `SELECT
    n.nspname AS "Schema",
    p.proname AS "Function Name",
    pg_catalog.pg_get_function_result(p.oid) AS "Return Type",
    pg_catalog.pg_get_function_arguments(p.oid) AS "Arguments",
    CASE
        WHEN p.prokind = 'a' THEN 'agg'
        WHEN p.prokind = 'w' THEN 'window'
        WHEN p.prorettype = 'pg_catalog.trigger'::pg_catalog.regtype THEN 'trigger'
        ELSE 'normal'
    END AS "Type"
FROM
    pg_catalog.pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE
    pg_catalog.pg_function_is_visible(p.oid)
    AND n.nspname = 'public'  -- Filter for the public schema
ORDER BY
    "Function Name";`;
    const result = await this.dbService.executeQuery(query);
    return result.data;
  }

  @Post('cron')
  async cron(@Body() createCronDTO: CreateCronDTO): Promise<CronApiResponse> {
    const query = `SELECT cron.schedule('${createCronDTO.schedule}', $$SELECT ${createCronDTO.function}()$$);`;
    const result = await this.dbService.executeQuery(query);
    return {
      status: 200,
      id: result.data[0].schedule,
      message: `Successfully scheduled ${createCronDTO.schedule} with schedule ${createCronDTO.function}`,
    };
  }

  @Delete('cron')
  async deleteCron(
    @Body() deleteCronDTO: DeleteCronDTO,
  ): Promise<CronApiResponse> {
    const query = `SELECT cron.unschedule(${deleteCronDTO.cron_id});`;
    const result = await this.dbService.executeQuery(query);
    console.log(result);
    return {
      status: 200,
      message: `Successfully unscheduled ${deleteCronDTO.cron_id}`,
    };
  }
}
