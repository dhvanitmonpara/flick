import { Controller, HttpError } from "@/core/http";
import logger from "@/core/logger";
import recordAudit from "@/lib/record-audit";
import { invalidateCollegeCaches } from "./college.cache-invalidation";
import CollegeRepo from "./college.repo";
import type {
	CollegeUpdates,
	CreateCollegeRequestInput,
	UpdateCollegeRequestInput,
} from "./college.types";

@Controller()
class CollegeService {
	async createCollege(collegeData: {
		name: string;
		emailDomain: string;
		city: string;
		state: string;
		profile?: string;
		branches?: string[];
	}) {
		logger.info("Creating college", {
			emailDomain: collegeData.emailDomain,
			name: collegeData.name,
		});

		const existing = await CollegeRepo.CachedRead.findByEmailDomain(
			collegeData.emailDomain,
		);
		if (existing) {
			logger.warn("College with email domain already exists", {
				emailDomain: collegeData.emailDomain,
			});
			throw new HttpError({
				statusCode: 409,
				message: "College with this email domain already exists",
				code: "COLLEGE_ALREADY_EXISTS",
				meta: { source: "CollegeService.createCollege" },
				errors: [
					{
						field: "emailDomain",
						message: "College with this email domain already exists",
					},
				],
			});
		}

		const { branches, ...collegeInfo } = collegeData;
		const newCollege = await CollegeRepo.Write.create(collegeInfo);
		logger.info("College created successfully", {
			collegeId: newCollege.id,
			emailDomain: newCollege.emailDomain,
		});

		if (branches && branches.length > 0) {
			await CollegeRepo.Write.setCollegeBranches(newCollege.id, branches);
			logger.info("Branches assigned to college", {
				collegeId: newCollege.id,
				branches,
			});
		}

		await recordAudit({
			action: "admin:created:college",
			entityType: "college",
			entityId: newCollege.id,
			after: { id: newCollege.id },
			metadata: { emailDomain: newCollege.emailDomain },
		});

		await invalidateCollegeCaches({
			collegeId: newCollege.id,
			nextEmailDomain: newCollege.emailDomain,
			invalidateBranches: true,
		});

		return newCollege;
	}

	async getColleges(filters?: { city?: string; state?: string }) {
		logger.info("Fetching colleges", { filters });

		const colleges = await CollegeRepo.CachedRead.findAll(filters);
		logger.info("Retrieved colleges", { count: colleges.length, filters });
		return colleges;
	}

	async getCollegeById(id: string) {
		logger.info("Fetching college by ID", { collegeId: id });

		const college = await CollegeRepo.CachedRead.findById(id);
		if (!college) {
			logger.warn("College not found", { collegeId: id });
			throw HttpError.notFound("College not found", {
				code: "COLLEGE_NOT_FOUND",
				meta: { source: "CollegeService.getCollegeById" },
				errors: [{ field: "id", message: "College not found" }],
			});
		}

		logger.info("College retrieved successfully", {
			collegeId: id,
			emailDomain: college.emailDomain,
		});
		return college;
	}

	async getCollegeBranches(collegeId: string) {
		logger.info("Fetching college branches", { collegeId });

		const branches =
			await CollegeRepo.CachedRead.findBranchesByCollegeId(collegeId);
		logger.info("Retrieved college branches", {
			collegeId,
			count: branches.length,
		});
		return branches;
	}

	async createCollegeRequest(requestData: CreateCollegeRequestInput) {
		logger.info("Creating college request", {
			emailDomain: requestData.emailDomain,
		});

		const existingCollege = await CollegeRepo.CachedRead.findByEmailDomain(
			requestData.emailDomain,
		);
		if (existingCollege) {
			throw HttpError.badRequest("College already exists", {
				code: "COLLEGE_ALREADY_EXISTS",
			});
		}

		const existingRequest = await CollegeRepo.Read.findRequestByEmailDomain(
			requestData.emailDomain,
		);
		if (existingRequest) {
			throw HttpError.badRequest("A request for this college already exists", {
				code: "COLLEGE_REQUEST_ALREADY_EXISTS",
			});
		}

		const createdRequest = await CollegeRepo.Write.createRequest({
			...requestData,
			emailDomain: requestData.emailDomain.toLowerCase(),
			requestedByEmail: requestData.requestedByEmail.toLowerCase(),
		});

		logger.info("College request created", {
			requestId: createdRequest?.id,
			emailDomain: requestData.emailDomain,
		});

		return createdRequest;
	}

