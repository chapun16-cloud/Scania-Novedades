import { useGetServiceReportsSummary, useListServiceReports } from "@workspace/api-client-react";
import { DashboardSummary } from "@/components/dashboard-summary";
import { ReportForm } from "@/components/report-form";
import { ReportsList } from "@/components/reports-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, LayoutDashboard } from "lucide-react";

export default function Home() {
  const { data: summary, isLoading: isLoadingSummary } = useGetServiceReportsSummary();
  const { data: reports, isLoading: isLoadingReports } = useListServiceReports();

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="bg-secondary text-secondary-foreground py-4 px-6 sticky top-0 z-10 border-b border-secondary-border shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SCANIA</h1>
            <p className="text-xs text-secondary-foreground/70 font-mono">PANEL DE CONTROL TÉCNICO</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="submit" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted p-1">
              <TabsTrigger value="submit" className="font-medium px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wrench className="w-4 h-4 mr-2" />
                Nuevo Parte
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="font-medium px-6 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard & Revisión
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
                <ReportForm />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0 outline-none space-y-6">
            {isLoadingSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
              </div>
            ) : summary ? (
              <DashboardSummary summary={summary} />
            ) : null}

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-muted/30 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Partes Registrados</h2>
                  <p className="text-sm text-muted-foreground">Historial y revisión de horas.</p>
                </div>
              </div>
              <div className="p-0">
                {isLoadingReports ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : reports ? (
                  <ReportsList reports={reports} />
                ) : null}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
