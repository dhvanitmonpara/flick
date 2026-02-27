import { Post } from "./Post";
import { User } from "./User";

export interface Comment {
  id: string;
  content: string;
  postId: string | Post;
  commentedBy: string | User;
  isBanned: boolean;
  userVote?: "upvote" | "downvote";
  upvoteCount: number;
  downvoteCount: number;
  parentCommentId?: string | Comment;
  createdAt: string;
  updatedAt: string;
}
