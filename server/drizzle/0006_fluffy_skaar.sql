ALTER TYPE "public"."log_action" ADD VALUE 'user:session:terminated:all' BEFORE 'user:initialized:account';--> statement-breakpoint
ALTER TYPE "public"."log_action" ADD VALUE 'user:logged:in:new:device' BEFORE 'user:created:feedback';--> statement-breakpoint
ALTER TYPE "public"."log_action" ADD VALUE 'user:session:terminated:other' BEFORE 'user:created:feedback';