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

export const toPublicUserWithCollege = (user: UserSelect & { college?: Record<string, unknown> | null }) => ({
	id: user.id,
	username: user.username,
	karma: user.karma,
	collegeId: user.collegeId,
	branch: user.branch,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
	college: user.college ?? null,
});

export const toInternalUser = (user: UserSelect) => ({ ...user });

export type PublicUser = ReturnType<typeof toPublicUser>;
export type PublicUserWithCollege = ReturnType<typeof toPublicUserWithCollege>;
export type InternalUser = ReturnType<typeof toInternalUser>;
