import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAppsByUserIdQuery } from './findAppsByUserId.query';
import { UserAppRepository } from '../../../infrastructure/repositories/userApp.repository';
import { App } from '../../../../app/domain/entities/app.entity';

@QueryHandler(FindAppsByUserIdQuery)
export class FindAppsByUserIdHandler
  implements IQueryHandler<FindAppsByUserIdQuery>
{
  constructor(private readonly userAppRepository: UserAppRepository) {}

  async execute(query: FindAppsByUserIdQuery): Promise<App[]> {
    return this.userAppRepository.findAppsByUserId(query.userId);
  }
}
