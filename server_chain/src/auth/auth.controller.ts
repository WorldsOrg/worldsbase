import {
  Controller,
  Get,
  Post,
  HttpStatus,
  HttpException,
  Body,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, Me } from './entities/auth.entity';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiHeader({
    name: 'authorization',
    required: true,
    example: 'Bearer token',
    description: 'Bearer token',
  })
  @ApiResponse({
    status: 200,
    description: 'User payload',
    type: Me,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiOperation({ summary: 'Returns users information generated from JWT' })
  @Get('/me')
  getMe(@Headers() header: any): Promise<Me> {
    const authHeader = header.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      throw new HttpException('Token unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.verifyToken(token);
  }

  @ApiResponse({
    status: 200,
    description: 'JWT',
    type: Auth,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 404,
    description: 'No user found with this email',
  })
  @ApiOperation({ summary: 'Login function returns JWT' })
  @Post('/login')
  login(@Body() loginDTO: AuthDTO): Promise<Auth> {
    return this.authService.login(loginDTO.email, loginDTO.password);
  }

  @ApiResponse({
    status: 200,
    description: 'JWT',
    type: Auth,
  })
  @ApiResponse({
    status: 401,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Server error',
  })
  @ApiOperation({ summary: 'Creates user and returns JWT' })
  @Post('/signup')
  signup(@Body() signupDTO: AuthDTO): Promise<Auth> {
    return this.authService.signup(signupDTO.email, signupDTO.password);
  }
}
