import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAdminQuery } from './getAdmin.query';
import { AdminRepository } from '../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../domain/entities/admin.entity';

@QueryHandler(GetAdminQuery)
export class GetAdminQueryHandler implements IQueryHandler<GetAdminQuery> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(query: GetAdminQuery): Promise<Admin | null> {
    return this.adminRepository.findById(query.id);
  }
}
