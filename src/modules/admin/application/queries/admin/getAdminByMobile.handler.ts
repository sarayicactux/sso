import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAdminByMobileQuery } from './GetAdminByMobile.query';
import { AdminRepository } from '../../../infrastructure/repositories/admin.repository';
import { Admin } from '../../../domain/entities/admin.entity';

@QueryHandler(GetAdminByMobileQuery)
export class GetAdminByMobileHandler implements IQueryHandler<GetAdminByMobileQuery> {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(query: GetAdminByMobileQuery): Promise<Admin | null> {
    return this.adminRepository.findByMobile(query.mobile);
  }
}
