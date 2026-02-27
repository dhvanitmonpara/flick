import { User } from "./User";
import { PostTopic } from "@/types/postTopics";

export interface Post {
  id: string;
  title: string;
  content: string;
  postedBy: string | User | null;
  isBanned: boolean;
  isShadowBanned: boolean;
  karma: number;
  userVote?: "upvote" | "downvote";
  bookmarked?: boolean;
  upvoteCount: number;
  downvoteCount: number;
  views: number;
  commentsCount?: number;
  topic: PostTopic;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}
