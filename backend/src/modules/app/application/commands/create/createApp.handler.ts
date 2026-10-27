import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAppCommand } from './createApp.command';
import { AppRepository } from '../../../infrastructure/repositories/app.repository';
import { App } from '../../../domain/entities/app.entity';

@CommandHandler(CreateAppCommand)
export class CreateAppHandler implements ICommandHandler<CreateAppCommand> {
  constructor(private readonly appRepository: AppRepository) {}

  async execute(command: CreateAppCommand): Promise<App> {
    return this.appRepository.create(command.createAppData);
  }
}
