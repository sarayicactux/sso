import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateMediaCommand } from './media.command';
import { MediaRepository } from '../../../infrastructure/repositories/media.repository';
import { Media } from '../../../domain/entities/media.entity';

@CommandHandler(CreateMediaCommand)
export class CreateMediaHandler implements ICommandHandler<CreateMediaCommand> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(command: CreateMediaCommand): Promise<Media> {
    return this.mediaRepository.create(command.createMediaDTO);
  }
}
