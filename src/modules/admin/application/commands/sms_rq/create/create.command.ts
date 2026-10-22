import { CreateSmsRqInterface } from '../../../../domain/interfaces/sms_rq/CreateSmsRq.interface';

export class CreateSmsRqCommand {
  constructor(public readonly createSmsRqDto: CreateSmsRqInterface) {}
}
