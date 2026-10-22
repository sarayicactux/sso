import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSmsRqCommand } from './create.command';
import { SmsRq } from '../../../../domain/entities/smsRq.entity';
import { SmsRqRepository } from '../../../../infrastructure/repositories/smsRq.repository';

@CommandHandler(CreateSmsRqCommand)
export class CreateSmsRqHandler implements ICommandHandler<CreateSmsRqCommand> {
  constructor(private readonly smsRqRepository: SmsRqRepository) {}

  async execute(command: CreateSmsRqCommand): Promise<SmsRq> {
    return this.smsRqRepository.create(command.createSmsRqDto);
  }
}
