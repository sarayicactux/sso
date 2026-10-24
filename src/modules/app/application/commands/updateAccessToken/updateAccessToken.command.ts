import { UpdateAccessTokenInterface } from '../../../domain/interfaces/app/UpdateAppAccessToken.interface';

export class UpdateAppAccessTokenCommand {
  constructor(public readonly data: UpdateAccessTokenInterface) {}
}
