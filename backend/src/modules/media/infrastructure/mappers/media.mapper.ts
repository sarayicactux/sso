import { MediaDto } from '../../presentation/dtos/media.dto';

export class MediaMapper {
  mediaObject(media): MediaDto {
    return new MediaDto({
      id: media.id,
      mediaUrl: media.mediaUrl,
      ownerId: media.ownerId,
      ownerModel: media.ownerModel,
      mimeType: media.mimeType,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    });
  }
}
