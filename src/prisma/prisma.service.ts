import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  create() {
    throw new Error('Method not implemented.');
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async findCount(model: string, args?: any) {
    return this[model].count({
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }
  async findAll(model: string, args?: any) {
    return this[model].findMany({
      where: {
        ...args.where,
        deletedAt: null,
      },
      orderBy: args.orderBy
        ? args.orderBy
        : [
            {
              id: 'desc',
            },
          ],
      include: args.include ? args.include : null,
      skip: args.skip ? args.skip : 0,
      take: args.take ? args.take : 10,
    });
  }
  async findOne(model: string, args?: any) {
    return this[model].findFirst({
      where: {
        ...args.where,
        deletedAt: null,
      },
      include: args.include ? args.include : null,
    });
  }
  async findByUnique(model: string, args?: any) {
    return this[model].findUnique({
      where: {
        ...args.where,
        deletedAt: null,
      },
      include: args.include ? args.include : null,
    });
  }
  async findDeleted(model: string, args?: any) {
    return this[model].findMany({
      where: {
        ...args.where,
        deletedAt: { not: null },
      },
      orderBy: args.orderBy
        ? args.orderBy
        : [
            {
              id: 'desc',
            },
          ],
      include: args.include ? args.include : null,
      skip: args.skip ? args.skip : 0,
      take: args.take ? args.take : 10,
    });
  }
  async softDelete(model: string, where: any) {
    return this[model].updateMany({
      ...where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async forceDelete(model: string, where: any) {
    return this[model].deleteMany({ where });
  }
  async restore(model: string, where: any) {
    return this[model].updateMany({
      ...where,
      data: {
        deletedAt: null,
      },
    });
  }

  async findWithDeleted(model: string, args?: any) {
    return this[model].findMany(args);
  }
}
