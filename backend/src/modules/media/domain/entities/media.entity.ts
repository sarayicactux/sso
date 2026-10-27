import { MimeType } from '../enums/mimeType.enum';
export class Media {
  readonly id: number;
  mediaUrl: string;
  ownerId?: number;
  ownerModel?: string;
  mimeType: MimeType;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    mediaUrl: string;
    ownerId?: number;
    ownerModel?: string;
    mimeType: MimeType;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.mediaUrl = data.mediaUrl;
    this.ownerId = data.ownerId;
    this.ownerModel = data.ownerModel;
    this.mimeType = data.mimeType;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
