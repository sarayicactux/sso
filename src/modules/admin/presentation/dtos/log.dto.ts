import { IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Log } from '../../domain/entities/log.entity';
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';
import { Admin } from '../../domain/entities/admin.entity';

export class LogDto implements Log {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  adminId: number;

  @ApiProperty()
  @IsNotEmpty()
  tableName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsInt()
  rowId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DatabaseAct)
  act: DatabaseAct;

  @ApiProperty({ required: false })
  @IsOptional()
  oldData: any;

  @ApiProperty({ required: false })
  @IsOptional()
  newData: any;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  Admin: Admin;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @IsNotEmpty()
  @ApiProperty({ type: Date })
  updatedAt: Date;

  constructor(data: {
    id?: number;
    adminId: number;
    tableName?: string;
    rowId: number;
    act: DatabaseAct;
    oldData?: any;
    newData?: any;
    description?: string;
    Admin?: Admin;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.adminId = data.adminId;
    this.tableName = data.tableName;
    this.rowId = data.rowId;
    this.act = data.act;
    this.oldData = data.oldData;
    this.newData = data.newData;
    this.description = data.description;
    this.Admin = data.Admin;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
