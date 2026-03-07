import {
	type AuditEntry,
	observabilityContext,
} from "@/modules/audit/audit-context";
import { device } from "./device";

const recordAudit = async (entry: AuditEntry) => {
	const ctx = observabilityContext.getStore();
	if (!ctx) return;

	const extractedMetadata = {
		...entry.metadata,
		deviceInfo: device.parseUserAgent(ctx.userAgent),
	};

	ctx.auditBuffer.push({
		...entry,
		metadata: extractedMetadata,
	});
};

export default recordAudit;
