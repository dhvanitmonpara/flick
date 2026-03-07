import { roleKeys } from "@/config/roles";

export const auditRoles = [...roleKeys, "system"] as const;
