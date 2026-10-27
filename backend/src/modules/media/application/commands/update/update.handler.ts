import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateMediaOwnerCommand } from './update.command';
import { MediaRepository } from '../../../infrastructure/repositories/media.repository';

@CommandHandler(UpdateMediaOwnerCommand)
export class UpdateMediaHandler implements ICommandHandler<UpdateMediaOwnerCommand> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(command: UpdateMediaOwnerCommand): Promise<boolean> {
    return this.mediaRepository.updateMediaOwner(
      command.ownerId,
      command.ownerModel,
      command.id,
    );
  }
}
