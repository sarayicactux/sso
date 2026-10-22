import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './getUser.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/admin.entity';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery): Promise<User | null> {
    return this.userRepository.findById(query.id);
  }
}