	async getCollegeRequests() {
		logger.info("Fetching college requests");
		const requests = await CollegeRepo.Read.findAllRequests();
		logger.info("College requests fetched", { count: requests.length });
		return requests;
	}

	async updateCollegeRequest(id: string, updates: UpdateCollegeRequestInput) {
		const updatedRequest = await CollegeRepo.Write.updateRequestById(id, {
			status: updates.status,
			resolvedCollegeId: updates.resolvedCollegeId ?? null,
			resolvedAt:
				updates.status === "approved" || updates.status === "rejected"
					? new Date()
					: null,
		});

		if (!updatedRequest) {
			throw HttpError.notFound("College request not found", {
				code: "COLLEGE_REQUEST_NOT_FOUND",
			});
		}

		return updatedRequest;
	}

	async updateCollege(id: string, updates: CollegeUpdates) {
		const existing = await CollegeRepo.CachedRead.findById(id);
		if (!existing) {
			throw HttpError.notFound("College not found", {
				code: "COLLEGE_NOT_FOUND",
				meta: { source: "CollegeService.updateCollege" },
				errors: [{ field: "id", message: "College not found" }],
			});
		}

		if (updates.emailDomain && updates.emailDomain !== existing.emailDomain) {
			const emailConflict = await CollegeRepo.CachedRead.findByEmailDomain(
				updates.emailDomain,
			);
			if (emailConflict) {
				throw new HttpError({
					statusCode: 409,
					message: "College with this email domain already exists",
					code: "COLLEGE_ALREADY_EXISTS",
					meta: { source: "CollegeService.updateCollege" },
					errors: [
						{
							field: "emailDomain",
							message: "College with this email domain already exists",
						},
					],
				});
			}
		}

		const { branches, ...collegeUpdates } = updates;
		const updatedCollege = await CollegeRepo.Write.updateById(
			id,
			collegeUpdates,
		);

		const before: CollegeUpdates = {};
		if (updates.city) before.city = existing.city;
		if (updates.emailDomain) before.emailDomain = existing.emailDomain;
		if (updates.name) before.name = existing.name;
		if (updates.profile) before.profile = existing.profile;
		if (updates.state) before.state = existing.state;

		if (branches) {
			const existingBranches =
				await CollegeRepo.Read.findBranchesByCollegeId(id);
			before.branches = existingBranches.map((b) => b.id);

			await CollegeRepo.Write.setCollegeBranches(id, branches);
			logger.info("College branches updated", { collegeId: id, branches });
		}

		await recordAudit({
			action: "admin:updated:college",
			entityType: "college",
			entityId: updatedCollege.id,
			before: before,
			after: updates,
			metadata: { emailDomain: updatedCollege.emailDomain },
		});

		await invalidateCollegeCaches({
			collegeId: updatedCollege.id,
			previousEmailDomain: existing.emailDomain,
			nextEmailDomain: updatedCollege.emailDomain,
			invalidateBranches: !!branches,
		});

		return updatedCollege;
	}

	async deleteCollege(id: string) {
		const existing = await CollegeRepo.CachedRead.findById(id);
		if (!existing) {
			throw HttpError.notFound("College not found", {
				code: "COLLEGE_NOT_FOUND",
				meta: { source: "CollegeService.deleteCollege" },
				errors: [{ field: "id", message: "College not found" }],
			});
		}

		const deletedCollege = await CollegeRepo.Write.deleteById(id);

		await recordAudit({
			action: "admin:deleted:college",
			entityType: "college",
			entityId: deletedCollege.id,
			before: { id: deletedCollege.id },
			metadata: { emailDomain: deletedCollege.emailDomain },
		});

		await invalidateCollegeCaches({
			collegeId: deletedCollege.id,
			previousEmailDomain: existing.emailDomain,
		});

		return deletedCollege;
	}
}

export default new CollegeService();
