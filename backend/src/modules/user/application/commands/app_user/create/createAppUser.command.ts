import { CreateAppUserInterface } from '../../../../domain/interfaces/app_user/CreateAppUser.interface';

export class CreateAppUserCommand {
  constructor(public readonly data: CreateAppUserInterface) {}
}
