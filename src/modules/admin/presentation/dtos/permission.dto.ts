import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePermissionInterface } from '../../domain/interfaces/permission/CreatePermission.interface';
import { Permission } from '../../domain/entities/permission.entity';
import { AllRouteInterface, GroupedRouteInterface } from '../../domain/interfaces/permission/GroupedRoute.interface';

export class CreatePermissionDto implements CreatePermissionInterface {
  @ApiProperty()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty()
  @IsNotEmpty()
  operationId: string;
}
export class AllRouteDto implements AllRouteInterface {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  operationId: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;
}

export class GroupedRouteDto implements GroupedRouteInterface {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  group: string;

  @IsNotEmpty()
  @ApiProperty({ type: AllRouteDto, isArray: true })
  routes: AllRouteDto[];
}
export class PermissionDto implements Permission {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  roleId: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  operationId: string;

  @IsOptional()
  @ApiProperty({ type: Date, required: false })
  createdAt?: Date;

  @IsOptional()
  @ApiProperty({ type: Date, required: false })
  updatedAt?: Date;

  constructor(data: {
    id: number;
    roleId: number;
    operationId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.operationId = data.operationId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
