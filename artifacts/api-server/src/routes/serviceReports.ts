import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
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
    (report.soloKm40 ? 1 : 0);
  const totalAdditionalItems =
    toNumber(report.technicalAssistanceGuard) + toNumber(report.fieldActivation);

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
    ...calculateTotals(report),
    createdAt: report.createdAt.toISOString(),
  };
}

router.get("/service-reports", async (_req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(serviceReportsTable)
    .orderBy(desc(serviceReportsTable.createdAt));

  res.json(ListServiceReportsResponse.parse(reports.map(serializeReport)));
});

router.post("/service-reports", async (req, res): Promise<void> => {
  const parsed = CreateServiceReportBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid service report body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db
    .insert(serviceReportsTable)
    .values({
      technicianName: parsed.data.technicianName,
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
      soloKm40: parsed.data.soloKm40,
      technicalAssistanceGuard: parsed.data.technicalAssistanceGuard,
      fieldActivation: parsed.data.fieldActivation,
      notes: parsed.data.notes ?? "",
    })
    .returning();

  res.status(201).json(ListServiceReportsResponseItem.parse(serializeReport(report)));
});

router.patch("/service-reports/:id", async (req, res): Promise<void> => {
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

router.get("/service-reports/summary", async (_req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(serviceReportsTable)
    .orderBy(desc(serviceReportsTable.createdAt));

  const summary = reports.reduce(
    (acc, report) => {
      const totals = calculateTotals(report);
      acc.total50Hours += totals.total50Hours;
      acc.total100Hours += totals.total100Hours;
      acc.totalKm40Items += totals.totalKm40Items;
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
      totalGuardias: 0,
      totalActivaciones: 0,
      latestReportDate: reports[0]?.workDate ?? null,
    },
  );

  res.json(GetServiceReportsSummaryResponse.parse(summary));
});

export default router;