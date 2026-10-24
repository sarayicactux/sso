import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAppActiveSessionCommand } from './updateActiveSession.command';
import { AppRepository } from '../../../infrastructure/repositories/app.repository';

@CommandHandler(UpdateAppActiveSessionCommand)
export class UpdateAppActiveSessionHandler
  implements ICommandHandler<UpdateAppActiveSessionCommand>
{
  constructor(private readonly appRepository: AppRepository) {}

  async execute(command: UpdateAppActiveSessionCommand): Promise<boolean> {
    return this.appRepository.updateActiveSession(command.data);
  }
}
