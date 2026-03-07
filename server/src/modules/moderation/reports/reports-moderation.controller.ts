import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import ContentReportService from "@/modules/moderation/reports/report-moderation.service";
import * as reportSchemas from "./reports-moderation.schema";

@Controller()
class ReportsController {
	static async create(req: Request) {
		const payload = reportSchemas.createReportSchema.parse(req.body);
		const userId = req.user.id;

		const report = await ContentReportService.createReport({
			type: payload.type,
			reportedBy: userId,
			reason: payload.reason,
			message: payload.message,
			...(payload.type === "Post"
				? { postId: payload.targetId }
				: { commentId: payload.targetId }),
		});

		return HttpResponse.created("Report created successfully", { report });
	}

	static async list(req: Request) {
		const query = reportSchemas.reportFiltersSchema.parse(req.query);

		const reports = await ContentReportService.getReportsWithFilters({
			type: query.type,
			statuses: query.status,
			page: query.page,
			limit: query.limit,
		});

		return HttpResponse.ok("Reports fetched successfully", {
			data: reports.reports,
			pagination: reports.pagination,
			filters: {
				type: query.type,
				status: query.status,
			},
		});
	}

	static async getById(req: Request) {
		const { id } = reportSchemas.reportIdParamsSchema.parse(req.params);
		const report = await ContentReportService.getReportById(id);

		return HttpResponse.ok("Report fetched successfully", { report });
	}

	static async listByUser(req: Request) {
		const { userId } = reportSchemas.reportsByUserParamsSchema.parse(
			req.params,
		);
		const reports = await ContentReportService.getUserReports(userId);

		return HttpResponse.ok("User reports fetched successfully", { reports });
	}

	static async update(req: Request) {
		const { id } = reportSchemas.reportIdParamsSchema.parse(req.params);
		const { status } = reportSchemas.updateReportSchema.parse(req.body);

		const report = await ContentReportService.updateReportStatus(id, status);

		return HttpResponse.ok("Report updated successfully", { report });
	}

	static async remove(req: Request) {
		const { id } = reportSchemas.reportIdParamsSchema.parse(req.params);
		const result = await ContentReportService.deleteReport(id);

		return HttpResponse.ok("Report deleted successfully", result);
	}

	static async bulkRemove(req: Request) {
		const { reportIds } = reportSchemas.bulkDeleteReportsSchema.parse(req.body);
		const result = await ContentReportService.bulkDeleteReports(reportIds);

		return HttpResponse.ok("Reports deleted successfully", result);
	}
}

export default ReportsController;
