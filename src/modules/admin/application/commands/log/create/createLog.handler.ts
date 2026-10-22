import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLogCommand } from './createLog.command';
import { LogRepository } from '../../../../infrastructure/repositories/log.repository';
import { Log } from '../../../../domain/entities/log.entity';

@CommandHandler(CreateLogCommand)
export class CreateLogCommandHandler implements ICommandHandler<CreateLogCommand> {
  constructor(private readonly logRepository: LogRepository) {}

  async execute(command: CreateLogCommand): Promise<Log> {
    return this.logRepository.create(command.createLog);
  }
}
