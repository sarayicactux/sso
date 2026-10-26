import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserAppCommand } from './createUserApp.command';
import { UserAppRepository } from '../../../../infrastructure/repositories/userApp.repository';
import { UserApp } from '../../../../domain/entities/userApp.entity';

@CommandHandler(CreateUserAppCommand)
export class CreateUserAppHandler
  implements ICommandHandler<CreateUserAppCommand>
{
  constructor(private readonly userAppRepository: UserAppRepository) {}

  async execute(command: CreateUserAppCommand): Promise<UserApp> {
    return this.userAppRepository.create(command.data);
  }
}
