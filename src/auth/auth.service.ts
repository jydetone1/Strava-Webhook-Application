import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../common/config/config.service';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number };
  }> {
    const url = this.configService.get('STRAVA_AUTH_TOKEN_BASE');
    const payload = {
      client_id: this.configService.get('STRAVA_CLIENT_ID'),
      client_secret: this.configService.get('STRAVA_CLIENT_SECRET'),
      code,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.post(url, payload);
      const { access_token, refresh_token, expires_at, athlete } =
        response.data;

      let user = await this.userRepository.findByStravaAthleteId(athlete.id);
      if (!user) {
        user = new User();
        user.stravaAthleteId = athlete.id;
      }
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.tokenExpiresAt = new Date(expires_at * 1000);
      await this.userRepository.save(user);

      return { access_token, refresh_token, expires_at, athlete };
    } catch (error) {
      throw new HttpException(
        `Failed to get access token: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getStoredAccessToken(stravaAthleteId: number): Promise<string> {
    const user =
      await this.userRepository.findByStravaAthleteId(stravaAthleteId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.tokenExpiresAt < new Date()) {
      const tokens = await this.refreshAccessToken(user.refreshToken);
      user.accessToken = tokens.access_token;
      user.refreshToken = tokens.refresh_token;
      user.tokenExpiresAt = new Date(tokens.expires_at * 1000);
      await this.userRepository.save(user);
    }

    return user.accessToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }> {
    const url = this.configService.get('STRAVA_AUTH_TOKEN_BASE');
    const payload = {
      client_id: this.configService.get('STRAVA_CLIENT_ID'),
      client_secret: this.configService.get('STRAVA_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    try {
      const response = await axios.post(url, payload);
      const { access_token, refresh_token, expires_at } = response.data;

      const user = await this.userRepository.findByRefreshToken(refreshToken);
      if (user) {
        user.accessToken = access_token;
        user.refreshToken = refresh_token;
        user.tokenExpiresAt = new Date(expires_at * 1000);
        await this.userRepository.save(user);
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to refresh access token: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getAuthorizationUrl(): string {
    const clientId = this.configService.get('STRAVA_CLIENT_ID');
    const redirectUri = this.configService.get('STRAVA_REDIRECT_URI');
    const authBase = this.configService.get('STRAVA_AUTH_BASE');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'activity:read_all',
    });
    return `${authBase}/authorize?${params.toString()}`;
  }
}
