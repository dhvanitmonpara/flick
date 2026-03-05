import { colleges } from "@/infra/db/tables";

export type CollegeInsert = typeof colleges.$inferInsert
export type CollegeSelect = typeof colleges.$inferSelect
