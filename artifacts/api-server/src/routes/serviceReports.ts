import { Router, type IRouter } from "express";
import { and, desc, eq, isNull, isNotNull } from "drizzle-orm";
import {
  CreateServiceReportBody,
  GetServiceReportsSummaryResponse,
  ListServiceReportsResponseItem,
  ListServiceReportsResponse,
  UpdateServiceReportBody,
  UpdateServiceReportParams,
  UpdateServiceReportResponse,
} from "@workspace/api-zod";
import { db, serviceReportsTable, type ServiceReport } from "@workspace/db";
import { getOrCreateProfile, requireAuth, type AppRequest } from "./profiles";
import { clerkClient } from "@clerk/express";
import { z } from "zod";

const router: IRouter = Router();

const hourFields = [
  "overtime50Normal",
  "overtime50NormalKm40",
  "overtime50WeekendHoliday",
  "overtime50WeekendHolidayKm40",
  "overtime100Normal",
  "overtime100NormalKm40",
  "overtime100WeekendHoliday",
  "overtime100WeekendHolidayKm40",
  "soloKm40Hours",
  "technicalAssistanceGuard",
  "fieldActivation",
] as const;

function toNumber(value: number | null | undefined): number {
  return Number(value ?? 0);
}

function calculateTotals(report: Pick<ServiceReport, (typeof hourFields)[number] | "soloKm40">) {
  const total50Hours =
    toNumber(report.overtime50Normal) +
    toNumber(report.overtime50NormalKm40) +
    toNumber(report.overtime50WeekendHoliday) +
    toNumber(report.overtime50WeekendHolidayKm40);
  const total100Hours =
    toNumber(report.overtime100Normal) +
    toNumber(report.overtime100NormalKm40) +
    toNumber(report.overtime100WeekendHoliday) +
    toNumber(report.overtime100WeekendHolidayKm40);
  const totalKm40Items =
    (toNumber(report.overtime50NormalKm40) > 0 ? 1 : 0) +
    (toNumber(report.overtime50WeekendHolidayKm40) > 0 ? 1 : 0) +
    (toNumber(report.overtime100NormalKm40) > 0 ? 1 : 0) +
    (toNumber(report.overtime100WeekendHolidayKm40) > 0 ? 1 : 0) +
    (toNumber(report.soloKm40Hours) > 0 || report.soloKm40 ? 1 : 0);
  const totalAdditionalItems =
    toNumber(report.soloKm40Hours) +
    toNumber(report.technicalAssistanceGuard) +
    toNumber(report.fieldActivation);

  return {
    total50Hours,
    total100Hours,
    totalKm40Items,
    totalAdditionalItems,
  };
}

function serializeReport(report: ServiceReport) {
  return {
    ...report,
    ownerName: report.ownerName || report.technicianName || "",
    ownerEmail: report.ownerEmail || "",
    technicianName: report.technicianName || report.ownerName || "",
    shiftLabel: report.shiftLabel || "",
    serviceActivity: report.serviceActivity || "",
    notes: report.notes || "",
    overtime50Normal: toNumber(report.overtime50Normal),
    overtime50NormalKm40: toNumber(report.overtime50NormalKm40),
    overtime50WeekendHoliday: toNumber(report.overtime50WeekendHoliday),
    overtime50WeekendHolidayKm40: toNumber(report.overtime50WeekendHolidayKm40),
    overtime100Normal: toNumber(report.overtime100Normal),
    overtime100NormalKm40: toNumber(report.overtime100NormalKm40),
    overtime100WeekendHoliday: toNumber(report.overtime100WeekendHoliday),
    overtime100WeekendHolidayKm40: toNumber(report.overtime100WeekendHolidayKm40),
    soloKm40: report.soloKm40 ?? false,
    soloKm40Hours: toNumber(report.soloKm40Hours),
    technicalAssistanceGuard: toNumber(report.technicalAssistanceGuard),
    fieldActivation: toNumber(report.fieldActivation),
    reviewed: report.reviewed ?? false,
    ...calculateTotals(report),
    createdAt: report.createdAt.toISOString(),
    deletedAt: report.deletedAt ? report.deletedAt.toISOString() : null,
    deletedBy: report.deletedBy ?? null,
  };
}

async function getVisibleReports(req: AppRequest): Promise<ServiceReport[]> {
  const profile = await getOrCreateProfile(req);

  if (profile.role === "supervisor") {
    return db
      .select()
      .from(serviceReportsTable)
      .where(isNull(serviceReportsTable.deletedAt))
      .orderBy(desc(serviceReportsTable.createdAt));
  }

  return db
    .select()
    .from(serviceReportsTable)
    .where(
      and(
        eq(serviceReportsTable.ownerUserId, req.userId!),
        isNull(serviceReportsTable.deletedAt),
      )
    )
    .orderBy(desc(serviceReportsTable.createdAt));
}

router.get("/service-reports", requireAuth, async (req: AppRequest, res): Promise<void> => {
  try {
    const reports = await getVisibleReports(req);
    res.json(ListServiceReportsResponse.parse(reports.map(serializeReport)));
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }
});

