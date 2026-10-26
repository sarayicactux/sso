import { CreateUserData } from '../../../../domain/repositories/user.repository';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserData) {}
}
