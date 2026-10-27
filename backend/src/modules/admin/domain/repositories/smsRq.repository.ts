import { CreateSmsRqInterface } from '../interfaces/sms_rq/CreateSmsRq.interface';
import { FindSmsRqInterface } from '../interfaces/sms_rq/FindSmsRq.interface';
import { SmsRq } from '../entities/smsRq.entity';

export interface SmsRqRepositoryImpl {
  create(smsRq: CreateSmsRqInterface): Promise<SmsRq>;
  findOne(find: FindSmsRqInterface): Promise<SmsRq>;
  softDelete(id: number): Promise<boolean>;
  update(id: number, smsRq: CreateSmsRqInterface): Promise<boolean>;
}
