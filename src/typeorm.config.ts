import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Activity } from './activity/entities/activity.entity';
import { User } from './auth/user.entity';
import { ConfigService } from './common/config/config.service';

const configService = new ConfigService();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get('DATABASE_PORT'), 10),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [Activity, User],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  migrationsRun: true,
};

export const AppDataSource = new DataSource(typeOrmConfig as any);
