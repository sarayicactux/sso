export interface CreateUserInterface {
  username: string;
  email?: string | null;
  mobile: string;
  firstName?: string;
  lastName?: string;
  password: string;
  accessToken: string;
}
