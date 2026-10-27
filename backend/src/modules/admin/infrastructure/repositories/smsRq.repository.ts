import { Injectable } from '@nestjs/common';

import { SmsRq } from '../../domain/entities/smsRq.entity';
import { SmsRqRepositoryImpl } from '../../domain/repositories/smsRq.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { FindSmsRqInterface } from '../../domain/interfaces/sms_rq/FindSmsRq.interface';
import { CreateSmsRqInterface } from '../../domain/interfaces/sms_rq/CreateSmsRq.interface';

@Injectable()
export class SmsRqRepository implements SmsRqRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateSmsRqInterface): Promise<SmsRq> {
    const newSmsRq = await this.prisma.smsRq.create({
      data: {
        ...data,
        lastSentTime: new Date(),
      },
    });
    return newSmsRq as SmsRq;
  }
  async findOne(data: FindSmsRqInterface): Promise<SmsRq> {
    const foundSmsRq = await this.prisma.findOne('smsRq', {
      where: {
        mobile: data.mobile,
        ip: data.ip,
      },
    });
    return foundSmsRq as SmsRq;
  }
  async update(id: number, data: CreateSmsRqInterface): Promise<boolean> {
    const updatedSmsRq = await this.prisma.smsRq.update({
      where: { id },
      data: {
        ...data,
        lastSentTime: new Date(),
      },
    });
    return !!updatedSmsRq;
  }

  async softDelete(id: number): Promise<boolean> {
    await this.prisma.smsRq.delete({ where: { id } });
    return true;
  }
}
