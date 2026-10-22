import { Admin } from './admin.entity';
import { DatabaseAct } from '../../../../shared/enums/databaseAct.enum';
export class Log {
  readonly id: number;
  adminId: number;
  tableName: string;
  rowId: number;
  act: DatabaseAct;
  oldData?: any;
  newData?: any;
  description?: string;
  Admin?: Admin;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

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
    deletedAt?: Date;
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
    this.deletedAt = data.deletedAt || null;
  }
}
