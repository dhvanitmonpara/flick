import { AdminAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";

const AdminRepo = {
  Read: {
    getManageUsersQuery: (username?: string, email?: string, dbTx?: DB) => AdminAdapter.getManageUsersQuery(username, email, dbTx),
    getReports: (page: number, limit: number, statuses: string[], dbTx?: DB) => AdminAdapter.getReports(page, limit, statuses, dbTx),
    getAllColleges: (dbTx?: DB) => AdminAdapter.getAllColleges(dbTx),
    getLogs: (page: number, limit: number, sortBy: string, sortOrder: "asc" | "desc", dbTx?: DB) => AdminAdapter.getLogs(page, limit, sortBy, sortOrder, dbTx),
    getAllFeedbacks: (dbTx?: DB) => AdminAdapter.getAllFeedbacks(dbTx),
  },
  Write: {
    createCollege: (data: { name: string; emailDomain: string; city: string; state: string }, dbTx?: DB) => AdminAdapter.createCollege(data, dbTx),
    updateCollege: (id: string, updates: Partial<{ name: string; emailDomain: string; city: string; state: string }>, dbTx?: DB) => AdminAdapter.updateCollege(id, updates, dbTx),
  }
};

export default AdminRepo;
