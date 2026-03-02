ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_platform_user_id_fk";
--> statement-breakpoint
ALTER TABLE "content_reports" DROP CONSTRAINT "content_reports_reported_by_platform_user_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_postedBy_platform_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_platform_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reported_by_platform_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_postedBy_platform_user_id_fk" FOREIGN KEY ("postedBy") REFERENCES "public"."platform_user"("id") ON DELETE cascade ON UPDATE no action;