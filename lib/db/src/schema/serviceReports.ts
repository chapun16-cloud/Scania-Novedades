import {
  boolean,
  date,
  doublePrecision,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceReportsTable = pgTable("service_reports", {
  id: serial("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull().default("legacy"),
  ownerName: text("owner_name").notNull().default(""),
  ownerEmail: text("owner_email").notNull().default(""),
  technicianName: text("technician_name").notNull(),
  workDate: date("work_date").notNull(),
  shiftLabel: text("shift_label").notNull().default(""),
  serviceActivity: text("service_activity").notNull(),
  overtime50Normal: doublePrecision("overtime_50_normal").notNull().default(0),
  overtime50NormalKm40: doublePrecision("overtime_50_normal_km40")
    .notNull()
    .default(0),
  overtime50WeekendHoliday: doublePrecision("overtime_50_weekend_holiday")
    .notNull()
    .default(0),
  overtime50WeekendHolidayKm40: doublePrecision(
    "overtime_50_weekend_holiday_km40",
  )
    .notNull()
    .default(0),
  overtime100Normal: doublePrecision("overtime_100_normal")
    .notNull()
    .default(0),
  overtime100NormalKm40: doublePrecision("overtime_100_normal_km40")
    .notNull()
    .default(0),
  overtime100WeekendHoliday: doublePrecision("overtime_100_weekend_holiday")
    .notNull()
    .default(0),
  overtime100WeekendHolidayKm40: doublePrecision(
    "overtime_100_weekend_holiday_km40",
  )
    .notNull()
    .default(0),
  soloKm40: boolean("solo_km40").notNull().default(false),
  soloKm40Hours: doublePrecision("solo_km40_hours").notNull().default(0),
  technicalAssistanceGuard: doublePrecision("technical_assistance_guard")
    .notNull()
    .default(0),
  fieldActivation: doublePrecision("field_activation").notNull().default(0),
  embarqueHours: doublePrecision("embarque_hours").notNull().default(0),
  guard: boolean("guard").notNull().default(false),
  reviewed: boolean("reviewed").notNull().default(false),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
});

export const insertServiceReportSchema = createInsertSchema(
  serviceReportsTable,
).omit({
  id: true,
  reviewed: true,
  createdAt: true,
});

export type InsertServiceReport = z.infer<typeof insertServiceReportSchema>;
export type ServiceReport = typeof serviceReportsTable.$inferSelect;
