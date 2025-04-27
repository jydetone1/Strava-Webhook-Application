import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ActivityModule } from '../../activity/activity.module';
import { ConfigModule } from '../common/config/config.module';

@Module({
  imports: [ActivityModule, ConfigModule],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}
