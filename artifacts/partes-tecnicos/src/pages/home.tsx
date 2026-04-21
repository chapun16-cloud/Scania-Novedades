import { useState } from "react";
import {
  getGetCurrentProfileQueryKey,
  getListServiceReportsQueryKey,
  useGetCurrentProfile,
  useListServiceReports,
  useUpdateCurrentProfile,
  type ServiceReport,
  type ServiceReportsSummary,
} from "@workspace/api-client-react";
import { DashboardSummary } from "@/components/dashboard-summary";
import { ReportForm } from "@/components/report-form";
import { ReportsList } from "@/components/reports-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { Wrench, LayoutDashboard, LogOut, FileSpreadsheet, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { exportReportsToExcel, exportDeletedReportsToExcel, type DeletedReport } from "@/lib/exportExcel";

const BASE_API = import.meta.env.BASE_URL.replace(/\/$/, "");
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

async function fetchDeletedReports(): Promise<DeletedReport[]> {
  const res = await fetch(`${BASE_API}/api/service-reports/deleted`, { credentials: "include" });
  if (!res.ok) throw new Error("No se pudo cargar el historial de borrados");
  return res.json();
}

function filterByMonth(reports: ServiceReport[], year: number, month: number): ServiceReport[] {
  return reports.filter((r) => {
    const d = new Date(r.workDate + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function computeSummary(reports: ServiceReport[]): ServiceReportsSummary {
  const s = {
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
  };
  for (const r of reports) {
    if (r.reviewed) s.reviewedReports++; else s.pendingReview++;
    s.total50Hours += Number(r.total50Hours ?? 0);
    s.total100Hours += Number(r.total100Hours ?? 0);
    s.totalSoloKm40Hours += Number(r.soloKm40Hours ?? 0);
    s.totalGuardias += Number(r.technicalAssistanceGuard ?? 0);
    s.totalActivaciones += Number(r.fieldActivation ?? 0);
  }
  return s;
}

function MonthSelector({
  year, month, onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const now = new Date();

  function prev() {
    if (month === 0) onChange(year - 1, 11);
    else onChange(year, month - 1);
  }

  function next() {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth())) return;
    onChange(nextY, nextM);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="min-w-[150px] text-center">
        <span className="font-semibold text-sm">{MESES[month]} {year}</span>
        {isCurrentMonth && (
          <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">actual</span>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={next} disabled={isCurrentMonth} className="h-8 w-8">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function Home() {
  const { signOut } = useClerk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isLoadingProfile } = useGetCurrentProfile();
  const { data: allReports, isLoading: isLoadingReports } = useListServiceReports();
  const updateProfile = useUpdateCurrentProfile();
  const isSupervisor = profile?.role === "supervisor";

  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());

  const { data: deletedReports, isLoading: isLoadingDeleted } = useQuery({
    queryKey: ["service-reports-deleted"],
    queryFn: fetchDeletedReports,
    enabled: isSupervisor,
    staleTime: 30_000,
  });

  const [isExportingDeleted, setIsExportingDeleted] = useState(false);

  const filteredReports = allReports ? filterByMonth(allReports, selYear, selMonth) : [];
  const summary = computeSummary(filteredReports);

  function changeMonth(year: number, month: number) {
    setSelYear(year);
    setSelMonth(month);
  }

  function changeRole(role: "technician" | "supervisor") {
    updateProfile.mutate(
      { data: { role } },
      {
        onSuccess: () => {
          toast({ title: "Perfil actualizado" });
          queryClient.invalidateQueries({ queryKey: getGetCurrentProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListServiceReportsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo cambiar el perfil.", variant: "destructive" });
        },
      },
    );
  }

  async function handleExportDeleted() {
    setIsExportingDeleted(true);
    try {
      const data = await fetchDeletedReports();
      if (!data || data.length === 0) {
        toast({ title: "Sin datos", description: "No hay partes borrados para exportar." });
        return;
      }
      exportDeletedReportsToExcel(data);
    } catch {
      toast({ title: "Error", description: "No se pudo exportar.", variant: "destructive" });
    } finally {
      setIsExportingDeleted(false);
    }
  }

  if (isLoadingProfile || !profile) {
    return (
      <div className="min-h-[100dvh] bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="bg-secondary text-secondary-foreground py-4 px-6 sticky top-0 z-10 border-b border-secondary-border shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SCANIA</h1>
              <p className="text-xs text-secondary-foreground/70 font-mono">
                {isSupervisor ? "PANEL SUPERVISOR DE EQUIPO" : "PANEL TÉCNICO PERSONAL"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-sm font-semibold leading-tight">{profile.displayName}</p>
              <p className="text-xs text-secondary-foreground/70">{profile.email || "Usuario registrado"}</p>
            </div>
            <Select value={profile.role} onValueChange={changeRole} disabled={updateProfile.isPending}>
              <SelectTrigger className="w-[160px] bg-secondary-foreground text-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technician">Técnico</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={() => signOut({ redirectUrl: basePath || "/" })}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <Tabs defaultValue={isSupervisor ? "dashboard" : "submit"} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="submit" className="font-medium px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wrench className="w-4 h-4 mr-2" />
                Nuevo Parte
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="font-medium px-6 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                {isSupervisor ? "Dashboard & Revisión" : "Mi Historial"}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Nuevo Parte ── */}
          <TabsContent value="submit" className="mt-0 outline-none">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/30">
                <h2 className="text-lg font-semibold">Registro de Actividad</h2>
                <p className="text-sm text-muted-foreground">Complete los datos del turno y horas extras.</p>
              </div>
              <div className="p-6">
                <ReportForm defaultTechnicianName={profile.displayName} />
              </div>
            </div>
          </TabsContent>

          {/* ── Dashboard / Historial ── */}
          <TabsContent value="dashboard" className="mt-0 outline-none space-y-6">

            {/* Month selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl px-5 py-3 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-secondary">Período</p>
                <p className="text-xs text-muted-foreground">Usá las flechas para navegar entre meses</p>
              </div>
              <MonthSelector year={selYear} month={selMonth} onChange={changeMonth} />
            </div>

            {/* Summary cards — computed from filtered reports */}
            {isLoadingReports ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
              </div>
            ) : (
              <DashboardSummary summary={summary} />
            )}

            {/* Active reports list */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {isSupervisor ? "Partes del Equipo" : "Mis Partes"} — {MESES[selMonth]} {selYear}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredReports.length} parte{filteredReports.length !== 1 ? "s" : ""} en este mes.
                  </p>
                </div>
                {isSupervisor && filteredReports.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportReportsToExcel(filteredReports, `Novedades_SCANIA_${String(selMonth + 1).padStart(2, "0")}_${selYear}.xlsx`)}
                    className="shrink-0 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                )}
              </div>
              <div className="p-0">
                {isLoadingReports ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : (
                  <ReportsList reports={filteredReports} canReview={isSupervisor} />
                )}
              </div>
            </div>

            {/* Deleted reports — supervisor only */}
            {isSupervisor && (
              <div className="bg-card border border-destructive/20 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-destructive/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive/60" />
                    <div>
                      <h2 className="text-lg font-semibold">Partes Borrados</h2>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingDeleted
                          ? "Cargando..."
                          : `${deletedReports?.length ?? 0} parte${(deletedReports?.length ?? 0) !== 1 ? "s" : ""} borrado${(deletedReports?.length ?? 0) !== 1 ? "s" : ""} en el sistema.`}
                      </p>
                    </div>
                  </div>
                  {(deletedReports?.length ?? 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportDeleted}
                      disabled={isExportingDeleted}
                      className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      {isExportingDeleted
                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                      Exportar Borrados
                    </Button>
                  )}
                </div>

                {isLoadingDeleted ? (
                  <div className="p-6 space-y-2">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
                  </div>
                ) : deletedReports && deletedReports.length > 0 ? (
                  <div className="divide-y">
                    {deletedReports.map((r) => (
                      <div key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 text-sm opacity-70">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold">{r.ownerName || r.technicianName}</span>
                          <span className="mx-2 text-muted-foreground">·</span>
                          <span className="font-mono text-xs">{r.workDate}</span>
                          <span className="mx-2 text-muted-foreground">·</span>
                          <span className="truncate text-muted-foreground">{r.serviceActivity}</span>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          Borrado por <strong>{r.deletedBy || "supervisor"}</strong>
                          {r.deletedAt && <> · {new Date(r.deletedAt).toLocaleDateString("es-AR")}</>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay partes borrados.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
