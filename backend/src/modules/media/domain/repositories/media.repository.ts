import { CreateMediaInterface } from '../interfaces/CreateMedia.interface';
import { Media } from '../entities/media.entity';

export interface MediaRepositoryImpl {
  findById(id: number): Promise<Media | null>;
  create(media: CreateMediaInterface): Promise<Media>;
  updateMediaOwner(
    ownerId: number,
    ownerModel: string,
    id: number,
  ): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}
