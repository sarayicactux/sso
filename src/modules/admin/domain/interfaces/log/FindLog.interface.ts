import { DatabaseAct } from '../../../../../shared/enums/databaseAct.enum';

export interface FindLogInterface {
  adminId?: number;
  tableName?: string;
  act?: DatabaseAct;
  page?: number;
  limit?: number;
}
