import { UpdateUserStatusInterface } from '../../../../domain/interfaces/user/UpdateUserStatus.interface';

export class UpdateUserStatusCommand {
  constructor(public readonly data: UpdateUserStatusInterface) {}
}
