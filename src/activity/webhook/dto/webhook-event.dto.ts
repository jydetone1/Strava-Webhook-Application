import { IsString, IsNumber, IsObject, IsIn } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  @IsIn(['activity', 'athlete'])
  object_type: string;

  @IsNumber()
  object_id: number;

  @IsString()
  @IsIn(['create', 'update', 'delete'])
  aspect_type: string;

  @IsObject()
  updates: Record<string, any>;

  @IsNumber()
  owner_id: number;

  @IsNumber()
  subscription_id: number;

  @IsNumber()
  event_time: number;
}
