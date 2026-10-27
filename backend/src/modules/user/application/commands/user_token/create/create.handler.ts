import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserTokenCommand } from './create.command';
import { UserTokenRepository } from '../../../../infrastructure/repositories/userToken.repository';
import { UserToken } from '../../../../domain/entities/userToken.entity';

@CommandHandler(CreateUserTokenCommand)
export class CreateUserTokenHandler
  implements ICommandHandler<CreateUserTokenCommand>
{
  constructor(private readonly userTokenRepository: UserTokenRepository) {}

  async execute(command: CreateUserTokenCommand): Promise<UserToken> {
    return this.userTokenRepository.create(command.createUserToken);
  }
}
