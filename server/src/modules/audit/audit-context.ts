// audit-context.ts

import { AsyncLocalStorage } from "node:async_hooks";
import type { Role } from "@/config/roles";
import type { AuditAction } from "@/shared/constants/audit/actions";
import type { AuditEntity } from "@/shared/constants/audit/entity";

export type AuditEntry = {
	action: AuditAction;
	entityType: AuditEntity;
	entityId?: string;
	before?: unknown;
	after?: unknown;
	reason?: string;
	metadata?: Record<string, unknown>;
};

export type ObservabilityContext = {
	requestId: string;
	userId?: string;
	role?: Role;
	ip?: string;
	userAgent?: string;
	platform?: string;
	auditBuffer: AuditEntry[];
};

export const observabilityContext =
	new AsyncLocalStorage<ObservabilityContext>();
