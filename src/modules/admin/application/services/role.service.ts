import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

//use case
import { RoleUseCase } from '../../domain/service/role.useCase';

//DTOs
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleDto,
} from '../../presentation/dtos/role.dto';

// mappers
import { RoleMapper } from '../../infrastructure/mappers/role.mapper';

// commands
import { CreateRoleCommand } from '../commands/role/create/create.command';
import { ActiveDeactiveCommand } from '../commands/role/update/activeDeactive.command';
import { UpdateRoleCommand } from '../commands/role/update/update.command';

//queries
import { AllQuery } from '../queries/role/all.query';
import { GetOneQuery } from '../queries/role/getOne.query';
import { AllActiveQuery } from '../queries/role/allActive.query';

//entities
import { Role } from '../../domain/entities/role.entity';

//helpers
import { Tools } from '../../../../shared/helpers/tools.helper';

import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';
@Injectable()
export class RoleService implements RoleUseCase {
  constructor(
    private readonly roleMapper: RoleMapper,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly tools: Tools,
  ) {}
  async create(
    adminId: number,
    createRoleDto: CreateRoleDto,
  ): Promise<RoleDto> {
    const newRole = await this.commandBus.execute(
      new CreateRoleCommand(createRoleDto),
    );
    this.tools.saveLogs({
      adminId,
      tableName: 'roles',
      rowId: newRole.id,
      act: DatabaseAct.CREATE,
      oldData: null,
      newData: newRole,
      description: 'ایجاد نقش جدید',
    });
    return this.roleMapper.roleObject(newRole);
  }

  async update(
    adminId: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<boolean> {
    const { id } = updateRoleDto;
    const role = (await this.queryBus.execute(new GetOneQuery(id))) as Role;
    if (!role) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'نقش پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.commandBus.execute(new UpdateRoleCommand(updateRoleDto));
    this.tools.saveLogs({
      adminId,
      tableName: 'roles',
      rowId: id,
      act: DatabaseAct.UPDATE,
      oldData: role,
      newData: updateRoleDto,
      description: 'به روز رسانی نقش',
    });
    return true;
  }
  async updateStatus(
    adminId: number,
    id: number,
    status: boolean,
  ): Promise<boolean> {
    const role = (await this.queryBus.execute(new GetOneQuery(id))) as Role;
    if (!role) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'نقش پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    this.tools.saveLogs({
      adminId,
      tableName: 'roles',
      rowId: id,
      act: DatabaseAct.UPDATE,
      oldData: role,
      newData: { ...role, status },
      description: 'به روز رسانی وضعیت نقش',
    });
    await this.commandBus.execute(new ActiveDeactiveCommand({ id, status }));
    return true;
  }

  async findAll(
    adminId: number,
    page: number = 1,
    limit: number = 100,
  ): Promise<RoleDto[] | []> {
    const roles = (await this.queryBus.execute(
      new AllQuery(page, limit),
    )) as Role[];
    if (!roles) {
      return [];
    }
    this.tools.saveLogs({
      adminId,
      tableName: 'roles',
      rowId: null,
      act: DatabaseAct.READ,
      oldData: null,
      newData: null,
      description: 'مشاهده لیست نقش‌ها',
    });
    return roles.map((role) => this.roleMapper.roleObject(role));
  }
  async findAllActive(
    page: number = 1,
    limit: number = 100,
  ): Promise<RoleDto[] | []> {
    const roles = (await this.queryBus.execute(
      new AllActiveQuery(page, limit),
    )) as Role[];
    if (!roles) {
      return [];
    }
    return roles.map((role) => this.roleMapper.roleObject(role));
  }
  async detail(adminId: number, id: number): Promise<RoleDto> {
    this.tools.saveLogs({
      adminId,
      tableName: 'roles',
      rowId: id,
      act: DatabaseAct.READ,
      oldData: null,
      newData: null,
      description: 'مشاهده جزئیات نقش',
    });
    const role = (await this.queryBus.execute(new GetOneQuery(id))) as Role;
    if (!role) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'نقش پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.roleMapper.roleObject(role);
  }
}
