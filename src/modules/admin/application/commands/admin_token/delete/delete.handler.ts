import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAdminTokenCommand } from './delete.command';
import { AdminTokenRepository } from '../../../../infrastructure/repositories/adminToken.repository';

@CommandHandler(DeleteAdminTokenCommand)
export class DeleteAdminTokenHandler implements ICommandHandler<DeleteAdminTokenCommand> {
  constructor(private readonly adminTokenRepository: AdminTokenRepository) {}

  async execute(command: DeleteAdminTokenCommand): Promise<boolean> {
    return this.adminTokenRepository.delete(command.access_token);
  }
}
