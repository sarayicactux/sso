import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteMediaCommand } from './delete.command';
import { MediaRepository } from '../../../infrastructure/repositories/media.repository';

@CommandHandler(DeleteMediaCommand)
export class DeleteMediaHandler implements ICommandHandler<DeleteMediaCommand> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(command: DeleteMediaCommand): Promise<boolean> {
    return this.mediaRepository.delete(command.id);
  }
}
