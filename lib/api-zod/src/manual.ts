import * as z from "zod";

const UserProfileSchema = z.object({
  id: z.number(),
  userId: z.string(),
  displayName: z.string(),
  email: z.string(),
  role: z.enum(["technician", "supervisor"]),
  defaultShift: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetCurrentProfileResponse = UserProfileSchema;
export const UpdateCurrentProfileResponse = UserProfileSchema;
export const ListUsersResponse = z.array(UserProfileSchema);

export const UpdateCurrentProfileBody = z.object({
  role: z.enum(["technician", "supervisor"]).optional(),
  defaultShift: z.enum(["Mañana", "Tarde/Cierre", "Noche"]).optional(),
  password: z.string().optional(),
}).partial();

const ServiceReportItemSchema = z.object({
  id: z.number(),
  ownerUserId: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().optional().default(""),
  technicianName: z.string(),
  workDate: z.string(),
  shiftLabel: z.string(),
  serviceActivity: z.string(),
  overtime50Normal: z.number(),
  overtime50NormalKm40: z.number(),
  overtime50WeekendHoliday: z.number(),
  overtime50WeekendHolidayKm40: z.number(),
  overtime100Normal: z.number(),
  overtime100NormalKm40: z.number(),
  overtime100WeekendHoliday: z.number(),
  overtime100WeekendHolidayKm40: z.number(),
  soloKm40: z.boolean(),
  soloKm40Hours: z.number(),
  technicalAssistanceGuard: z.number(),
  fieldActivation: z.number(),
  guard: z.boolean(),
  notes: z.string(),
  reviewed: z.boolean(),
  total50Hours: z.number(),
  total100Hours: z.number(),
  totalKm40Items: z.number(),
  totalAdditionalItems: z.number(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  deletedBy: z.string().nullable().optional(),
});

export const ListServiceReportsResponseItem = ServiceReportItemSchema;
export const ListServiceReportsResponse = z.array(ServiceReportItemSchema);
export const UpdateServiceReportResponse = ServiceReportItemSchema;

export const CreateServiceReportBody = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftLabel: z.string().default(""),
  serviceActivity: z.string().min(1).max(2000),
  technicianName: z.string().optional().default(""),
  overtime50Normal: z.number().min(0).max(24).default(0),
  overtime50NormalKm40: z.number().min(0).max(24).default(0),
  overtime50WeekendHoliday: z.number().min(0).max(24).default(0),
  overtime50WeekendHolidayKm40: z.number().min(0).max(24).default(0),
  overtime100Normal: z.number().min(0).max(24).default(0),
  overtime100NormalKm40: z.number().min(0).max(24).default(0),
  overtime100WeekendHoliday: z.number().min(0).max(24).default(0),
  overtime100WeekendHolidayKm40: z.number().min(0).max(24).default(0),
  soloKm40: z.boolean().default(false),
  soloKm40Hours: z.number().min(0).max(24).default(0),
  technicalAssistanceGuard: z.number().min(0).max(24).default(0),
  fieldActivation: z.number().min(0).max(24).default(0),
  guard: z.boolean().default(false),
  notes: z.string().max(2000).default(""),
});

export const UpdateServiceReportParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const UpdateServiceReportBody = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  shiftLabel: z.string().optional(),
  serviceActivity: z.string().min(1).max(2000).optional(),
  technicianName: z.string().optional(),
  overtime50Normal: z.number().min(0).max(24).optional(),
  overtime50NormalKm40: z.number().min(0).max(24).optional(),
  overtime50WeekendHoliday: z.number().min(0).max(24).optional(),
  overtime50WeekendHolidayKm40: z.number().min(0).max(24).optional(),
  overtime100Normal: z.number().min(0).max(24).optional(),
  overtime100NormalKm40: z.number().min(0).max(24).optional(),
  overtime100WeekendHoliday: z.number().min(0).max(24).optional(),
  overtime100WeekendHolidayKm40: z.number().min(0).max(24).optional(),
  soloKm40: z.boolean().optional(),
  soloKm40Hours: z.number().min(0).max(24).optional(),
  technicalAssistanceGuard: z.number().min(0).max(24).optional(),
  fieldActivation: z.number().min(0).max(24).optional(),
  guard: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  reviewed: z.boolean().optional(),
  password: z.string().optional(),
});

export const GetServiceReportsSummaryResponse = z.object({
  technicianName: z.string(),
  total50Hours: z.number(),
  total100Hours: z.number(),
  totalKm40Items: z.number(),
  totalAdditionalItems: z.number(),
  guardCount: z.number(),
  reportCount: z.number(),
}).array().or(z.object({
  technicianName: z.string(),
  total50Hours: z.number(),
  total100Hours: z.number(),
  totalKm40Items: z.number(),
  totalAdditionalItems: z.number(),
  guardCount: z.number(),
  reportCount: z.number(),
}));
