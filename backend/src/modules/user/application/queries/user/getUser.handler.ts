import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './getUser.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.id);
  }
}
