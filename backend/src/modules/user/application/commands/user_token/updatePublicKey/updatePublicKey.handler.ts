import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserTokenPublicKeyCommand } from './updatePublicKey.command';
import { UserTokenRepository } from '../../../../infrastructure/repositories/userToken.repository';

@CommandHandler(UpdateUserTokenPublicKeyCommand)
export class UpdateUserTokenPublicKeyHandler
  implements ICommandHandler<UpdateUserTokenPublicKeyCommand>
{
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(command: UpdateUserTokenPublicKeyCommand): Promise<boolean> {
    return this.userTokenRepository.updatePublicKey(command.data);
  }
}
