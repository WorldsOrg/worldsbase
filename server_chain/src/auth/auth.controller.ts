import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('/me')
  getMe(): Promise<string> {
    return this.authService.getMe();
  }

  @Post('/login')
  login(): Promise<string> {
    return this.authService.login();
  }

  @Post('/signup')
  signup(): Promise<string> {
    return this.authService.signup();
  }
}
