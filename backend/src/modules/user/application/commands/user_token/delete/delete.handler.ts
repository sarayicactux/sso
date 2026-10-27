import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserTokenCommand } from './delete.command';
import { UserTokenRepository } from '../../../../infrastructure/repositories/userToken.repository';

@CommandHandler(DeleteUserTokenCommand)
export class DeleteUserTokenHandler
  implements ICommandHandler<DeleteUserTokenCommand>
{
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(command: DeleteUserTokenCommand): Promise<boolean> {
    return this.userTokenRepository.delete(command.access_token);
  }
}
