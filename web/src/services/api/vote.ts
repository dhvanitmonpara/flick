import { http } from "../http";

type VoteTargetType = "post" | "comment";
type VoteType = "upvote" | "downvote";

export const voteApi = {
  create: async (payload: {
    voteType: VoteType;
    targetId: string;
    targetType: VoteTargetType;
  }) => {
    return http.post("/votes", payload);
  },
  update: async (payload: {
    voteType: VoteType;
    targetId: string;
    targetType: VoteTargetType;
  }) => {
    return http.patch("/votes", payload, {
      headers: { "Content-Type": "application/json" },
    });
  },
  remove: async (payload: { targetId: string; targetType: VoteTargetType }) => {
    return http.delete("/votes", { data: payload });
  },
};
