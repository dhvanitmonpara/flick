import type { users } from "@/infra/db/tables";

export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
