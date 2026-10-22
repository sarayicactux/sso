import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AllUserQuery } from './allUser.query';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { User } from '../../../domain/entities/admin.entity';

@QueryHandler(AllUserQuery)
export class AllUserQueryHandler implements IQueryHandler<AllUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: AllUserQuery): Promise<User[] | null> {
    return this.userRepository.findAll(query.page, query.limit);
  }
}
