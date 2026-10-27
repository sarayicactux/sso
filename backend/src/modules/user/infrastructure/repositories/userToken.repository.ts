import { Injectable } from '@nestjs/common';

import { UserToken } from '../../domain/entities/userToken.entity';
import { UserTokenRepositoryImpl } from '../../domain/repositories/userToken.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUserTokenInterface } from '../../domain/interfaces/user_token/CreateUserToken.interface';
import { UpdateUserTokenPublicKeyInterface } from '../../domain/interfaces/user_token/UpdateUserTokenPublicKey.interface';

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

  async findByPublicKey(publicKey: string): Promise<UserToken | null> {
    if (!publicKey) {
      return null;
    }
    const token = await this.prisma.findOne('userToken', {
      where: { publicKey },
    });
    return token as UserToken | null;
  }

  async updatePublicKey(
    data: UpdateUserTokenPublicKeyInterface,
  ): Promise<boolean> {
    if (data.id != null) {
      await this.prisma.userToken.update({
        where: { id: data.id },
        data: { publicKey: data.publicKey },
      });
      return true;
    }
    if (data.userId == null) {
      return false;
    }
    const tokens = await this.prisma.findAll('userToken', {
      where: { userId: data.userId },
      take: 1,
    });
    const token = tokens[0];
    if (!token) {
      return false;
    }
    await this.prisma.userToken.update({
      where: { id: token.id },
      data: { publicKey: data.publicKey },
    });
    return true;
  }

  async delete(access_token: string): Promise<boolean> {
    await this.prisma.forceDelete('userToken', { access_token });
    return true;
  }
}
