export interface UserInterface {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: boolean;
  access_token?: string;
  createdAt: Date;
  updatedAt: Date;
}
