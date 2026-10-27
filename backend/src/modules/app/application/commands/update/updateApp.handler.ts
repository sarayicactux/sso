import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAppCommand } from './updateApp.command';
import { AppRepository } from '../../../infrastructure/repositories/app.repository';

@CommandHandler(UpdateAppCommand)
export class UpdateAppHandler implements ICommandHandler<UpdateAppCommand> {
  constructor(private readonly appRepository: AppRepository) {}

  async execute(command: UpdateAppCommand): Promise<boolean> {
    return this.appRepository.update(command.id, command.data);
  }
}
