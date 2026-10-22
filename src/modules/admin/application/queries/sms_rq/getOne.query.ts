import { FindSmsRqInterface } from '../../../domain/interfaces/sms_rq/FindSmsRq.interface';

export class GetOneSmsRqQuery {
  constructor(public readonly find: FindSmsRqInterface) {}
}
