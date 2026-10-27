import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllUsersWithAppsQuery } from './findAllWithApps.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { UserWithApps } from '../../../domain/repositories/user.repository';

@QueryHandler(FindAllUsersWithAppsQuery)
export class FindAllUsersWithAppsHandler
  implements IQueryHandler<FindAllUsersWithAppsQuery>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(_query: FindAllUsersWithAppsQuery): Promise<UserWithApps[]> {
    return this.userRepository.findAllWithApps();
  }
}
