import { Admin } from '../entities/admin.entity';

export interface AdminRepositoryImpl {
  findById(id: number): Promise<Admin | null>;
  findByMobile(mobile: string): Promise<Admin | null>;
  findByUsername(username: string): Promise<Admin | null>;
  findByEmail(email: string): Promise<Admin | null>;
  findAll(page: number, limit: number): Promise<Admin[]>;
  updatePassword(password: string, id: number): Promise<boolean>;
}
