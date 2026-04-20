import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateServiceReport, getGetServiceReportsSummaryQueryKey, getListServiceReportsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  technicianName: z.string().min(1, "El nombre es requerido"),
  workDate: z.string().min(1, "La fecha es requerida"),
  shiftLabel: z.string().optional(),
  serviceActivity: z.string().min(1, "La actividad es requerida"),
  overtime50Normal: z.coerce.number().min(0).default(0),
  overtime50NormalKm40: z.coerce.number().min(0).default(0),
  overtime50WeekendHoliday: z.coerce.number().min(0).default(0),
  overtime50WeekendHolidayKm40: z.coerce.number().min(0).default(0),
  overtime100Normal: z.coerce.number().min(0).default(0),
  overtime100NormalKm40: z.coerce.number().min(0).default(0),
  overtime100WeekendHoliday: z.coerce.number().min(0).default(0),
  overtime100WeekendHolidayKm40: z.coerce.number().min(0).default(0),
  soloKm40: z.boolean().default(false),
  soloKm40Hours: z.coerce.number().min(0).default(0),
  technicalAssistanceGuard: z.coerce.number().min(0).default(0),
  fieldActivation: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReport = useCreateServiceReport();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      technicianName: "",
      workDate: new Date().toISOString().split('T')[0],
      shiftLabel: "Mañana",
      serviceActivity: "",
      overtime50Normal: 0,
      overtime50NormalKm40: 0,
      overtime50WeekendHoliday: 0,
      overtime50WeekendHolidayKm40: 0,
      overtime100Normal: 0,
      overtime100NormalKm40: 0,
      overtime100WeekendHoliday: 0,
      overtime100WeekendHolidayKm40: 0,
      soloKm40: false,
      soloKm40Hours: 0,
      technicalAssistanceGuard: 0,
      fieldActivation: 0,
      notes: "",
    }
  });

  function onSubmit(data: FormValues) {
    createReport.mutate({ data: { ...data, soloKm40: data.soloKm40Hours > 0 } }, {
      onSuccess: () => {
        toast({
          title: "Parte registrado",
          description: "El parte se ha guardado correctamente.",
        });
        queryClient.invalidateQueries({ queryKey: getListServiceReportsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetServiceReportsSummaryQueryKey() });
        form.reset({ ...form.getValues(), serviceActivity: "", notes: "" });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "No se pudo guardar el parte.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Identificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="technicianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-secondary">Técnico / Mecánico</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo" {...field} className="bg-muted/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-secondary">Fecha de Trabajo</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-muted/50 font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shiftLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-secondary">Turno</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Seleccione turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mañana">Mañana</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noche">Noche</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceActivity"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-semibold text-secondary">Actividad de Servicio / O.T.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. OT-12345 Mantenimiento Preventivo" {...field} className="bg-muted/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Horas Extras 50% */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-secondary/5 px-4 py-3 border-b">
            <h3 className="font-semibold text-secondary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-bold">50%</span>
              Horas Extras al 50%
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="overtime50Normal" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Normal</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime50NormalKm40" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Normal (Km 40)</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime50WeekendHoliday" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fin de Sem/Feriado</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime50WeekendHolidayKm40" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fin Sem/Fer (Km 40)</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* Horas Extras 100% */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-secondary/5 px-4 py-3 border-b">
            <h3 className="font-semibold text-secondary flex items-center gap-2">
              <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded font-bold">100%</span>
              Horas Extras al 100%
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="overtime100Normal" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Normal</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime100NormalKm40" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Normal (Km 40)</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime100WeekendHoliday" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fin de Sem/Feriado</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="overtime100WeekendHolidayKm40" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Fin Sem/Fer (Km 40)</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" {...field} className="font-mono text-right" /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        {/* Adicionales */}
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-secondary/5 px-4 py-3 border-b">
            <h3 className="font-semibold text-secondary">Adicionales</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="soloKm40Hours" render={({ field }) => (
              <FormItem className="rounded-lg border p-4 shadow-sm bg-card">
                <FormLabel className="text-base block mb-2">Solo +40km</FormLabel>
                <FormControl><Input type="number" min="0" step="0.5" placeholder="Horas" {...field} className="font-mono" /></FormControl>
                <p className="text-xs text-muted-foreground mt-2">Cantidad de horas del adicional +40km.</p>
              </FormItem>
            )} />
            <FormField control={form.control} name="technicalAssistanceGuard" render={({ field }) => (
              <FormItem className="rounded-lg border p-4 shadow-sm bg-card">
                <FormLabel className="text-base block mb-2">Guardia Asistencia</FormLabel>
                <FormControl><Input type="number" min="0" {...field} className="font-mono" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="fieldActivation" render={({ field }) => (
              <FormItem className="rounded-lg border p-4 shadow-sm bg-card">
                <FormLabel className="text-base block mb-2">Activación Campo</FormLabel>
                <FormControl><Input type="number" min="0" {...field} className="font-mono" /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-secondary">Notas / Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Comentarios adicionales..." className="resize-none h-24 bg-muted/50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex justify-end">
          <Button type="submit" size="lg" className="w-full sm:w-auto font-bold px-8 text-base shadow-md" disabled={createReport.isPending}>
            {createReport.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            ENVIAR PARTE
          </Button>
        </div>
      </form>
    </Form>
  );
}
