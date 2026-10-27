import { UserToken } from '../entities/userToken.entity';
import { CreateUserTokenInterface } from '../interfaces/user_token/CreateUserToken.interface';
import { UpdateUserTokenPublicKeyInterface } from '../interfaces/user_token/UpdateUserTokenPublicKey.interface';

export interface UserTokenRepositoryImpl {
  create(data: CreateUserTokenInterface): Promise<UserToken>;
  findByAccessToken(access_token: string): Promise<UserToken | null>;
  findByPublicKey(publicKey: string): Promise<UserToken | null>;
  updatePublicKey(data: UpdateUserTokenPublicKeyInterface): Promise<boolean>;
  delete(access_token: string): Promise<boolean>;
}
