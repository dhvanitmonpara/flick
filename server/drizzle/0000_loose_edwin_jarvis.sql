CREATE TYPE "public"."authType" AS ENUM('manual', 'oauth');--> statement-breakpoint
CREATE TYPE "public"."log_action" AS ENUM('user:upvoted:post', 'user:upvoted:comment', 'user:downvoted:post', 'user:downvoted:comment', 'user:deleted:vote:on:comment', 'user:deleted:vote:on:post', 'user:switched:vote:on:comment', 'user:switched:vote:on:post', 'user:created:post', 'user:updated:post', 'user:created:comment', 'user:updated:comment', 'user:deleted:post', 'user:deleted:comment', 'user:reported:content', 'user:accepted:terms', 'user:initialized:account', 'auth:created:account', 'auth:otp:verify:success', 'auth:otp:verify:failed', 'auth:otp:send', 'user:finished:onboarding', 'user:logged:in:self', 'user:logged:out:self', 'user:created:feedback', 'user:updated:feedback', 'user:deleted:feedback', 'user:forgot:password', 'user:initialized:forgot-password', 'admin:banned:user', 'admin:unbanned:user', 'admin:suspended:user', 'admin:created:college', 'admin:deleted:college', 'admin:updated:college', 'admin:blocked:content', 'admin:unblocked:content', 'admin:shadow:banned:content', 'admin:shadow:unbanned:content', 'admin:updated:content', 'admin:deleted:report', 'admin:bulk-deleted:reports', 'admin:updated:report:status', 'admin:updated:feedback:status', 'admin:deleted:feedback', 'system:created:admin:account', 'admin:logged:out:self', 'admin:initialized:account', 'admin:verified:otp', 'admin:removed:authorized:device', 'admin:reset:email:otp', 'admin:deleted:admin:account', 'admin:updated:admin:account', 'admin:fetched:all:admin:accounts', 'system:logged:error', 'system:logged:in', 'system:logged:out', 'other:action');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('Post', 'Comment');--> statement-breakpoint
CREATE TYPE "public"."log_entity_type" AS ENUM('post', 'comment', 'bookmark', 'college', 'content-report', 'feedback', 'notification', 'user', 'auth', 'vote');--> statement-breakpoint
CREATE TYPE "public"."moderation_severity_enum" AS ENUM('mild', 'moderate', 'severe');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('general', 'upvoted_post', 'upvoted_comment', 'replied', 'posted');--> statement-breakpoint
CREATE TYPE "public"."log_platform" AS ENUM('web', 'mobile', 'tv', 'server', 'other');--> statement-breakpoint
CREATE TYPE "public"."log_role" AS ENUM('user', 'admin', 'superadmin', 'system');--> statement-breakpoint
CREATE TYPE "public"."log_status" AS ENUM('success', 'fail');--> statement-breakpoint
CREATE TYPE "public"."topic_enum" AS ENUM('Ask Flick', 'Serious Discussion', 'Career Advice', 'Showcase', 'Off-topic', 'Community Event', 'Rant / Vent', 'Help / Support', 'Feedback / Suggestion', 'News / Update', 'Guide / Resource');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ONBOARDING', 'ACTIVE');--> statement-breakpoint
CREATE TYPE "public"."vote_entity_enum" AS ENUM('post', 'comment');--> statement-breakpoint
CREATE TYPE "public"."vote_type_enum" AS ENUM('upvote', 'downvote');--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" uuid,
	"actor_type" "log_role" NOT NULL,
	"action" text NOT NULL,
	"entity_type" "log_entity_type" NOT NULL,
	"entity_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"request_id" uuid,
	"reason" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false,
	"role" text,
	"image" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "auth_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "platform_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"auth_id" text NOT NULL,
	"username" text NOT NULL,
	"college_id" uuid NOT NULL,
	"branch" text,
	"karma" integer DEFAULT 0,
	"is_accepted_terms" boolean DEFAULT false NOT NULL,
	"status" "user_status" DEFAULT 'ONBOARDING' NOT NULL,
	CONSTRAINT "platform_user_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "platform_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banned_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" text NOT NULL,
	"strict_mode" boolean DEFAULT false NOT NULL,
	"severity" "moderation_severity_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "banned_words_word_unique" UNIQUE("word")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"emailDomain" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"profile" text DEFAULT 'https://yourcdn.com/default-college-profile.png' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"postId" uuid NOT NULL,
	"commentedBy" uuid NOT NULL,
	"isBanned" boolean DEFAULT false NOT NULL,
	"parentCommentId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "report_type" NOT NULL,
	"post_id" uuid,
	"comment_id" uuid,
	"reported_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seen" boolean DEFAULT false NOT NULL,
	"postId" uuid DEFAULT null,
	"receiverId" text NOT NULL,
	"actorUsernames" jsonb NOT NULL,
	"content" text DEFAULT null,
	"type" "notification_type" DEFAULT 'general' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"postedBy" uuid,
	"topic" "topic_enum" NOT NULL,
	"isPrivate" boolean DEFAULT false NOT NULL,
	"isBanned" boolean DEFAULT false,
	"isShadowBanned" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_type" "vote_entity_enum" NOT NULL,
	"target_id" uuid NOT NULL,
	"vote_type" "vote_type_enum" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_auth_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_user" ADD CONSTRAINT "platform_user_auth_id_auth_id_fk" FOREIGN KEY ("auth_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_user" ADD CONSTRAINT "platform_user_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_auth_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_auth_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_platform_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_commentedBy_platform_user_id_fk" FOREIGN KEY ("commentedBy") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_comments_id_fk" FOREIGN KEY ("parentCommentId") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reported_by_platform_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_platform_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_postedBy_platform_user_id_fk" FOREIGN KEY ("postedBy") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_auth_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_auth_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_platform_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity" ON "logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_occurred_at" ON "logs" USING btree ("occured_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "banned_words_word_idx" ON "banned_words" USING btree ("word");--> statement-breakpoint
CREATE INDEX "banned_words_strict_mode_idx" ON "banned_words" USING btree ("strict_mode");--> statement-breakpoint
CREATE INDEX "bookmark_user_id_idx" ON "bookmarks" USING btree ("userId","postId");--> statement-breakpoint
CREATE INDEX "idx_college_name" ON "colleges" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_college_city_state" ON "colleges" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "posts_visibility_idx" ON "posts" USING btree ("isBanned","isShadowBanned","createdAt" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "user_blocks_unique_idx" ON "user_blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_user_target_unique" ON "votes" USING btree ("user_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "votes_target_lookup_idx" ON "votes" USING btree ("target_type","target_id");