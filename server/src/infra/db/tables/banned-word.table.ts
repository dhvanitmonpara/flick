import { index, pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { moderationSeverityEnum } from "./enums";

export const bannedWords = pgTable("banned_words", {
  id: uuid("id").primaryKey().defaultRandom(),
  word: text("word").notNull().unique(),
  strictMode: boolean("strict_mode").notNull().default(false),
  severity: moderationSeverityEnum("severity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("banned_words_word_idx").on(table.word),
  index("banned_words_strict_mode_idx").on(table.strictMode),
]);
