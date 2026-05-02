import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const allowedUsersTable = pgTable("allowed_users", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  isSupervisor: boolean("is_supervisor").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAllowedUserSchema = createInsertSchema(allowedUsersTable).omit({ id: true, createdAt: true });
export type AllowedUser = typeof allowedUsersTable.$inferSelect;
export type InsertAllowedUser = typeof allowedUsersTable.$inferInsert;
