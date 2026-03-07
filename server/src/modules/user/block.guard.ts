import { HttpError } from "@/core/http";
import type { DB } from "@/infra/db/types";
import UserRepo from "./user.repo";

export const assertNoBlockRelationBetweenUsers = async (
	requesterUserId: string,
	targetUserId: string,
	source: string,
	dbTx?: DB,
) => {
	if (requesterUserId === targetUserId) return;

	const [requester, target] = await Promise.all([
		UserRepo.Read.findById(requesterUserId, {}, dbTx),
		UserRepo.Read.findById(targetUserId, {}, dbTx),
	]);

	if (!requester || !target) {
		throw HttpError.notFound("User not found", {
			code: "USER_NOT_FOUND",
			meta: { source },
		});
	}

	const hasBlockRelation = await UserRepo.Blocks.hasBlockRelation(
		requester.authId,
		target.authId,
		dbTx,
	);

	if (hasBlockRelation) {
		throw HttpError.forbidden(
			"You cannot interact with this user due to block settings",
			{
				code: "USER_INTERACTION_BLOCKED",
				meta: { source, requesterUserId, targetUserId },
			},
		);
	}
};
