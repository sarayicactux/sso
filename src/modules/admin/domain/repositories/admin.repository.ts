import { Admin } from '../entities/admin.entity';
import { CreateAdminInterface } from '../interfaces/admin/CreateAdmin.interface';

export interface AdminRepositoryImpl {
  create(data: CreateAdminInterface): Promise<Admin>;
  findById(id: number): Promise<Admin | null>;
  findByMobile(mobile: string): Promise<Admin | null>;
  findByUsername(username: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  findAll(page: number, limit: number): Promise<Admin[]>;
  updatePassword(password: string, id: number): Promise<boolean>;
}
