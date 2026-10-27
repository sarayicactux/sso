import { User } from '../entities/user.entity';
import { CreateUserInterface } from '../interfaces/user/CreateUser.interface';
import { UpdateUserStatusInterface } from '../interfaces/user/UpdateUserStatus.interface';

export type CreateUserData = Omit<CreateUserInterface, 'accessToken'>;

export interface UserWithApps extends User {
  apps?: unknown[];
}

export interface UserRepositoryImpl {
  create(data: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByMobile(mobile: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAllWithApps(): Promise<UserWithApps[]>;
  updatePassword(password: string, id: number): Promise<boolean>;
  updateStatus(data: UpdateUserStatusInterface): Promise<User>;
}
