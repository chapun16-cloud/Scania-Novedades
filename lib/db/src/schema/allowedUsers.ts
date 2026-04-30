import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const allowedUsersTable = pgTable("allowed_users", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  isSupervisor: boolean("is_supervisor").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AllowedUser = typeof allowedUsersTable.$inferSelect;
