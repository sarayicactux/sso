import { CreateAdminTokenInterface } from '../../../../domain/interfaces/admin_token/CreateAdminToken.interface';

export class CreateAdminTokenCommand {
  constructor(public readonly createAdminToken: CreateAdminTokenInterface) {}
}
