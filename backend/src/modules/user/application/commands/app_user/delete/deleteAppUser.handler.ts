import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAppUserCommand } from './deleteAppUser.command';
import { AppUserRepository } from '../../../../infrastructure/repositories/appUser.repository';

@CommandHandler(DeleteAppUserCommand)
export class DeleteAppUserHandler
  implements ICommandHandler<DeleteAppUserCommand>
{
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async execute(command: DeleteAppUserCommand): Promise<boolean> {
    return this.appUserRepository.deleteByUserIdAndAppId(
      command.userId,
      command.appId,
    );
  }
}
