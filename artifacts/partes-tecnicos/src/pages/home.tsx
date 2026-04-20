import {
  getGetCurrentProfileQueryKey,
  getGetServiceReportsSummaryQueryKey,
  getListServiceReportsQueryKey,
  useGetCurrentProfile,
  useGetServiceReportsSummary,
  useListServiceReports,
  useUpdateCurrentProfile,
} from "@workspace/api-client-react";
import { DashboardSummary } from "@/components/dashboard-summary";
import { ReportForm } from "@/components/report-form";
import { ReportsList } from "@/components/reports-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { Wrench, LayoutDashboard, LogOut } from "lucide-react";

export default function Home() {
  const { signOut } = useClerk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isLoadingProfile } = useGetCurrentProfile();
  const { data: summary, isLoading: isLoadingSummary } = useGetServiceReportsSummary();
  const { data: reports, isLoading: isLoadingReports } = useListServiceReports();
  const updateProfile = useUpdateCurrentProfile();
  const isSupervisor = profile?.role === "supervisor";

  function changeRole(role: "technician" | "supervisor") {
    updateProfile.mutate(
      { data: { role } },
      {
        onSuccess: () => {
          toast({ title: "Perfil actualizado" });
          queryClient.invalidateQueries({ queryKey: getGetCurrentProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListServiceReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetServiceReportsSummaryQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo cambiar el perfil.", variant: "destructive" });
        },
      },
    );
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

          <TabsContent value="dashboard" className="mt-0 outline-none space-y-6">
            {isLoadingSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
              </div>
            ) : summary ? (
              <DashboardSummary summary={summary} />
            ) : null}

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{isSupervisor ? "Partes del Equipo" : "Mis Partes"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isSupervisor ? "Historial y revisión de horas del equipo." : "Historial personal de tus partes cargados."}
                  </p>
                </div>
              </div>
              <div className="p-0">
                {isLoadingReports ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : reports ? (
                  <ReportsList reports={reports} canReview={isSupervisor} />
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
