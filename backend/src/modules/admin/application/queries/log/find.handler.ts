import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindLogQuery } from './find.query';
import { Log } from '../../../domain/entities/log.entity';
import { LogRepository } from '../../../infrastructure/repositories/log.repository';

@QueryHandler(FindLogQuery)
export class GetLogHandler implements IQueryHandler<FindLogQuery> {
  constructor(private readonly logRepository: LogRepository) {}

  async execute(query: FindLogQuery): Promise<Log[] | []> {
    return this.logRepository.find(query.find);
  }
}
