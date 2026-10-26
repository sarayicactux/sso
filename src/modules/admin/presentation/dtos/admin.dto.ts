import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsMobilePhone,
  IsOptional,
  IsInt,
  IsNumberString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '../../domain/entities/admin.entity';
import { LoginInterface } from '../../domain/interfaces/admin/loginAdmin.interface';
import { UpdatePasswordInterface } from '../../domain/interfaces/admin/UpdatePassword.interface';
import { RecoverPasswordInterface } from '../../domain/interfaces/admin/RecoverPassword.interface';
import { CreateAdminInterface } from '../../domain/interfaces/admin/CreateAdmin.interface';

export class LoginDto implements LoginInterface {
  @ApiProperty()
  @IsNumberString()
  @IsMobilePhone()
  mobile?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
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

export class RegisterDto implements CreateAdminInterface {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNumberString()
  @IsMobilePhone()
  mobile: string;

  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AdminDto implements Partial<Admin> {
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
    this.access_token = data.access_token;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

/** @deprecated use AdminDto */
export type UserDto = AdminDto;
