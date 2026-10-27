import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from './updatePassword.command';
import { UserRepository } from '../../../../infrastructure/repositories/user.repository';

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordHandler
  implements ICommandHandler<UpdateUserPasswordCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserPasswordCommand): Promise<boolean> {
    return this.userRepository.updatePassword(command.password, command.id);
  }
}
