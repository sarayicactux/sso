import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAppAccessTokenCommand } from './updateAccessToken.command';
import { AppRepository } from '../../../infrastructure/repositories/app.repository';

@CommandHandler(UpdateAppAccessTokenCommand)
export class UpdateAppAccessTokenHandler
  implements ICommandHandler<UpdateAppAccessTokenCommand>
{
  constructor(private readonly appRepository: AppRepository) {}

  async execute(command: UpdateAppAccessTokenCommand): Promise<boolean> {
    return this.appRepository.updateAccessToken(command.data);
  }
}
