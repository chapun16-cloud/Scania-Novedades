import { ServiceReportsSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2, FileText, Zap, ShieldAlert } from "lucide-react";

export function DashboardSummary({ summary }: { summary: ServiceReportsSummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-secondary text-secondary-foreground border-secondary shadow-md overflow-hidden">
        <div className="h-1 w-full bg-primary" />
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-secondary-foreground/70 uppercase tracking-wider">Pendientes</span>
            <AlertCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-mono">{summary.pendingReview}</div>
          <div className="text-xs mt-1 text-secondary-foreground/60">De {summary.totalReports} partes</div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revisados</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono">{summary.reviewedReports}</div>
          <div className="text-xs mt-1 text-muted-foreground">Listos para nómina</div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total 50%</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold font-mono">{summary.total50Hours} <span className="text-lg text-muted-foreground">h</span></div>
          <div className="text-xs mt-1 text-muted-foreground">Horas extras al 50%</div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total 100%</span>
            <Clock className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-3xl font-bold font-mono text-destructive">{summary.total100Hours} <span className="text-lg opacity-70">h</span></div>
          <div className="text-xs mt-1 text-muted-foreground">Horas extras al 100%</div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border col-span-2 md:col-span-4 lg:col-span-4 mt-2">
        <CardContent className="p-4 grid grid-cols-3 divide-x">
          <div className="px-4 text-center">
            <div className="flex justify-center mb-1"><FileText className="h-4 w-4 text-muted-foreground" /></div>
            <div className="text-xl font-bold font-mono">{summary.totalSoloKm40Hours}h</div>
            <div className="text-xs text-muted-foreground uppercase">Solo +40km</div>
          </div>
          <div className="px-4 text-center">
            <div className="flex justify-center mb-1"><ShieldAlert className="h-4 w-4 text-muted-foreground" /></div>
            <div className="text-xl font-bold font-mono">{summary.totalGuardias}</div>
            <div className="text-xs text-muted-foreground uppercase">Guardias</div>
          </div>
          <div className="px-4 text-center">
            <div className="flex justify-center mb-1"><Zap className="h-4 w-4 text-muted-foreground" /></div>
            <div className="text-xl font-bold font-mono">{summary.totalActivaciones}</div>
            <div className="text-xs text-muted-foreground uppercase">Activaciones</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
