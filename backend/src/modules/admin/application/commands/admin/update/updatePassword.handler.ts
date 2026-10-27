import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePasswordCommand } from './updatePassword.command';
import { AdminRepository } from '../../../../infrastructure/repositories/admin.repository';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordHandler implements ICommandHandler<UpdatePasswordCommand> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(command: UpdatePasswordCommand): Promise<boolean> {
    return this.adminRepository.updatePassword(command.password, command.id);
  }
}
