import * as voteAdapter from "@/infra/db/adapters/vote.adapter";
import type { DB } from "@/infra/db/types";
import { cached } from "@/lib/cached";
import voteCacheKeys from "./vote.cache-keys";

const VoteRepo = {
	Read: {
		findByUserAndTarget: voteAdapter.findById,
	},
	CachedRead: {
		findByUserAndTarget: (
			userId: string,
			targetId: string,
			targetType: "post" | "comment",
			dbTx?: DB,
		) =>
			cached(voteCacheKeys.userIdAndTarget(userId, targetId), () =>
				voteAdapter.findByUserAndTarget(userId, targetId, targetType, dbTx),
			),
	},
	Write: {
		create: voteAdapter.create,
		update: voteAdapter.updateById,
		deleteByUserAndTarget: voteAdapter.deleteByUserAndTarget,
	},
};

export default VoteRepo;
