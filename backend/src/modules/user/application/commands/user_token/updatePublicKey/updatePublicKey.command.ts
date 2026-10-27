import { UpdateUserTokenPublicKeyInterface } from '../../../../domain/interfaces/user_token/UpdateUserTokenPublicKey.interface';

export class UpdateUserTokenPublicKeyCommand {
  constructor(public readonly data: UpdateUserTokenPublicKeyInterface) {}
}
