import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAdminByUsernameQuery } from './getAdminByUsername.query';
import { AdminRepository } from '../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../domain/entities/admin.entity';

@QueryHandler(GetAdminByUsernameQuery)
export class GetAdminByUsernameHandler implements IQueryHandler<GetAdminByUsernameQuery> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(query: GetAdminByUsernameQuery): Promise<Admin | null> {
    return this.adminRepository.findByUsername(query.username);
  }
}
