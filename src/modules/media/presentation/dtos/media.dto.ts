import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UploadMediaInterface } from '../../domain/interfaces/UploadMedia.interface';
import { MediaInterface } from '../../domain/interfaces/Media.interface';
import { CreateMediaInterface } from '../../domain/interfaces/CreateMedia.interface';
import { MimeType } from '../../domain/enums/mimeType.enum';

export class UploadMediaDto implements UploadMediaInterface {
  @ApiProperty()
  @IsNotEmpty()
  dist: string;

  @ApiProperty({ required: true })
  fileName: string;
}
export class CreateMediaDTO implements CreateMediaInterface {
  @ApiProperty()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MimeType)
  mimeType: MimeType;

  @ApiProperty({ required: false })
  @IsOptional()
  ownerId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  ownerModel: string;
}

export class MediaDto implements MediaInterface {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  mediaUrl: string;

  @IsOptional()
  @ApiProperty({ type: Number, required: false })
  ownerId: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  ownerModel;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  mimeType;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(data: {
    id: number;
    mediaUrl: string;
    ownerId?: number;
    ownerModel?: string;
    mimeType: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.mediaUrl = data.mediaUrl;
    this.ownerId = data.ownerId;
    this.ownerModel = data.ownerModel;
    this.mimeType = data.mimeType;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
