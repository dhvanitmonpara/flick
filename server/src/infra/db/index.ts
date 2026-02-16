import { env } from "@/config/env";
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, auth, bookmarks, auditLogs, colleges, notifications, posts, comments, feedbacks, votes } from "./tables";

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
    votes
  },
});

export default db;