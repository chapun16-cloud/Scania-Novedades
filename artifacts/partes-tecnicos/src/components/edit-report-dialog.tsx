import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import type { ServiceReport } from "@workspace/api-client-react";

const BASE_API = import.meta.env.BASE_URL.replace(/\/$/, "");

const editSchema = z.object({
  workDate: z.string().min(1),
  shiftLabel: z.string().optional(),
  serviceActivity: z.string().min(1, "Requerido"),
  overtime50Normal: z.coerce.number().min(0).default(0),
  overtime50NormalKm40: z.coerce.number().min(0).default(0),
  overtime50WeekendHoliday: z.coerce.number().min(0).default(0),
  overtime50WeekendHolidayKm40: z.coerce.number().min(0).default(0),
  overtime100Normal: z.coerce.number().min(0).default(0),
  overtime100NormalKm40: z.coerce.number().min(0).default(0),
  overtime100WeekendHoliday: z.coerce.number().min(0).default(0),
  overtime100WeekendHolidayKm40: z.coerce.number().min(0).default(0),
  soloKm40Hours: z.coerce.number().min(0).default(0),
  technicalAssistanceGuard: z.coerce.number().min(0).default(0),
  fieldActivation: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

interface Props {
  report: ServiceReport;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = "form" | "password";

export function EditReportDialog({ report, open, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [pendingData, setPendingData] = useState<EditValues | null>(null);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      workDate: String(report.workDate).substring(0, 10),
      shiftLabel: report.shiftLabel || "Mañana",
      serviceActivity: report.serviceActivity || "",
      overtime50Normal: report.overtime50Normal ?? 0,
      overtime50NormalKm40: report.overtime50NormalKm40 ?? 0,
      overtime50WeekendHoliday: report.overtime50WeekendHoliday ?? 0,
      overtime50WeekendHolidayKm40: report.overtime50WeekendHolidayKm40 ?? 0,
      overtime100Normal: report.overtime100Normal ?? 0,
      overtime100NormalKm40: report.overtime100NormalKm40 ?? 0,
      overtime100WeekendHoliday: report.overtime100WeekendHoliday ?? 0,
      overtime100WeekendHolidayKm40: report.overtime100WeekendHolidayKm40 ?? 0,
      soloKm40Hours: report.soloKm40Hours ?? 0,
      technicalAssistanceGuard: report.technicalAssistanceGuard ?? 0,
      fieldActivation: report.fieldActivation ?? 0,
      notes: report.notes || "",
    },
  });

  function handleClose() {
    setStep("form");
    setPassword("");
    setError("");
    setIsLoading(false);
    setPendingData(null);
    form.reset();
    onClose();
  }

  function onFormSubmit(data: EditValues) {
    setPendingData(data);
    setError("");
    setStep("password");
  }

  async function handleConfirm() {
    if (!pendingData || !password.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_API}/api/service-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...pendingData,
          soloKm40: (pendingData.soloKm40Hours ?? 0) > 0,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        handleClose();
        onSaved();
      } else {
        setError(data?.error ?? "No se pudo modificar el parte.");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Modificar parte</DialogTitle>
                  <DialogDescription>
                    {report.technicianName} · {String(report.workDate).substring(0, 10)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 py-2">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="workDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Fecha</FormLabel>
                      <FormControl><Input type="date" {...field} className="font-mono bg-muted/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shiftLabel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Turno</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Noche">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="serviceActivity" render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel className="text-xs font-semibold">Actividad / O.T.</FormLabel>
                      <FormControl><Input placeholder="OT-12345 ..." {...field} className="bg-muted/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* 50% */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-secondary/5 px-4 py-2 border-b flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-bold">50%</span>
                    <span className="text-sm font-semibold">Horas Extras al 50%</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["overtime50Normal","overtime50NormalKm40","overtime50WeekendHoliday","overtime50WeekendHolidayKm40"] as const).map((name, i) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{["Normal","Normal Km40","Fin Sem/Fer","Fin Sem/Fer Km40"][i]}</FormLabel>
                          <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </div>

                {/* 100% */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-secondary/5 px-4 py-2 border-b flex items-center gap-2">
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded font-bold">100%</span>
                    <span className="text-sm font-semibold">Horas Extras al 100%</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["overtime100Normal","overtime100NormalKm40","overtime100WeekendHoliday","overtime100WeekendHolidayKm40"] as const).map((name, i) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{["Normal","Normal Km40","Fin Sem/Fer","Fin Sem/Fer Km40"][i]}</FormLabel>
                          <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </div>

                {/* Adicionales */}
                <div className="grid grid-cols-3 gap-4">
                  {(["soloKm40Hours","technicalAssistanceGuard","fieldActivation"] as const).map((name, i) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="border rounded-lg p-3 bg-card shadow-sm">
                        <FormLabel className="text-xs font-semibold">{["Solo +40km","Guardia","Activación"][i]}</FormLabel>
                        <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono" /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Notas</FormLabel>
                    <FormControl><Textarea placeholder="Observaciones..." className="resize-none h-20 bg-muted/50 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                  <Button type="submit">Continuar</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <DialogTitle>Confirmar con contraseña</DialogTitle>
              </div>
              <DialogDescription>
                Ingresá tu contraseña para guardar los cambios en el parte de{" "}
                <strong className="text-foreground">{report.technicianName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="edit-pwd">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="edit-pwd"
                    type={showPwd ? "text" : "password"}
                    placeholder="Tu contraseña de acceso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && password.trim()) handleConfirm(); }}
                    disabled={isLoading}
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { setStep("form"); setError(""); setPassword(""); }} disabled={isLoading}>
                Atrás
              </Button>
              <Button onClick={handleConfirm} disabled={isLoading || !password.trim()}>
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
