import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

//use case
import { PermissionUseCase } from '../../domain/service/permission.useCase';

//DTOs
import {
  CreatePermissionDto,
  GroupedRouteDto,
} from '../../presentation/dtos/permission.dto';

// commands
import { CreateCommand } from '../commands/permission/create/create.command';
import { DeleteCommand } from '../commands/permission/delete/delete.command';

// queries
import { GetOnePermissionQuery } from '../queries/permission/getOne.query';
import { GetPermissionDetailQuery } from '../queries/permission/getDetail.query';
import { GetOneQuery } from '../queries/role/getOne.query';

//entities
import { Permission } from '../../domain/entities/permission.entity';

//helpers
import { Tools } from '../../../../shared/helpers/tools.helper';

import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';

@Injectable()
export class PermissionService implements PermissionUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly tools: Tools,
  ) {}
  async create(
    adminId: number,
    createPermissionDto: CreatePermissionDto,
  ): Promise<boolean> {
    const { roleId, operationId } = createPermissionDto;
    if (!(global as any).allRoutes.find((r) => r.operationId === operationId)) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: ' ماژول وجود ندارد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const role = await this.queryBus.execute(new GetOneQuery(roleId));
    if (!role) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'نقش پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const permission = (await this.queryBus.execute(
      new GetPermissionDetailQuery({ roleId, operationId }),
    )) as Permission;

    if (permission) {
      this.delete(adminId, permission.id);
      return true;
    }
    await this.commandBus.execute(new CreateCommand(createPermissionDto));
    return true;
  }

  async delete(adminId: number, id: number): Promise<boolean> {
    const permission = (await this.queryBus.execute(
      new GetOnePermissionQuery(id),
    )) as Permission;
    if (!permission) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'دسترسی پیدا نشد',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    this.tools.saveLogs({
      adminId,
      tableName: 'permissions',
      rowId: id,
      act: DatabaseAct.DELETE,
      oldData: permission,
      newData: null,
      description: 'حذف دسترسی',
    });
    await this.commandBus.execute(new DeleteCommand(id));
    return true;
  }
  async getAllRoutes(adminId: number): Promise<GroupedRouteDto> {
    this.tools.saveLogs({
      adminId,
      tableName: 'permissions',
      rowId: null,
      act: DatabaseAct.READ,
      oldData: null,
      newData: null,
      description: 'دریافت تمام مسیرها',
    });
    const allRoutes = (global as any).allRoutes;
    const groupedByTag = allRoutes.reduce((acc: GroupedRouteDto[], route) => {
      const key = route.tags[0] || 'متفرقه';

      const existingGroup = acc.find((group) => group.group === key);
      if (!existingGroup) {
        acc.push({
          group: key,
          routes: [
            {
              operationId: route.operationId,
              title: route.title,
            },
          ],
        });
      } else {
        existingGroup.routes.push({
          operationId: route.operationId,
          title: route.title,
        });
      }

      return acc;
    }, []);
    return groupedByTag;
  }
}
