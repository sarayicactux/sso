import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AllAdminQuery } from './allAdmin.query';
import { AdminRepository } from '../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../domain/entities/admin.entity';

@QueryHandler(AllAdminQuery)
export class AllAdminHandler implements IQueryHandler<AllAdminQuery> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(query: AllAdminQuery): Promise<Admin[]> {
    return this.adminRepository.findAll(query.page, query.limit);
  }
}
