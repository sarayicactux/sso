export interface UpdateUserStatusByUsernameInterface {
  username: string;
  status: boolean;
  accessToken: string;
}

export interface UpdateUserStatusByUsernameResult {
  success: boolean;
  status: boolean;
}
