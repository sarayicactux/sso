import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAppUserByUserIdAndAppIdQuery } from './findByUserIdAndAppId.query';
import { AppUserRepository } from '../../../infrastructure/repositories/appUser.repository';
import { AppUser } from '../../../domain/entities/appUser';

@QueryHandler(FindAppUserByUserIdAndAppIdQuery)
export class FindAppUserByUserIdAndAppIdHandler
  implements IQueryHandler<FindAppUserByUserIdAndAppIdQuery>
{
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async execute(
    query: FindAppUserByUserIdAndAppIdQuery,
  ): Promise<AppUser | null> {
    return this.appUserRepository.findByUserIdAndAppId(
      query.userId,
      query.appId,
    );
  }
}
