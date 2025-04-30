import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '../common/config/config.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  login(@Res() res: Response) {
    const authUrl = this.authService.getAuthorizationUrl();
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokens = await this.authService.getAccessToken(code);
    return { message: 'Authorization successful', tokens };
  }
}
