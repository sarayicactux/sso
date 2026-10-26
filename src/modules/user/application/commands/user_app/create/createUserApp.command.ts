import { CreateUserAppInterface } from '../../../../domain/interfaces/user_app/CreateUserApp.interface';

export class CreateUserAppCommand {
  constructor(public readonly data: CreateUserAppInterface) {}
}
