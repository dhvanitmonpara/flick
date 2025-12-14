import { env } from "@/config/env";
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, bookmarks, auditLogs, notifications, posts, comments, feedbacks } from "./tables";

const db = drizzle(env.DATABASE_URL, {
  schema: {
    users,
    bookmarks,
    auditLogs,
    notifications,
    posts,
    comments,
    feedbacks
  },
});

export default db;