import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import * as collegeSchemas from "./college.schema";
import collegeService from "./college.service";

@Controller()
class CollegeController {
	static async createCollege(req: Request) {
		const { name, emailDomain, city, state, profile, branches } =
			collegeSchemas.CreateCollegeSchema.parse(req.body);

		const newCollege = await collegeService.createCollege({
			name,
			emailDomain,
			city,
			state,
			profile,
			branches,
		});

		return HttpResponse.created("College created successfully", {
			college: newCollege,
		});
	}

	static async getColleges(req: Request) {
		const { city, state } = collegeSchemas.CollegeFiltersSchema.parse(
			req.query,
		);

		const colleges = await collegeService.getColleges({ city, state });

		return HttpResponse.ok("Colleges retrieved successfully", {
			colleges,
			count: colleges.length,
		});
	}

	static async getCollegeById(req: Request) {
		const { id } = collegeSchemas.CollegeIdSchema.parse(req.params);

		const college = await collegeService.getCollegeById(id);

		return HttpResponse.ok("College retrieved successfully", {
			college,
		});
	}

	static async getCollegeBranches(req: Request) {
		const { id } = collegeSchemas.CollegeIdSchema.parse(req.params);

		const branches = await collegeService.getCollegeBranches(id);

		return HttpResponse.ok("College branches retrieved successfully", {
			branches,
		});
	}

	static async createCollegeRequest(req: Request) {
		const request = collegeSchemas.CreateCollegeRequestSchema.parse(req.body);

		const createdRequest = await collegeService.createCollegeRequest(request);

		return HttpResponse.created("College request submitted successfully", {
			request: createdRequest,
		});
	}

	static async getCollegeRequests() {
		const requests = await collegeService.getCollegeRequests();

		return HttpResponse.ok("College requests retrieved successfully", {
			requests,
		});
	}

	static async updateCollegeRequest(req: Request) {
		const { id } = collegeSchemas.CollegeIdSchema.parse(req.params);
		const updates = collegeSchemas.UpdateCollegeRequestSchema.parse(req.body);

		const request = await collegeService.updateCollegeRequest(id, updates);

		return HttpResponse.ok("College request updated successfully", {
			request,
		});
	}

	static async updateCollege(req: Request) {
		const { id } = collegeSchemas.CollegeIdSchema.parse(req.params);
		const updates = collegeSchemas.UpdateCollegeSchema.parse(req.body);

		const updatedCollege = await collegeService.updateCollege(id, updates);

		return HttpResponse.ok("College updated successfully", {
			college: updatedCollege,
		});
	}

	static async deleteCollege(req: Request) {
		const { id } = collegeSchemas.CollegeIdSchema.parse(req.params);

		await collegeService.deleteCollege(id);

		return HttpResponse.ok("College deleted successfully");
	}
}

export default CollegeController;
