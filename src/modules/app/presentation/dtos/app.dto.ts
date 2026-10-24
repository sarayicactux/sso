import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreateAppInterface } from '../../domain/interfaces/app/CreateApp.interface';
import { UpdateAppInterface } from '../../domain/interfaces/app/UpdateApp.interface';
import { App } from '../../domain/entities/app.entity';
import { MediaInterface } from '../../../media/domain/interfaces/Media.interface';

export class CreateAppDto implements CreateAppInterface {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  url: string;

  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  mediaId?: number;
}

export class UpdateAppDto implements UpdateAppInterface {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  url: string;

  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  mediaId?: number;
}

export class UpdateAppStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  status: boolean;
}

export class UpdateAppActiveSessionDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  activeSession: boolean;
}

export class AppDto implements Partial<App> {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  description: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  url: string;

  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  mediaId?: number;

  @ApiProperty()
  @IsOptional()
  Media?: MediaInterface;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  adminId: number;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  status: boolean;

  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  activeSession: boolean;

  @IsOptional()
  @ApiProperty({ type: String })
  accessToken?: string;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(data: {
    id?: number;
    title: string;
    description: string;
    url: string;
    mediaId?: number;
    Media?: MediaInterface;
    adminId: number;
    status: boolean;
    activeSession: boolean;
    accessToken: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.mediaId = data.mediaId;
    this.Media = data.Media;
    this.adminId = data.adminId;
    this.status = data.status;
    this.activeSession = data.activeSession;
    this.accessToken = data.accessToken;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
