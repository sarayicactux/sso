import { Admin } from '../entities/admin.entity';
import { LoginInterface } from '../interfaces/admin/loginAdmin.interface';
import { RecoverPasswordInterface } from '../interfaces/admin/RecoverPassword.interface';
import { UpdatePasswordInterface } from '../interfaces/admin/UpdatePassword.interface';

export interface AdminControllerImpl {
  login(login: LoginInterface, ip: string): Promise<Admin | null>;
  updatePassword(
    user: Admin,
    updatePasswordDto: UpdatePasswordInterface,
  ): Promise<boolean>;
  forgetPassword(body: { mobile: string }, ip: string): Promise<string | null>;
  recoverPassword(
    headers: any,
    recoverPasswordDto: RecoverPasswordInterface,
    recoverPassToken: string,
  ): Promise<boolean>;
  logOut(user: Admin): Promise<boolean>;
}
