import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityRepository } from './activity.repository';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './common/config/config.module';
@Module({
  imports: [TypeOrmModule.forFeature([Activity]), AuthModule, ConfigModule],
  providers: [ActivityService, ActivityRepository],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
