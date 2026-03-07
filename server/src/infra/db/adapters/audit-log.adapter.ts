import db from "..";
import { type AuditLogsInsert, auditLogs } from "../tables/audit-log.table";
import type { DB } from "../types";

export const create = async (values: AuditLogsInsert, dbTx?: DB) => {
	const client = dbTx ?? db;
	await client.insert(auditLogs).values(values).returning();
};
