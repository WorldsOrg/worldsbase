import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckStatus } from './app.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Checks server status' })
  @ApiResponse({
    status: 200,
    description: 'Server status is OK!',
    type: CheckStatus,
  })
  @ApiResponse({
    status: 403,
    description: 'Missing or wrong API key',
  })
  @ApiResponse({
    status: 500,
    description: 'Server error',
  })
  @Get()
  getHello(): CheckStatus {
    return this.appService.getCheck();
  }
}
