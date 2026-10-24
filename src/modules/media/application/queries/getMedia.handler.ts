import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMediaQuery } from './getMedia.query';
import { MediaRepository } from '../../infrastructure/repositories/media.repository';
import { Media } from '../../domain/entities/media.entity';

@QueryHandler(GetMediaQuery)
export class GetMediaQueryHandler implements IQueryHandler<GetMediaQuery> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(query: GetMediaQuery): Promise<Media | null> {
    return this.mediaRepository.findById(query.id);
  }
}
