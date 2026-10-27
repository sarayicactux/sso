import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAppByIdQuery } from './findById.query';
import { AppRepository } from '../../infrastructure/repositories/app.repository';
import { App } from '../../domain/entities/app.entity';

@QueryHandler(FindAppByIdQuery)
export class FindAppByIdHandler implements IQueryHandler<FindAppByIdQuery> {
  constructor(private readonly appRepository: AppRepository) {}

  async execute(query: FindAppByIdQuery): Promise<App | null> {
    return this.appRepository.findById(query.id);
  }
}
