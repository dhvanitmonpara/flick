const ADMIN_ROLES = new Set(["admin", "superadmin"]);

export const hasAdminAccess = (role?: string | null) => {
  if (!role) return false;
  return ADMIN_ROLES.has(role);
};
