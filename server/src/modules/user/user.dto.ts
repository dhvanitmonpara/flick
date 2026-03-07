import type { UserSelect } from "@/shared/types/User";

export const toPublicUser = (user: UserSelect) => ({
	id: user.id,
	username: user.username,
	karma: user.karma,
	collegeId: user.collegeId,
	branch: user.branch,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

export const toInternalUser = (user: UserSelect) => ({ ...user });

export type PublicUser = ReturnType<typeof toPublicUser>;
export type InternalUser = ReturnType<typeof toInternalUser>;
