import { Injectable } from '@nestjs/common';

import { UserToken } from '../../domain/entities/userToken.entity';
import { UserTokenRepositoryImpl } from '../../domain/repositories/userToken.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUserTokenInterface } from '../../domain/interfaces/user_token/CreateUserToken.interface';

@Injectable()
export class UserTokenRepository implements UserTokenRepositoryImpl {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserTokenInterface): Promise<UserToken> {
    const newToken = await this.prisma.userToken.create({
      data,
    });
    return newToken as UserToken;
  }

  async findByAccessToken(access_token: string): Promise<UserToken | null> {
    const token = await this.prisma.findOne('userToken', {
      where: { access_token },
    });
    return token as UserToken | null;
  }

  async delete(access_token: string): Promise<boolean> {
    await this.prisma.forceDelete('userToken', { access_token });
    return true;
  }
}
