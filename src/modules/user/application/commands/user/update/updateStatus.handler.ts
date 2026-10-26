import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserStatusCommand } from './updateStatus.command';
import { UserRepository } from '../../../../infrastructure/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserStatusCommand): Promise<User> {
    return this.userRepository.updateStatus(command.data);
  }
}
