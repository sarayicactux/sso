import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAppStatusCommand } from './updateStatus.command';
import { AppRepository } from '../../../infrastructure/repositories/app.repository';

@CommandHandler(UpdateAppStatusCommand)
export class UpdateAppStatusHandler
  implements ICommandHandler<UpdateAppStatusCommand>
{
  constructor(private readonly appRepository: AppRepository) {}

  async execute(command: UpdateAppStatusCommand): Promise<boolean> {
    return this.appRepository.updateStatus(command.data);
  }
}
