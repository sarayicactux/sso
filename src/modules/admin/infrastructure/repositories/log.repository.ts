import { Injectable } from '@nestjs/common';

import { Log } from '../../domain/entities/log.entity';
import { LogRepositoryImpl } from '../../domain/repositories/log.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateLogInterface } from '../../domain/interfaces/log/CreateLog.interface';
import { FindLogInterface } from '../../domain/interfaces/log/FindLog.interface';

@Injectable()
export class LogRepository implements LogRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLogInterface): Promise<Log> {
    const log = await this.prisma.log.create({
      data,
    });
    return log as Log;
  }

  async find(find: FindLogInterface): Promise<Log[]> {
    const where: any = {};
    if (find?.adminId) {
      where.adminId = find.adminId;
    }
    if (find?.tableName) {
      where.tableName = find.tableName;
    }
    if (find?.act) {
      where.act = find.act;
    }
    const page = find?.page || 1;
    const limit = find?.limit || 10;
    const logs = await this.prisma.findAll('log', {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    return logs;
  }
}
