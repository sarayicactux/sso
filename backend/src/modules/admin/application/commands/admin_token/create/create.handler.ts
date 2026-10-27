import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAdminTokenCommand } from './create.command';
import { AdminTokenRepository } from '../../../../infrastructure/repositories/adminToken.repository';
import { AdminToken } from '../../../../domain/entities/adminToken.entity';

@CommandHandler(CreateAdminTokenCommand)
export class CreateAdminTokenHandler implements ICommandHandler<CreateAdminTokenCommand> {
  constructor(private readonly adminTokenRepository: AdminTokenRepository) {}

  async execute(command: CreateAdminTokenCommand): Promise<AdminToken> {
    return this.adminTokenRepository.create(command.createAdminToken);
  }
}
