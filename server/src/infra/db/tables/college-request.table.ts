import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { colleges } from "./college.table";

export const collegeRequests = pgTable(
	"college_requests",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		name: text("name").notNull(),
		emailDomain: text("emailDomain").notNull(),
		city: text("city").notNull(),
		state: text("state").notNull(),
		requestedByEmail: text("requestedByEmail"),
		status: text("status").notNull().default("pending"),
		resolvedCollegeId: uuid("resolvedCollegeId").references(() => colleges.id, {
			onDelete: "set null",
		}),
		resolvedAt: timestamp("resolvedAt"),
		createdAt: timestamp("createdAt").defaultNow().notNull(),
		updatedAt: timestamp("updatedAt").defaultNow().notNull(),
	},
	(table) => [
		index("idx_college_request_email_domain").on(table.emailDomain),
		index("idx_college_request_status").on(table.status),
	],
);
