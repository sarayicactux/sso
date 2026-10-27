import { CreateSmsRqInterface } from '../../../../domain/interfaces/sms_rq/CreateSmsRq.interface';

export class UpdateSmsRqCommand {
  constructor(
    public readonly id: number,
    public readonly updateSmsRqDto: CreateSmsRqInterface,
  ) {}
}
