export interface ReportedPost {
  targetDetails: {
    _id: string;
    title: string;
    content: string;
    postedBy: string;
    isBanned: boolean;
    isShadowBanned: boolean;
  };
  type: "Post" | "Comment"
  reports: Array<{
    _id: string;
    reason: string;
    message: string;
    status: "pending" | "resolved" | "ignored";
    createdAt: string;
    reporter: {
      _id: string;
      username: string;
      isBlocked: boolean;
      suspension: {
        ends: string | null;
        reason: string | null;
        howManyTimes: number;
      };
    };
  }>;
}