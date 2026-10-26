import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserAppByUserIdAndAppIdQuery } from './findByUserIdAndAppId.query';
import { UserAppRepository } from '../../../infrastructure/repositories/userApp.repository';
import { UserApp } from '../../../domain/entities/userApp.entity';

@QueryHandler(FindUserAppByUserIdAndAppIdQuery)
export class FindUserAppByUserIdAndAppIdHandler
  implements IQueryHandler<FindUserAppByUserIdAndAppIdQuery>
{
  constructor(private readonly userAppRepository: UserAppRepository) {}

  async execute(
    query: FindUserAppByUserIdAndAppIdQuery,
  ): Promise<UserApp | null> {
    return this.userAppRepository.findByUserIdAndAppId(
      query.userId,
      query.appId,
    );
  }
}
