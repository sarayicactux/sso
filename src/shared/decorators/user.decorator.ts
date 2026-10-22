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
  async (
    data: { operationId: string; roleCheck: boolean },
    ctx: ExecutionContext,
  ) => {
    if (!data) console.log('no data');
    const req = ctx.switchToHttp().getRequest();
    const header = req.headers['authorization'];
    if (!header) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ' برای دسترسی باید وارد شوید ',
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
          error: ' توکن نامعتبر ',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const tokenValues = jwt.verifier(access_token);
    if (!tokenValues) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ' توکن نامعتبر ',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const { adminId } = tokenValues;
    const user = await prismaService.findByUnique('user', {
      where: { id: adminId, deletedAt: null },
      include: {
        UserTokens: true,
        Role: {
          include: {
            Permissions: true,
          },
        },
      },
    });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ' کاربر یافت نشد ',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    if (data.roleCheck && user.roleId !== +process.env.ROLE_ID) {
      const permissions = user.Role.Permissions;
      if (!permissions.find((p) => p.operationId === data.operationId)) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: ' خطای دسترسی! شما مجوز این عملیات را ندارید ',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return userMapper.userObject(user, userToken.access_token);
  },
);
