import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CreateLogEvent } from './createLog.event';
import { LogRepository } from '../../../infrastructure/repositories/log.repository';

@EventsHandler(CreateLogEvent)
export class CreateLogHandler implements IEventHandler<CreateLogEvent> {
  constructor(private readonly logRepository: LogRepository) {}

  async handle(event: CreateLogEvent) {
    return this.logRepository.create(event.createLog);
  }
}
