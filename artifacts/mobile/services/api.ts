const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/mobile`;

export type AllowedUser = {
  id: number;
  displayName: string;
  isSupervisor: boolean;
  defaultShift: string | null;
};

export type ServiceReport = {
  id: number;
  ownerUserId: string;
  ownerName: string;
  technicianName: string;
  workDate: string;
  shiftLabel: string;
  serviceActivity: string;
  overtime50Normal: number;
  overtime50NormalKm40: number;
  overtime50WeekendHoliday: number;
  overtime50WeekendHolidayKm40: number;
  overtime100Normal: number;
  overtime100NormalKm40: number;
  overtime100WeekendHoliday: number;
  overtime100WeekendHolidayKm40: number;
  soloKm40: boolean;
  soloKm40Hours: number;
  technicalAssistanceGuard: number;
  fieldActivation: number;
  guard: boolean;
  notes: string;
  reviewed: boolean;
  createdAt: string;
  deletedAt: string | null;
};

export type CreateReportData = Omit<ServiceReport, "id" | "ownerUserId" | "reviewed" | "createdAt" | "deletedAt"> & {
  displayName: string;
};

export async function fetchAllowedUsers(): Promise<AllowedUser[]> {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json() as Promise<AllowedUser[]>;
}

export async function fetchMyReports(name: string): Promise<ServiceReport[]> {
  const res = await fetch(`${BASE}/reports?name=${encodeURIComponent(name)}`);
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Error al cargar partes");
  }
  return res.json() as Promise<ServiceReport[]>;
}

export async function createReport(data: CreateReportData): Promise<ServiceReport> {
  const res = await fetch(`${BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Error al crear parte");
  }
  return res.json() as Promise<ServiceReport>;
}

export function totalHours50(r: ServiceReport): number {
  return (r.overtime50Normal ?? 0) + (r.overtime50NormalKm40 ?? 0) + (r.overtime50WeekendHoliday ?? 0) + (r.overtime50WeekendHolidayKm40 ?? 0);
}

export function totalHours100(r: ServiceReport): number {
  return (r.overtime100Normal ?? 0) + (r.overtime100NormalKm40 ?? 0) + (r.overtime100WeekendHoliday ?? 0) + (r.overtime100WeekendHolidayKm40 ?? 0);
}
