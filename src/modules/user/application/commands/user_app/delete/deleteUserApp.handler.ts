import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserAppCommand } from './deleteUserApp.command';
import { UserAppRepository } from '../../../../infrastructure/repositories/userApp.repository';

@CommandHandler(DeleteUserAppCommand)
export class DeleteUserAppHandler
  implements ICommandHandler<DeleteUserAppCommand>
{
  constructor(private readonly userAppRepository: UserAppRepository) {}

  async execute(command: DeleteUserAppCommand): Promise<boolean> {
    return this.userAppRepository.delete(command.userId, command.appId);
  }
}
