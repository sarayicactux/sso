import { UserToken } from '../entities/userToken.entity';
import { CreateUserTokenInterface } from '../interfaces/user_token/CreateUserToken.interface';

export interface UserTokenRepositoryImpl {
  create(data: CreateUserTokenInterface): Promise<UserToken>;
  findByAccessToken(access_token: string): Promise<UserToken | null>;
  delete(access_token: string): Promise<boolean>;
}
