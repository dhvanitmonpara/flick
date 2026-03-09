import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config/env";
import {
	auditLogs,
	auth,
	bannedWords,
	bookmarks,
	branches,
	collegeRequests,
	colleges,
	comments,
	feedbacks,
	notifications,
	posts,
	session,
	users,
	votes,
} from "./tables";

const db = drizzle(env.DATABASE_URL, {
	schema: {
		users,
		bookmarks,
		auditLogs,
		notifications,
		posts,
		comments,
		colleges,
		feedbacks,
		auth,
		votes,
		bannedWords,
		branches,
		collegeRequests,
		session,
	},
});

export default db;
