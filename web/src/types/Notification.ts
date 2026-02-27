import { Post } from "./Post";

export type NotificationType =
  | "general"
  | "upvoted_post"
  | "upvoted_comment"
  | "replied"
  | "posted";

export interface Notification {
  id?: string;
  type: NotificationType;
  seen: boolean;
  receiverId: string;
  actorUsernames: string[];
  _retries?: number;
  content?: string;
  postId: string;
  post?: Post | null;
  _redisId: string;
}
