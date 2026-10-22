import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByMobileQuery } from './getUserByMobile.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/admin.entity';

@QueryHandler(GetUserByMobileQuery)
export class GetUserByMobileHandler implements IQueryHandler<GetUserByMobileQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByMobileQuery): Promise<User | null> {
    return this.userRepository.findByMobile(query.mobile);
  }
}
