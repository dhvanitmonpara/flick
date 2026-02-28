import { pgEnum } from "drizzle-orm/pg-core";
import { auditActions } from "@/shared/constants/audit/actions";
import { auditPlatforms } from "@/shared/constants/audit/platform";
import { auditStatus } from "@/shared/constants/audit/status";
import { auditEntityTypes } from "@/shared/constants/audit/entity";
import { auditRoles } from "@/shared/constants/audit/roles";

export const AuthTypeEnum = pgEnum("authType", ["manual", "oauth"]);

export const roleEnum = pgEnum("log_role", auditRoles);
export const platformEnum = pgEnum("log_platform", auditPlatforms);
export const statusEnum = pgEnum("log_status", auditStatus);
export const actionEnum = pgEnum("log_action", auditActions);
export const entityEnum = pgEnum("log_entity_type", auditEntityTypes);

export const contentReportTypeEnum = pgEnum("report_type", ["Post", "Comment"])

export const notificationType = pgEnum("notification_type", [
  "general",
  "upvoted_post",
  "upvoted_comment",
  "replied",
  "posted",
]);

export const userStatusEnum = pgEnum("user_status", [
  "ONBOARDING",
  "ACTIVE",
]);

export const topicEnum = pgEnum("topic_enum", [
  "Ask Flick", // AMA-style Q&A
  "Serious Discussion", // Longform thought, critical debate
  "Career Advice", // Jobs, interviews, tech growth
  "Showcase", // Demos, projects, portfolios
  "Off-topic", // Memes, casual chatter
  "Community Event", // Fests, announcements, contests
  "Rant / Vent", // Emotional unloads, safe zone
  "Help / Support", // “Stuck on X”, troubleshooting
  "Feedback / Suggestion", // Feature requests, bug reports
  "News / Update", // Industry news, changelogs, announcements
  "Guide / Resource", // Tutorials, resources, link dumps
]);

export const voteTypeEnum = pgEnum("vote_type_enum", [
  "upvote",
  "downvote",
]);

export const voteEntityEnum = pgEnum("vote_entity_enum", [
  "post",
  "comment",
]);
