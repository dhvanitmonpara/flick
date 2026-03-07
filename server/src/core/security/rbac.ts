import type { Permission, Role } from "@/config/roles";
import { roles } from "@/config/roles";

export function getUserPermissions(userRoles: Role[]): Permission[] {
	const validRoles = userRoles.filter((role) => roles[role]);

	if (validRoles.length === 0) return [];

	const permissions = validRoles.flatMap((role) => roles[role]);

	if (permissions.includes("*")) return ["*"];

	return permissions;
}
