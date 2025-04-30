import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WebhookModule } from './webhook/webhook.module';
import { ActivityModule } from './activity/activity.module';
import { ConfigModule } from './common/config/config.module';
import { typeOrmConfig } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule,
    AuthModule,
    WebhookModule,
    ActivityModule,
  ],
})
export class AppModule {}
