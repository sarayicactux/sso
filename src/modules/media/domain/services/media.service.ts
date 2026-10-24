import { Media } from '../entities/media.entity';
import { UploadMediaInterface } from '../interfaces/UploadMedia.interface';

export interface MediaServiceImpl {
  upload(adminId: number, upload: UploadMediaInterface): Promise<Media | null>;
  deleteMedia(adminId: number, id: number): Promise<boolean>;
}
