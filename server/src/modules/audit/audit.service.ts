import type { AuditLogsInsert } from "@/infra/db/tables/audit-log.table";
import AuditLogRepo from "./audit.repo";

// biome-ignore lint/complexity/noStaticOnlyClass: <part of design pattern>
class AuditService {
	static async writeLog(logData: AuditLogsInsert) {
		await AuditLogRepo.Write.create(logData);
	}
}

export default AuditService;