router.post("/service-reports", requireAuth, async (req: AppRequest, res): Promise<void> => {
  let profile;
  try { profile = await getOrCreateProfile(req); }
  catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }
  const parsed = CreateServiceReportBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid service report body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const technicianName = parsed.data.technicianName || profile.displayName;

  const [report] = await db
    .insert(serviceReportsTable)
    .values({
      ownerUserId: profile.userId,
      ownerName: profile.displayName || technicianName,
      ownerEmail: profile.email,
      technicianName,
      workDate: parsed.data.workDate,
      shiftLabel: parsed.data.shiftLabel ?? "",
      serviceActivity: parsed.data.serviceActivity,
      overtime50Normal: parsed.data.overtime50Normal,
      overtime50NormalKm40: parsed.data.overtime50NormalKm40,
      overtime50WeekendHoliday: parsed.data.overtime50WeekendHoliday,
      overtime50WeekendHolidayKm40: parsed.data.overtime50WeekendHolidayKm40,
      overtime100Normal: parsed.data.overtime100Normal,
      overtime100NormalKm40: parsed.data.overtime100NormalKm40,
      overtime100WeekendHoliday: parsed.data.overtime100WeekendHoliday,
      overtime100WeekendHolidayKm40: parsed.data.overtime100WeekendHolidayKm40,
      soloKm40: parsed.data.soloKm40 || parsed.data.soloKm40Hours > 0,
      soloKm40Hours: parsed.data.soloKm40Hours,
      technicalAssistanceGuard: parsed.data.technicalAssistanceGuard,
      fieldActivation: parsed.data.fieldActivation,
      notes: parsed.data.notes ?? "",
    })
    .returning();

  res.status(201).json(ListServiceReportsResponseItem.parse(serializeReport(report)));
});

router.patch("/service-reports/:id", requireAuth, async (req: AppRequest, res): Promise<void> => {
  let profile;
  try { profile = await getOrCreateProfile(req); }
  catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }
  if (profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede revisar partes" });
    return;
  }

  const params = UpdateServiceReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateServiceReportBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid service report update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .update(serviceReportsTable)
    .set(parsed.data)
    .where(eq(serviceReportsTable.id, params.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Parte no encontrado" });
    return;
  }

  res.json(UpdateServiceReportResponse.parse(serializeReport(report)));
});

// ─── DELETE (soft-delete) ─────────────────────────────────────────────────────
const DeleteServiceReportBody = z.object({ password: z.string().min(1) });

router.delete("/service-reports/:id", requireAuth, async (req: AppRequest, res): Promise<void> => {
  let profile;
  try { profile = await getOrCreateProfile(req); }
  catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }
  if (profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede borrar partes" });
    return;
  }

  const idRaw = Number(req.params.id);
  if (!idRaw || isNaN(idRaw)) { res.status(400).json({ error: "ID inválido" }); return; }

  const parsed = DeleteServiceReportBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Contraseña requerida" }); return; }

  // Verify user's Clerk password
  try {
    const result = await clerkClient.users.verifyPassword({
      userId: req.userId!,
      password: parsed.data.password,
    });
    if (!result.verified) {
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }
  } catch {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }

  // Only pending (not reviewed) reports can be deleted
  const [existing] = await db
    .select()
    .from(serviceReportsTable)
    .where(eq(serviceReportsTable.id, idRaw))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Parte no encontrado" }); return; }
  if (existing.deletedAt) { res.status(409).json({ error: "El parte ya fue borrado" }); return; }
  if (existing.reviewed) { res.status(409).json({ error: "No se puede borrar un parte ya aprobado" }); return; }

  await db
    .update(serviceReportsTable)
    .set({ deletedAt: new Date(), deletedBy: profile.displayName })
    .where(eq(serviceReportsTable.id, idRaw));

  res.status(200).json({ ok: true });
});

// ─── GET deleted reports (supervisor only) ────────────────────────────────────
router.get("/service-reports/deleted", requireAuth, async (req: AppRequest, res): Promise<void> => {
  let profile;
  try { profile = await getOrCreateProfile(req); }
  catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }
  if (profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede ver los partes borrados" });
    return;
  }

  const deleted = await db
    .select()
    .from(serviceReportsTable)
    .where(isNotNull(serviceReportsTable.deletedAt))
    .orderBy(desc(serviceReportsTable.deletedAt));

  res.json(deleted.map(serializeReport));
});

router.get("/service-reports/summary", requireAuth, async (req: AppRequest, res): Promise<void> => {
  let reports;
  try { reports = await getVisibleReports(req); }
  catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    if (e.statusCode === 403) { res.status(403).json({ error: e.message }); return; }
    throw err;
  }

  const summary = reports.reduce(
    (acc, report) => {
      const totals = calculateTotals(report);
      acc.total50Hours += totals.total50Hours;
      acc.total100Hours += totals.total100Hours;
      acc.totalKm40Items += totals.totalKm40Items;
      acc.totalSoloKm40Hours += toNumber(report.soloKm40Hours);
      acc.totalGuardias += toNumber(report.technicalAssistanceGuard);
      acc.totalActivaciones += toNumber(report.fieldActivation);
      if (report.reviewed) {
        acc.reviewedReports += 1;
      } else {
        acc.pendingReview += 1;
      }
      return acc;
    },
    {
      totalReports: reports.length,
      pendingReview: 0,
      reviewedReports: 0,
      total50Hours: 0,
      total100Hours: 0,
      totalKm40Items: 0,
      totalSoloKm40Hours: 0,
      totalGuardias: 0,
      totalActivaciones: 0,
      latestReportDate: reports[0]?.workDate ?? null,
    },
  );

  res.json(GetServiceReportsSummaryResponse.parse(summary));
});

export default router;
