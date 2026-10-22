import { CreateUserTokenInterface } from '../../../../domain/interfaces/admin_token/CreateAdminToken.interface';

export class CreateUserTokenCommand {
  constructor(public readonly createUserToken: CreateUserTokenInterface) {}
}
