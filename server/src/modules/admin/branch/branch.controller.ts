import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import * as branchSchemas from "./branch.schema";
import branchService from "./branch.service";

@Controller()
class BranchController {
	static async getAllBranches() {
		const branches = await branchService.getAllBranches();
		return HttpResponse.ok("Branches retrieved successfully", branches);
	}

	static async createBranch(req: Request) {
		const data = branchSchemas.CreateBranchSchema.parse(req.body);
		const newBranch = await branchService.createBranch(data);
		return HttpResponse.created("Branch created successfully", newBranch);
	}

	static async updateBranch(req: Request) {
		const { id } = branchSchemas.BranchIdSchema.parse(req.params);
		const data = branchSchemas.UpdateBranchSchema.parse(req.body);
		const updatedBranch = await branchService.updateBranch(id, data);
		return HttpResponse.ok("Branch updated successfully", updatedBranch);
	}

	static async deleteBranch(req: Request) {
		const { id } = branchSchemas.BranchIdSchema.parse(req.params);
		await branchService.deleteBranch(id);
		return HttpResponse.ok("Branch deleted successfully");
	}
}

export default BranchController;
