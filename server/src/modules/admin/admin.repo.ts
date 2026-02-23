import { AdminAdapter } from "@/infra/db/adapters";
import { DB } from "@/infra/db/types";

const AdminRepo = {
  Read: {
    getManageUsersQuery: (username?: string, email?: string, dbTx?: DB) => AdminAdapter.getManageUsersQuery(username, email, dbTx)
  },
  Write: {}
};

export default AdminRepo;
