import { ServiceReport, useUpdateServiceReport, getListServiceReportsQueryKey, getGetServiceReportsSummaryQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export function ReportsList({ reports, canReview = false }: { reports: ServiceReport[]; canReview?: boolean }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (reports.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p>No hay partes registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {reports.map(report => (
        <ReportRow 
          key={report.id} 
          report={report} 
          canReview={canReview}
          isExpanded={expandedId === report.id}
          onToggle={() => setExpandedId(expandedId === report.id ? null : report.id)}
        />
      ))}
    </div>
  );
}

function ReportRow({ report, canReview, isExpanded, onToggle }: { report: ServiceReport, canReview: boolean, isExpanded: boolean, onToggle: () => void }) {
  const queryClient = useQueryClient();
  const updateReport = useUpdateServiceReport();
  const { toast } = useToast();
  const [notes, setNotes] = useState(report.notes || "");

  const handleReview = () => {
    updateReport.mutate({ id: report.id, data: { reviewed: true } }, {
      onSuccess: () => {
        toast({ title: "Parte revisado" });
        queryClient.invalidateQueries({ queryKey: getListServiceReportsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetServiceReportsSummaryQueryKey() });
      }
    });
  };

  const handleSaveNotes = () => {
    updateReport.mutate({ id: report.id, data: { notes } }, {
      onSuccess: () => {
        toast({ title: "Notas actualizadas" });
        queryClient.invalidateQueries({ queryKey: getListServiceReportsQueryKey() });
      }
    });
  };

  const dateFormatted = format(new Date(report.workDate), "dd MMM yyyy", { locale: es });

  return (
    <div className={`transition-colors ${report.reviewed ? 'bg-background' : 'bg-primary/5'} hover:bg-muted/30`}>
      <div 
        className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-base truncate">{report.technicianName}</span>
            {!report.reviewed && (
              <Badge variant="secondary" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 shrink-0">Pendiente</Badge>
            )}
            {report.reviewed && (
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 shrink-0">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Revisado
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-mono text-xs">{dateFormatted}</span>
            <span>•</span>
            <span className="truncate">{report.serviceActivity}</span>
            <span>•</span>
            <span>Turno: {report.shiftLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:justify-end shrink-0">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total Horas</div>
            <div className="font-mono font-bold flex gap-3">
              {report.total50Hours > 0 && <span className="text-primary">{report.total50Hours}h (50%)</span>}
              {report.total100Hours > 0 && <span className="text-destructive">{report.total100Hours}h (100%)</span>}
              {report.total50Hours === 0 && report.total100Hours === 0 && <span className="text-muted-foreground">0h</span>}
            </div>
          </div>
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 bg-muted/20 border-t border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Detalles de horas */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Desglose de Horas Extras</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-card shadow-sm">
                  <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> AL 50%
                  </div>
                  <ul className="text-sm space-y-1 font-mono">
                    <li className="flex justify-between"><span>Normal:</span> <strong>{report.overtime50Normal}h</strong></li>
                    <li className="flex justify-between"><span>Normal Km40:</span> <strong>{report.overtime50NormalKm40}h</strong></li>
                    <li className="flex justify-between"><span>Fin Sem/Fer:</span> <strong>{report.overtime50WeekendHoliday}h</strong></li>
                    <li className="flex justify-between"><span>Fin Sem/Fer Km40:</span> <strong>{report.overtime50WeekendHolidayKm40}h</strong></li>
                  </ul>
                </div>

                <div className="border rounded-lg p-3 bg-card shadow-sm">
                  <div className="text-xs font-bold text-destructive mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> AL 100%
                  </div>
                  <ul className="text-sm space-y-1 font-mono">
                    <li className="flex justify-between"><span>Normal:</span> <strong>{report.overtime100Normal}h</strong></li>
                    <li className="flex justify-between"><span>Normal Km40:</span> <strong>{report.overtime100NormalKm40}h</strong></li>
                    <li className="flex justify-between"><span>Fin Sem/Fer:</span> <strong>{report.overtime100WeekendHoliday}h</strong></li>
                    <li className="flex justify-between"><span>Fin Sem/Fer Km40:</span> <strong>{report.overtime100WeekendHolidayKm40}h</strong></li>
                  </ul>
                </div>
              </div>

              {/* Adicionales */}
              {(report.soloKm40Hours > 0 || report.soloKm40 || report.technicalAssistanceGuard > 0 || report.fieldActivation > 0) && (
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-2">Adicionales</h4>
                  <div className="flex flex-wrap gap-2">
                    {(report.soloKm40Hours > 0 || report.soloKm40) && (
                      <Badge variant="outline" className="bg-card"><MapPin className="w-3 h-3 mr-1" /> Solo +40km: {report.soloKm40Hours}h</Badge>
                    )}
                    {report.technicalAssistanceGuard > 0 && (
                      <Badge variant="outline" className="bg-card">Guardia: {report.technicalAssistanceGuard}</Badge>
                    )}
                    {report.fieldActivation > 0 && (
                      <Badge variant="outline" className="bg-card">Activación: {report.fieldActivation}</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Revisión y notas */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{canReview ? "Revisión" : "Estado"}</h4>
              
              <div className="space-y-3">
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Notas de revisión..." 
                  readOnly={!canReview}
                  className="h-24 resize-none bg-card text-sm"
                />
                
                {canReview ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveNotes}
                    disabled={updateReport.isPending || notes === report.notes}
                    className="flex-1"
                  >
                    Guardar Notas
                  </Button>
                  
                  {!report.reviewed && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleReview}
                      disabled={updateReport.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                  )}
                </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {report.reviewed ? "Este parte ya fue revisado por supervisión." : "Pendiente de revisión por supervisión."}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
