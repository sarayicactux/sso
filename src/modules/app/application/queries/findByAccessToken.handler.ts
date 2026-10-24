import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAppByAccessTokenQuery } from './findByAccessToken.query';
import { AppRepository } from '../../infrastructure/repositories/app.repository';
import { App } from '../../domain/entities/app.entity';

@QueryHandler(FindAppByAccessTokenQuery)
export class FindAppByAccessTokenHandler
  implements IQueryHandler<FindAppByAccessTokenQuery>
{
  constructor(private readonly appRepository: AppRepository) {}

  async execute(query: FindAppByAccessTokenQuery): Promise<App | null> {
    return this.appRepository.findByAccessToken(query.accessToken);
  }
}
