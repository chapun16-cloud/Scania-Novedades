import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const serviceReportsTable = pgTable("service_reports", {
  id: serial("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull().default(""),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull().default(""),
  technicianName: text("technician_name").notNull(),
  workDate: text("work_date").notNull(),
  shiftLabel: text("shift_label").notNull().default(""),
  serviceActivity: text("service_activity").notNull().default(""),
  overtime50Normal: integer("overtime_50_normal").notNull().default(0),
  overtime50NormalKm40: integer("overtime_50_normal_km40").notNull().default(0),
  overtime50WeekendHoliday: integer("overtime_50_weekend_holiday").notNull().default(0),
  overtime50WeekendHolidayKm40: integer("overtime_50_weekend_holiday_km40").notNull().default(0),
  overtime100Normal: integer("overtime_100_normal").notNull().default(0),
  overtime100NormalKm40: integer("overtime_100_normal_km40").notNull().default(0),
  overtime100WeekendHoliday: integer("overtime_100_weekend_holiday").notNull().default(0),
  overtime100WeekendHolidayKm40: integer("overtime_100_weekend_holiday_km40").notNull().default(0),
  soloKm40: boolean("solo_km40").notNull().default(false),
  soloKm40Hours: integer("solo_km40_hours").notNull().default(0),
  technicalAssistanceGuard: integer("technical_assistance_guard").notNull().default(0),
  fieldActivation: integer("field_activation").notNull().default(0),
  guard: boolean("guard").notNull().default(false),
  notes: text("notes").notNull().default(""),
  reviewed: boolean("reviewed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
});

export const insertServiceReportSchema = createInsertSchema(serviceReportsTable).omit({ id: true, createdAt: true, deletedAt: true, deletedBy: true });
export type ServiceReport = typeof serviceReportsTable.$inferSelect;
export type InsertServiceReport = typeof serviceReportsTable.$inferInsert;
