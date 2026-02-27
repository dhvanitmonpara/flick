import { User } from "./User";

export interface Post {
  id: string;
  title: string;
  content: string;
  postedBy: string | User;
  isBanned: boolean;
  isShadowBanned: boolean;
  karma: number;
  userVote?: "upvote" | "downvote";
  upvoteCount: number;
  downvoteCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}
