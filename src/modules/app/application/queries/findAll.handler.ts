import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllAppsQuery } from './findAll.query';
import { AppRepository } from '../../infrastructure/repositories/app.repository';
import { App } from '../../domain/entities/app.entity';

@QueryHandler(FindAllAppsQuery)
export class FindAllAppsHandler implements IQueryHandler<FindAllAppsQuery> {
  constructor(private readonly appRepository: AppRepository) {}

  async execute(): Promise<App[]> {
    return this.appRepository.findAll();
  }
}
