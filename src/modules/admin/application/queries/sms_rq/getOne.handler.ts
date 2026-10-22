import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOneSmsRqQuery } from './getOne.query';
import { SmsRq } from '../../../domain/entities/smsRq.entity';
import { SmsRqRepository } from '../../../infrastructure/repositories/smsRq.repository';

@QueryHandler(GetOneSmsRqQuery)
export class GetOneSmsRqHandler implements IQueryHandler<GetOneSmsRqQuery> {
  constructor(private readonly smsRqRepository: SmsRqRepository) {}

  async execute(query: GetOneSmsRqQuery): Promise<SmsRq | null> {
    return this.smsRqRepository.findOne(query.find);
  }
}
