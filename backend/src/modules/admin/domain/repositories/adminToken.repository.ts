import { CreateAdminTokenInterface } from '../interfaces/admin_token/CreateAdminToken.interface';
import { AdminToken } from '../entities/adminToken.entity';

export interface AdminTokenRepositoryImpl {
  create(adminToken: CreateAdminTokenInterface): Promise<AdminToken>;
  delete(access_token: string): Promise<boolean>;
}
