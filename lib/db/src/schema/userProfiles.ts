import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().default(""),
  role: text("role").notNull().default("technician"),
  defaultShift: text("default_shift").notNull().default("Tarde/Cierre"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type UserProfile = typeof userProfilesTable.$inferSelect;
export type InsertUserProfile = typeof userProfilesTable.$inferInsert;
