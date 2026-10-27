import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByUsernameQuery } from './getUserByUsername.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler
  implements IQueryHandler<GetUserByUsernameQuery>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByUsernameQuery): Promise<User | null> {
    return this.userRepository.findByUsername(query.username);
  }
}
