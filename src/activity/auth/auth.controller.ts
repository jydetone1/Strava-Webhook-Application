import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '../common/config/config.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('login')
  login(@Res() res: Response) {
    const clientId = this.configService.get('STRAVA_CLIENT_ID');
    const redirectUri = this.configService.get('STRAVA_REDIRECT_URI');
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=activity:read_all`;
    res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokens = await this.authService.getAccessToken(code);
    return { message: 'Authorization successful', tokens };
  }
}
