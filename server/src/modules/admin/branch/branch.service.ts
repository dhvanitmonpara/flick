import db from "@/infra/db";
import { branches } from "@/infra/db/tables/branch.table";
import { eq } from "drizzle-orm";
import { CreateBranchType, UpdateBranchType } from "./branch.schema";

class BranchService {
  async getAllBranches() {
    return await db.select().from(branches);
  }

  async createBranch(data: CreateBranchType) {
    const [newBranch] = await db.insert(branches).values(data).returning();
    return newBranch;
  }

  async updateBranch(id: string, data: UpdateBranchType) {
    const [updatedBranch] = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return updatedBranch;
  }

  async deleteBranch(id: string) {
    await db.delete(branches).where(eq(branches.id, id));
  }
}

export default new BranchService();
