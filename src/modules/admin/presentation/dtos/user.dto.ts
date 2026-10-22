import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsMobilePhone,
  IsOptional,
  IsInt,
  IsNumberString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/entities/admin.entity';
import { RoleDto } from './role.dto';
import { RegisterInterface } from '../../domain/interfaces/admin/RegisterUser.interface';
import { LoginInterface } from '../../domain/interfaces/admin/loginAdmin.interface';
import { UpdatePasswordInterface } from '../../domain/interfaces/admin/UpdatePassword.interface';
import { RecoverPasswordInterface } from '../../domain/interfaces/admin/RecoverPassword.interface';
import { UserStatus } from '../../domain/enums/userStatus.enum';

export class RegisterDto implements RegisterInterface {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsMobilePhone()
  @ApiProperty({ type: String })
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  roleId: number;
}
export class LoginDto implements LoginInterface {
  @ApiProperty()
  @IsNumberString()
  @IsMobilePhone()
  mobile?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  fireBaseToken?: string;
}
export class UpdateUserStatusDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
export class UpdatePasswordDto implements UpdatePasswordInterface {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  oldPassword: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  @MinLength(6)
  newPassword: string;
}
export class RecoverPasswordDto implements RecoverPasswordInterface {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ type: Number })
  code: number;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  newPassword: string;
}
export class ForgetPasswordDto {
  @IsNotEmpty()
  @IsNumberString()
  @IsMobilePhone()
  @ApiProperty({ type: String })
  mobile: string;
}
export class UserDto implements User {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMobilePhone()
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  roleId: number;

  @IsOptional()
  @ApiProperty({ type: RoleDto, required: false })
  Role: RoleDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(UserStatus)
  isActive: UserStatus;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  access_token: string;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(data: {
    id?: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    isActive: UserStatus;
    roleId: number;
    Role?: RoleDto;
    access_token?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.mobile = data.mobile;
    this.isActive = data.isActive;
    this.roleId = data.roleId;
    this.Role = data.Role;
    this.access_token = data.access_token;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
