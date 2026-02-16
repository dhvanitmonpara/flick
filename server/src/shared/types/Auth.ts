import { auth } from "@/infra/db/tables";

export type AuthInsert = typeof auth.$inferInsert
export type AuthSelect = typeof auth.$inferSelect