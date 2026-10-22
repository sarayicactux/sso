import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Jwt } from '../helpers/jwt.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminMapper } from '../../modules/admin/infrastructure/mappers/admin.mapper';

const jwt = new Jwt();
const prismaService = new PrismaService();
const adminMapper = new AdminMapper();

export const Admin = createParamDecorator(
  async (data: { operationId: string }, ctx: ExecutionContext) => {
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
    const adminToken = await prismaService.findOne('adminToken', {
      where: { access_token: access_token },
    });
    if (!adminToken) {
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
    const { adminId } = tokenValues as { adminId: number };
    const admin = await prismaService.findByUnique('admin', {
      where: { id: adminId, deletedAt: null },
      include: {
        AdminTokens: true,
      },
    });
    if (!admin) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: ' کاربر یافت نشد ',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return adminMapper.toAdminDto(admin, adminToken.access_token);
  },
);
