import { MimeType } from '../enums/mimeType.enum';
export interface MediaInterface {
  id: number;
  mediaUrl: string;
  ownerId?: number;
  ownerModel?: string;
  mimeType: MimeType;
}
