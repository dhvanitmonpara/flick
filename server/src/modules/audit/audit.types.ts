import type { Role } from "@/config/roles";
import type { AuditAction } from "@/shared/constants/audit/actions";
import type { AuditEntity } from "@/shared/constants/audit/entity";
import type { AuditPlatform } from "@/shared/constants/audit/platform";
import type { AuditStatus } from "@/shared/constants/audit/status";

export interface LogEventOptions {
	action: AuditAction;
	status?: AuditStatus;
	platform?: AuditPlatform;
	sessionId?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <reason>
	meta?: Record<string, any>;
	occuredAt?: Date;
	entityId: string;
	entityType: AuditEntity;
	requestId?: string;
	before?: JSON;
	after?: JSON;
	roles: Role[];
	reason?: string;
}
