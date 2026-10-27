import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindUserTokenByPublicKeyQuery } from './findByPublicKey.query';
import { UserTokenRepository } from '../../../infrastructure/repositories/userToken.repository';
import { UserToken } from '../../../domain/entities/userToken.entity';

@QueryHandler(FindUserTokenByPublicKeyQuery)
export class FindUserTokenByPublicKeyHandler
  implements IQueryHandler<FindUserTokenByPublicKeyQuery>
{
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(
    query: FindUserTokenByPublicKeyQuery,
  ): Promise<UserToken | null> {
    return this.userTokenRepository.findByPublicKey(query.publicKey);
  }
}