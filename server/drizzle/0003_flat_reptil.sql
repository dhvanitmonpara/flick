CREATE TABLE "college_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collegeId" uuid NOT NULL,
	"branchId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "college_branches" ADD CONSTRAINT "college_branches_collegeId_colleges_id_fk" FOREIGN KEY ("collegeId") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "college_branches" ADD CONSTRAINT "college_branches_branchId_branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_college_branch_unique" ON "college_branches" USING btree ("collegeId","branchId");--> statement-breakpoint
CREATE INDEX "idx_college_branches_college" ON "college_branches" USING btree ("collegeId");--> statement-breakpoint
CREATE INDEX "idx_college_branches_branch" ON "college_branches" USING btree ("branchId");--> statement-breakpoint
CREATE INDEX "idx_college_email_domain" ON "colleges" USING btree ("emailDomain");--> statement-breakpoint
ALTER TABLE "colleges" DROP COLUMN "branches";