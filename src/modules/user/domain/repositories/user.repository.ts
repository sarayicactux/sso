import { User } from '../entities/user.entity';
import { CreateUserInterface } from '../interfaces/user/CreateUser.interface';

export type CreateUserData = Omit<CreateUserInterface, 'accessToken'>;

export interface UserRepositoryImpl {
  create(data: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByMobile(mobile: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(password: string, id: number): Promise<boolean>;
}
