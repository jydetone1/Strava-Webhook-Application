import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '../common/config/config.service';
import { ActivityService } from '../activity/activity.service';
import axios from 'axios';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Injectable()
export class WebhookService {
  constructor(
    private configService: ConfigService,
    private activityService: ActivityService,
  ) {}

  async createSubscription(): Promise<any> {
    const url = this.configService.get('STRAVA_SUBSCRIPTIONS');
    const payload = {
      client_id: this.configService.get('STRAVA_CLIENT_ID'),
      client_secret: this.configService.get('STRAVA_CLIENT_SECRET'),
      callback_url: this.configService.get('CALLBACK_URL'),
      verify_token: this.configService.get('STRAVA_VERIFY_TOKEN'),
    };

    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to create subscription: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  validateWebhook(query: any): { 'hub.challenge': string } {
    const verifyToken = this.configService.get('STRAVA_VERIFY_TOKEN');

    if (!verifyToken) {
      throw new Error('STRAVA_VERIFY_TOKEN is not defined!');
    }

    if (
      query['hub.mode'] === 'subscribe' &&
      query['hub.verify_token'] === verifyToken
    ) {
      return { 'hub.challenge': query['hub.challenge'] };
    }

    throw new HttpException('Invalid webhook validation', HttpStatus.FORBIDDEN);
  }
  async handleWebhookEvent(event: WebhookEventDto): Promise<void> {
    if (event.object_type !== 'activity' || event.aspect_type !== 'create') {
      throw new HttpException('Invalid webhook event', HttpStatus.BAD_REQUEST);
    }
    await this.activityService.processActivity(event);
  }
}
