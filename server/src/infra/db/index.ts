import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/config/env";
import {
	auditLogs,
	auth,
	bannedWords,
	bookmarks,
	branches,
	colleges,
	comments,
	feedbacks,
	notifications,
	posts,
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
	},
});

export default db;
