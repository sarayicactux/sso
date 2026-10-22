import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { Role } from '../../domain/entities/role.entity';
import { CreateRoleInterface } from '../../domain/interfaces/role/CreateRole.interface';
import { PermissionDto } from './permission.dto';
import { UpdateRoleInterface } from '../../domain/interfaces/role/UpdateRole.interface';
import { UpdateRoleStatusInterface } from '../../domain/interfaces/role/UpdateRoleStatus.interface';

export class CreateRoleDto implements CreateRoleInterface {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  description: string;
}

export class UpdateStatusRoleDto implements UpdateRoleStatusInterface {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  id: number;

  @ApiProperty({ type: Boolean })
  status: boolean;
}
export class UpdateRoleDto
  extends CreateRoleDto
  implements UpdateRoleInterface
{
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  id: number;
}

export class RoleDto implements Role {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  description: string;

  @IsOptional()
  @ApiProperty({ type: Boolean, required: false })
  isActive: boolean;

  @IsOptional()
  @ApiProperty({ type: () => UserDto, isArray: true, required: false })
  Users: UserDto[];

  @IsOptional()
  @ApiProperty({ type: () => PermissionDto, isArray: true, required: false })
  Permissions: PermissionDto[];

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(data: {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    Users?: UserDto[];
    Permissions?: PermissionDto[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.isActive = data.isActive;
    this.description = data.description;
    this.Users = data.Users;
    this.Permissions = data.Permissions;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
