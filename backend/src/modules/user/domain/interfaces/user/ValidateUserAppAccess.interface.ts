export interface ValidateUserAppAccessInterface {
  accessToken: string;
  userAccessToken: string;
}

/** Safe gRPC ValidateUserAppAccess response (UserDto without tokens/apps/timestamps). */
export interface ValidateUserAppAccessResult {
  valid: boolean;
  id: number;
  username: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  status: boolean;
}
