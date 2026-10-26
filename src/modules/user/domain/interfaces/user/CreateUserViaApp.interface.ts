import { CreateUserInterface } from './CreateUser.interface';

/** gRPC CreateUser request — same fields as REST CreateUser. */
export type CreateUserViaAppInterface = CreateUserInterface;

/** Safe gRPC CreateUser response (no password, tokens, or apps). */
export interface CreateUserViaAppResult {
  success: boolean;
  id: number;
  username: string;
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  status: boolean;
}
