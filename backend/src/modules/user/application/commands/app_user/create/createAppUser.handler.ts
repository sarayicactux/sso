import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAppUserCommand } from './createAppUser.command';
import { AppUserRepository } from '../../../../infrastructure/repositories/appUser.repository';
import { AppUser } from '../../../../domain/entities/appUser';

@CommandHandler(CreateAppUserCommand)
export class CreateAppUserHandler
  implements ICommandHandler<CreateAppUserCommand>
{
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async execute(command: CreateAppUserCommand): Promise<AppUser> {
    return this.appUserRepository.create(command.data);
  }
}
