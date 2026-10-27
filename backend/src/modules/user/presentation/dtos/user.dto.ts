import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsMobilePhone,
  IsOptional,
  IsInt,
  IsNumberString,
  IsString,
  IsArray,
  IsBoolean,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';
import { LoginUserInterface } from '../../domain/interfaces/user/LoginUser.interface';
import { UpdatePasswordInterface } from '../../domain/interfaces/user/UpdatePassword.interface';
import { RecoverPasswordInterface } from '../../domain/interfaces/user/RecoverPassword.interface';
import { CreateUserInterface } from '../../domain/interfaces/user/CreateUser.interface';
import { RevokeUserAppInterface } from '../../domain/interfaces/user/RevokeUserApp.interface';
import { AppDto } from '../../../app/presentation/dtos/app.dto';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  status: boolean;
}

export class AssociateUserAppDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ type: Number })
  appId: number;
}

export class AppPublicKeyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Generated public key stored on the user token' })
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Application URL with publicKey query parameter',
  })
  url: string;

  constructor(data: { publicKey: string; url: string }) {
    this.publicKey = data.publicKey;
    this.url = data.url;
  }
}

export class LoginDto implements LoginUserInterface {
  @ApiProperty({ description: 'Unique username used for login' })
  @IsNotEmpty()
  @IsString()
  username: string;

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

export class CreateUserDto implements CreateUserInterface {
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

export class RevokeUserAppDto implements RevokeUserAppInterface {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  userId: number;
}

export class UserDto implements Partial<User> {
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

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  status: boolean;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  access_token: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [AppDto], required: false })
  apps?: AppDto[];

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
    status?: boolean;
    access_token?: string;
    apps?: AppDto[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.mobile = data.mobile;
    this.status = data.status !== false;
    this.access_token = data.access_token;
    this.apps = data.apps;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
