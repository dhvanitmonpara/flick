import logger from "@/core/logger";
import mailService from "@/infra/services/mail";
import { invalidateCollegeCaches } from "@/modules/college/college.cache-invalidation";
import CollegeRepo from "@/modules/college/college.repo";
import AdminRepo from "./admin.repo";

class AdminService {
	async getDashboardOverview() {
		logger.info("Fetching admin dashboard overview");
		const data = {
			users: 0,
			posts: 0,
			comments: 0,
		};
		logger.info("Admin dashboard overview fetched successfully");
		return data;
	}

	async getManageUsersQuery(username?: string, email?: string) {
		logger.info("Fetching manage users query", { username, email });
		const users = await AdminRepo.Read.getManageUsersQuery(username, email);
		logger.info("Manage users query fetched successfully", {
			count: users.length,
		});
		return users;
	}

	async getReports(page: number, limit: number, statuses: string[]) {
		logger.info("Fetching reports", { page, limit, statuses });
		const reports = await AdminRepo.Read.getReports(page, limit, statuses);
		logger.info("Reports fetched successfully", { count: reports.data.length });
		return reports;
	}

	async getAllColleges() {
		logger.info("Fetching all colleges");
		const colleges = await AdminRepo.Read.getAllColleges();
		logger.info("All colleges fetched successfully", {
			count: colleges.length,
		});
		return colleges;
	}

	async getCollegeRequests() {
		logger.info("Fetching college requests");
		const requests = await AdminRepo.Read.getCollegeRequests();
		logger.info("College requests fetched successfully", {
			count: requests.length,
		});
		return requests;
	}

	async getLogs(
		page: number,
		limit: number,
		sortBy: string,
		sortOrder: "asc" | "desc",
	) {
		logger.info("Fetching logs", { page, limit, sortBy, sortOrder });
		const logs = await AdminRepo.Read.getLogs(page, limit, sortBy, sortOrder);
		logger.info("Logs fetched successfully", { count: logs.data.length });
		return logs;
	}

	async getAllFeedbacks() {
		logger.info("Fetching all feedbacks");
		const feedbacks = await AdminRepo.Read.getAllFeedbacks();
		logger.info("All feedbacks fetched successfully", {
			count: feedbacks.length,
		});
		return feedbacks;
	}

	async createCollege(data: {
		name: string;
		emailDomain: string;
		city: string;
		state: string;
		profile?: string;
		branches?: string[];
	}) {
		logger.info("Creating new college", { name: data.name });

		const { branches, ...collegeInfo } = data;
		const newCollege = await AdminRepo.Write.createCollege(collegeInfo);

		if (branches && branches.length > 0) {
			await CollegeRepo.Write.setCollegeBranches(newCollege.id, branches);
			logger.info("Branches assigned to college", {
				collegeId: newCollege.id,
				branches,
			});
		}

		await invalidateCollegeCaches({
			collegeId: newCollege.id,
			nextEmailDomain: newCollege.emailDomain,
			invalidateBranches: !!branches,
		});

		logger.info("New college created successfully", { id: newCollege.id });
		return { ...newCollege, branches: branches ?? [] };
	}

	async updateCollege(
		id: string,
		updates: Partial<{
			name: string;
			emailDomain: string;
			city: string;
			state: string;
			profile: string;
			branches: string[];
		}>,
	) {
		logger.info("Updating college", { id, updates });
		const existingCollege = await CollegeRepo.Read.findById(id);

		const { branches, ...collegeUpdates } = updates;
		const updatedCollege = await AdminRepo.Write.updateCollege(
			id,
			collegeUpdates,
		);

		if (!updatedCollege) {
			logger.warn("Attempted to update non-existent college", { id });
			return null;
		}

		if (branches) {
			await CollegeRepo.Write.setCollegeBranches(id, branches);
			logger.info("College branches updated", { collegeId: id, branches });
		}

		await invalidateCollegeCaches({
			collegeId: updatedCollege.id,
			previousEmailDomain: existingCollege?.emailDomain ?? null,
			nextEmailDomain: updatedCollege.emailDomain,
			invalidateBranches: !!branches,
		});

		logger.info("College updated successfully", { id: updatedCollege.id });

		return {
			...updatedCollege,
			branches:
				branches ??
				(existingCollege && "branches" in existingCollege
					? existingCollege.branches
					: []),
		};
	}

	async updateCollegeRequest(
		id: string,
		updates: Partial<{
			status: "pending" | "approved" | "rejected";
			resolvedCollegeId: string;
		}>,
	) {
		logger.info("Updating college request", { id, updates });
		const existingRequest = await AdminRepo.Read.getCollegeRequestById(id);

		const updatedRequest = await AdminRepo.Write.updateCollegeRequest(id, {
			status: updates.status,
			resolvedCollegeId: updates.resolvedCollegeId ?? null,
			resolvedAt:
				updates.status === "approved" || updates.status === "rejected"
					? new Date()
					: null,
		});

		if (!updatedRequest) {
			logger.warn("Attempted to update non-existent college request", { id });
			return null;
		}

		const shouldSendApprovalEmail =
			existingRequest?.status !== "approved" &&
			updatedRequest.status === "approved" &&
			!!updatedRequest.requestedByEmail;

		if (shouldSendApprovalEmail) {
			const requesterEmail = updatedRequest.requestedByEmail;
			if (!requesterEmail) {
				return updatedRequest;
			}

			try {
				await mailService.send(requesterEmail, "COLLEGE-NOW-AVAILABLE", {
					projectName: "Flick",
					collegeName: updatedRequest.name,
				});
			} catch (error) {
				logger.error("Failed to send college approval email", {
					requestId: updatedRequest.id,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return updatedRequest;
	}
}

export default new AdminService();
