export interface GetUserByPublicKeyInterface {
  accessToken: string;
  publicKey: string;
}

/** gRPC GetUserByPublicKey response — user identity plus session access_token (no password). */
export interface GetUserByPublicKeyResult {
  success: boolean;
  id: number;
  username: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  status: boolean;
  access_token: string;
}
