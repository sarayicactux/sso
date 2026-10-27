import { DatabaseAct } from '../../../../../shared/enums/databaseAct.enum';
export interface CreateLogInterface {
  adminId: number;
  tableName: string;
  rowId: number;
  act: DatabaseAct;
  oldData?: any;
  newData?: any;
  description: string;
}
