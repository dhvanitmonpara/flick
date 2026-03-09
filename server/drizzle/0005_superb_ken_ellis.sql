CREATE TABLE "college_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"emailDomain" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"requestedByEmail" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"resolvedCollegeId" uuid,
	"resolvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "actor_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "logs" ALTER COLUMN "entity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "college_requests" ADD CONSTRAINT "college_requests_resolvedCollegeId_colleges_id_fk" FOREIGN KEY ("resolvedCollegeId") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_college_request_email_domain" ON "college_requests" USING btree ("emailDomain");--> statement-breakpoint
CREATE INDEX "idx_college_request_status" ON "college_requests" USING btree ("status");