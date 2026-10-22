import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PermissionService } from '../../application/services/permission.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreatePermissionDto, GroupedRouteDto } from '../dtos/permission.dto';
import { UserDto } from '../dtos/user.dto';

//decorator / check permission and user object
import { User } from '../../../../shared/decorators/user.decorator';
@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // create ********************************************************
  @ApiOperation({
    summary: ' ثبت دسترسی جدید ',
    operationId: 'permissionCreate',
    description: 'this operation protected by RBAC',
    tags: ['permission'],
  })
  @ApiOkResponse({
    description: '   وضعیت عملیات  ',
    type: Boolean,
  })
  @ApiInternalServerErrorResponse({
    description: 'create permission faild',
  })
  @ApiBody({
    type: CreatePermissionDto,
    description: 'create new permission DTO',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Post('')
  async create(
    @User({ operationId: 'permissionCreate', roleCheck: true }) user: UserDto,
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<boolean> {
    try {
      return await this.permissionService.create(user.id, createPermissionDto);
    } catch (err) {
      throw err;
    }
  }
  // delete ************************************
  @ApiOperation({
    summary: ' حذف نقش ',
    operationId: 'permissionDelete',
    description: 'this operation protected by RBAC',
    tags: ['permission'],
  })
  @ApiOkResponse({
    description: 'وضعیت عملیات',
    type: Boolean,
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @User({ operationId: 'permissionDelete', roleCheck: true }) user: UserDto,
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<boolean> {
    try {
      await this.permissionService.delete(user.id, id);
      return true;
    } catch (err) {
      throw err;
    }
  }
  // getAllRoutes ************************************
  @ApiOperation({
    summary: ' دریافت تمام مسیرها ',
    operationId: 'permissionGetAllRoutes',
    description: 'this operation protected by RBAC',
    tags: ['permission'],
  })
  @ApiOkResponse({
    description: 'وضعیت عملیات',
    type: Boolean,
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Get('routes')
  @HttpCode(HttpStatus.OK)
  async getAllRoutes(
    @User({ operationId: 'permissionGetAllRoutes', roleCheck: true })
    user: UserDto,
  ): Promise<GroupedRouteDto> {
    try {
      return await this.permissionService.getAllRoutes(user.id);
    } catch (err) {
      throw err;
    }
  }
}
