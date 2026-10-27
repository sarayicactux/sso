export interface AdminInterface {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  access_token?: string;
  createdAt: Date;
  updatedAt: Date;
}
