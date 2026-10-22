import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RoleService } from '../../application/services/role.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateRoleDto,
  UpdateRoleDto,
  UpdateStatusRoleDto,
  RoleDto,
} from '../dtos/role.dto';
import { UserDto } from '../dtos/user.dto';

import { User } from '../../../../shared/decorators/user.decorator';
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // create ********************************************************
  @ApiOperation({
    summary: ' ثبت نقش جدید ',
    operationId: 'roleCreate',
    description: 'this operation protected by RBAC',
    tags: ['role'],
  })
  @ApiOkResponse({
    description: '  اطلاعات نقش  ',
    type: RoleDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'create role faild',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: 'create new role DTO',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Post('')
  async create(
    @User({ operationId: 'roleCreate', roleCheck: true }) user: UserDto,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleDto> {
    try {
      return await this.roleService.create(user.id, createRoleDto);
    } catch (err) {
      throw err;
    }
  }
  // update ************************************
  @ApiOperation({
    summary: ' به روز رسانی نقش   ',
    operationId: 'roleUpdate',
    description: 'this operation protected by RBAC',
    tags: ['role'],
  })
  @ApiOkResponse({
    description: 'update role',
    type: Boolean,
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'update role',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Put('update')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @User({ operationId: 'roleUpdate', roleCheck: true }) user: UserDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      await this.roleService.update(user.id, updateRoleDto);
      return true;
    } catch (err) {
      throw err;
    }
  }
  // update status ************************************
  @ApiOperation({
    summary: ' به روز رسانی وضعیت نقش  ',
    operationId: 'roleUpdateStatus',
    description: 'this operation protected by RBAC',
    tags: ['role'],
  })
  @ApiOkResponse({
    description: 'update role status',
    type: Boolean,
  })
  @ApiBody({
    type: UpdateStatusRoleDto,
    description: 'update role status',
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @Put('updateStatus')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @User({ operationId: 'roleUpdateStatus', roleCheck: true }) user: UserDto,
    @Body() updateStatusRoleDto: UpdateStatusRoleDto,
  ) {
    try {
      await this.roleService.updateStatus(
        user.id,
        updateStatusRoleDto.id,
        updateStatusRoleDto.status,
      );
      return true;
    } catch (err) {
      throw err;
    }
  }

  // detail ************************************
  @ApiOperation({
    summary: '  نمایش جزئیات نقش ',
    operationId: 'roleGetOne',
    description: 'this operation is public',
    tags: ['role'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({
    description: 'جزئیات نقش',
    type: RoleDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'get role list faild',
  })
  @ApiNotFoundResponse({ description: 'نقش پیدا نشد' })
  @Get('detail/:id')
  @HttpCode(HttpStatus.OK)
  async detail(
    @User({ operationId: 'roleAll', roleCheck: true }) user: UserDto,
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<RoleDto> {
    return this.roleService.detail(user.id, id);
  }
  // findAll ************************************
  @ApiOperation({
    summary: '  لیست تمام نقش ها ',
    operationId: 'roleAll',
    description: 'this operation is public',
    tags: ['role'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({
    description: 'لیست نقش ها',
    type: [RoleDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'get role list faild',
  })
  @Get('')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @User({ operationId: 'roleAll', roleCheck: true }) user: UserDto,
  ): Promise<RoleDto[]> {
    return this.roleService.findAll(user.id);
  }
  // findAllActive ************************************
  @ApiOperation({
    summary: '  لیست تمام نقش های فعال ',
    operationId: 'roleAllActive',
    description: 'this operation is public',
    tags: ['role'],
  })
  @ApiHeader({
    name: 'authorization Bearer ',
    description: 'this token recieved in login',
  })
  @ApiOkResponse({
    description: 'لیست نقش ها',
    type: [RoleDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'get active role list faild',
  })
  @Get('active')
  @HttpCode(HttpStatus.OK)
  async findAllActive(): Promise<RoleDto[]> {
    return this.roleService.findAllActive();
  }
}
