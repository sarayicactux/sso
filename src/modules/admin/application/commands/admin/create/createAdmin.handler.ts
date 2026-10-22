import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAdminCommand } from './createAdmin.command';
import { AdminRepository } from '../../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../../domain/entities/admin.entity';

@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(command: CreateAdminCommand): Promise<Admin> {
    return this.adminRepository.create(command.createAdminDto);
  }
}
