export interface AdminInterface {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roleId: number;
  access_token?: string;
  createdAt: Date;
  updatedAt: Date;
}
