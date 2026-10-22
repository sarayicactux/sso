import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAdminByEmailQuery } from './GetAdminByEmail.query';
import { AdminRepository } from '../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../domain/entities/admin.entity';

@QueryHandler(GetAdminByEmailQuery)
export class GetAdminByEmailHandler implements IQueryHandler<GetAdminByEmailQuery> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(query: GetAdminByEmailQuery): Promise<Admin | null> {
    return this.adminRepository.findByEmail(query.email);
  }
}
