import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserTokenByAccessTokenQuery } from './findByAccessToken.query';
import { UserTokenRepository } from '../../../infrastructure/repositories/userToken.repository';
import { UserToken } from '../../../domain/entities/userToken.entity';

@QueryHandler(FindUserTokenByAccessTokenQuery)
export class FindUserTokenByAccessTokenHandler
  implements IQueryHandler<FindUserTokenByAccessTokenQuery>
{
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(
    query: FindUserTokenByAccessTokenQuery,
  ): Promise<UserToken | null> {
    return this.userTokenRepository.findByAccessToken(query.access_token);
  }
}
