import { LogDto } from '../../presentation/dtos/log.dto';
import { AdminMapper } from './admin.mapper';
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
      Admin: log.Admin ? new AdminMapper().toAdminDto(log.Admin) : null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    });
  }
}
