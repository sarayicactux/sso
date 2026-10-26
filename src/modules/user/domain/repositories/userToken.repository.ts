import { UserToken } from '../entities/userToken.entity';
import { CreateUserTokenInterface } from '../interfaces/user_token/CreateUserToken.interface';

export interface UserTokenRepositoryImpl {
  create(data: CreateUserTokenInterface): Promise<UserToken>;
  delete(access_token: string): Promise<boolean>;
}
