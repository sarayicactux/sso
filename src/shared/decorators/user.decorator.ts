import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Jwt } from '../helpers/jwt.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { UserMapper } from '../../modules/user/infrastructure/mappers/user.mapper';

const jwt = new Jwt();
const prismaService = new PrismaService();
const userMapper = new UserMapper();

export const User = createParamDecorator(
  async (data: { operationId: string }, ctx: ExecutionContext) => {
    if (!data) console.log('no data');
    const req = ctx.switchToHttp().getRequest();
    const header = req.headers['authorization'];
    if (!header) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'You must log in to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const access_token = header.replace('Bearer ', '');
    const userToken = await prismaService.findOne('userToken', {
      where: { access_token: access_token },
    });
    if (!userToken) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid token',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const tokenValues = jwt.verifier(access_token);
    if (!tokenValues) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid token',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const { userId } = tokenValues as { userId: number };
    const user = await prismaService.findOne('user', {
      where: { id: userId },
      include: {
        UserTokens: true,
      },
    });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'User not found',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return userMapper.toUserDto(user, userToken.access_token);
  },
);
