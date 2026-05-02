import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, gte, lt, sql } from "drizzle-orm";
import { db, allowedUsersTable, userProfilesTable, serviceReportsTable } from "@workspace/db";
import { z } from "zod";
import type { Request, Response } from "express";

const router: IRouter = Router();

router.get("/mobile/users", async (_req: Request, res: Response): Promise<void> => {
  const list = await db
    .select({
      id: allowedUsersTable.id,
      displayName: allowedUsersTable.displayName,
      isSupervisor: allowedUsersTable.isSupervisor,
      defaultShift: userProfilesTable.defaultShift,
    })
    .from(allowedUsersTable)
    .leftJoin(
      userProfilesTable,
      sql`LOWER(${userProfilesTable.displayName}) = LOWER(${allowedUsersTable.displayName})`,
    )
    .orderBy(allowedUsersTable.displayName);
  res.json(list);
});

const CreateMobileReportBody = z.object({
  displayName: z.string().min(1).max(120),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shiftLabel: z.string().default(""),
  serviceActivity: z.string().min(1).max(1000),
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
  notes: z.string().max(1000).default(""),
});

router.post("/mobile/reports", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateMobileReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { displayName, ...reportData } = parsed.data;

  const [allowed] = await db
    .select()
    .from(allowedUsersTable)
    .where(sql`LOWER(${allowedUsersTable.displayName}) = ${displayName.toLowerCase()}`)
    .limit(1);

  if (!allowed) {
    res.status(403).json({ error: "Nombre no autorizado" });
    return;
  }

  if (reportData.guard) {
    const workDate = new Date(reportData.workDate);
    const monthStart = new Date(workDate.getFullYear(), workDate.getMonth(), 1).toISOString().split("T")[0];
    const monthEnd = new Date(workDate.getFullYear(), workDate.getMonth() + 1, 1).toISOString().split("T")[0];
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(serviceReportsTable)
      .where(
        and(
          sql`LOWER(${serviceReportsTable.ownerName}) = ${displayName.toLowerCase()}`,
          eq(serviceReportsTable.guard, true),
          isNull(serviceReportsTable.deletedAt),
          gte(serviceReportsTable.workDate, monthStart),
          lt(serviceReportsTable.workDate, monthEnd),
        )
      );
    if ((countResult?.count ?? 0) >= 4) {
      res.status(409).json({ error: "Ya registraste 4 guardias este mes. El adicional Guardia es semanal (máximo 4 por mes)." });
      return;
    }
  }

  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(sql`LOWER(${userProfilesTable.displayName}) = ${displayName.toLowerCase()}`)
    .limit(1);

  const userId = profile?.userId ?? `mobile_${displayName.toLowerCase().replace(/\s+/g, "_")}`;

  const [report] = await db
    .insert(serviceReportsTable)
    .values({
      ownerUserId: userId,
      ownerName: displayName,
      ownerEmail: profile?.email ?? "",
      technicianName: displayName,
      workDate: reportData.workDate,
      shiftLabel: reportData.shiftLabel,
      serviceActivity: reportData.serviceActivity,
      overtime50Normal: reportData.overtime50Normal,
      overtime50NormalKm40: reportData.overtime50NormalKm40,
      overtime50WeekendHoliday: reportData.overtime50WeekendHoliday,
      overtime50WeekendHolidayKm40: reportData.overtime50WeekendHolidayKm40,
      overtime100Normal: reportData.overtime100Normal,
      overtime100NormalKm40: reportData.overtime100NormalKm40,
      overtime100WeekendHoliday: reportData.overtime100WeekendHoliday,
      overtime100WeekendHolidayKm40: reportData.overtime100WeekendHolidayKm40,
      soloKm40: reportData.soloKm40 || reportData.soloKm40Hours > 0,
      soloKm40Hours: reportData.soloKm40Hours,
      technicalAssistanceGuard: reportData.technicalAssistanceGuard,
      fieldActivation: reportData.fieldActivation,
      guard: reportData.guard,
      notes: reportData.notes,
    })
    .returning();

  res.status(201).json({
    ...report,
    workDate: String(report.workDate).substring(0, 10),
    createdAt: report.createdAt.toISOString(),
    deletedAt: null,
  });
});

router.get("/mobile/reports", async (req: Request, res: Response): Promise<void> => {
  const name = req.query.name as string;
  if (!name) {
    res.status(400).json({ error: "Nombre requerido" });
    return;
  }

  const [allowed] = await db
    .select({ isSupervisor: allowedUsersTable.isSupervisor })
    .from(allowedUsersTable)
    .where(sql`LOWER(${allowedUsersTable.displayName}) = ${name.toLowerCase()}`)
    .limit(1);

  if (!allowed) {
    res.status(403).json({ error: "Nombre no autorizado" });
    return;
  }

  const reports = allowed.isSupervisor
    ? await db.select().from(serviceReportsTable).where(isNull(serviceReportsTable.deletedAt)).orderBy(desc(serviceReportsTable.createdAt))
    : await db.select().from(serviceReportsTable).where(and(
        sql`LOWER(${serviceReportsTable.ownerName}) = ${name.toLowerCase()}`,
        isNull(serviceReportsTable.deletedAt),
      )).orderBy(desc(serviceReportsTable.createdAt));

  res.json(reports.map((r) => ({
    ...r,
    workDate: String(r.workDate).substring(0, 10),
    createdAt: r.createdAt.toISOString(),
    deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
  })));
});

export default router;
