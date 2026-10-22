import { LogDto } from '../../presentation/dtos/log.dto';
import { UserMapper } from './user.mapper';
import databaseActs from '../../../../shared/enums/databaseAct.enum';
export class LogMapper {
  logObject(log): LogDto | null {
    if (!log) return null;
    return new LogDto({
      id: log.id,
      adminId: log.adminId,
      tableName: log.tableName,
      rowId: log.rowId,
      act: databaseActs[log.act],
      oldData: log.oldData,
      newData: log.newData,
      description: log.description,
      User: log.User ? new UserMapper().userObject(log.User) : null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    });
  }
}
