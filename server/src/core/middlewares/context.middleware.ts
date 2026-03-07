import type { NextFunction, Request, Response } from "express";
import AuditService from "@/modules/audit/audit.service";
import { observabilityContext } from "@/modules/audit/audit-context";

async function flushAuditBuffer() {
	const ctx = observabilityContext.getStore();
	if (!ctx || ctx.auditBuffer.length === 0) return;

	for (const entry of ctx.auditBuffer) {
		await AuditService.writeLog({
			action: entry.action,
			metadata: entry.metadata,
			entityType: entry.entityType,
			entityId: entry.entityId,
			before: entry.before,
			after: entry.after,
			reason: entry.reason,
			actorId: ctx.userId,
			actorType: ctx.role,
			ipAddress: ctx.ip,
			userAgent: ctx.userAgent,
			requestId: ctx.requestId,
			occuredAt: new Date(),
		});
	}
}

function observeRequest(req: Request, res: Response, next: NextFunction) {
	const requestId =
		req.headers["x-request-id"]?.toString() ?? crypto.randomUUID();

	req.id = requestId;

	const ctx = {
		requestId,
		userId: req.auth?.id,
		// biome-ignore lint/suspicious/noExplicitAny: <reason>
		role: req.auth?.role || ("system" as any),
		ip:
			req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
			req.socket.remoteAddress,
		userAgent: req.headers["user-agent"],
		platform: "web",
		auditBuffer: [],
	};

	observabilityContext.run(ctx, () => {
		res.setHeader("x-request-id", ctx.requestId);

		res.on("finish", () => {
			flushAuditBuffer().catch((err) => {
				console.error("Audit flush failed", err);
			});
		});

		next();
	});
}

export default observeRequest;
