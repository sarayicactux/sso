import { CreateUserTokenInterface } from '../../../../domain/interfaces/user_token/CreateUserToken.interface';

export class CreateUserTokenCommand {
  constructor(public readonly createUserToken: CreateUserTokenInterface) {}
}
