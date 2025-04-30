import { Controller, Get, Post, Query, Body, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookEventDto } from './dto/webhook-event.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Get()
  validate(@Query() query: any) {
    return this.webhookService.validateWebhook(query);
  }

  @Post()
  async handleEvent(@Body() event: WebhookEventDto) {
    await this.webhookService.handleWebhookEvent(event);
    return { status: HttpStatus.OK, message: 'Event received' };
  }

  @Post('subscribe')
  async subscribe() {
    const subscription = await this.webhookService.createSubscription();
    return { message: 'Subscription created', subscription };
  }
}
