import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const SHIFT_OPTIONS = ["Mañana", "Tarde/Cierre", "Noche"];

const shiftColors: Record<string, string> = {
  "Mañana": "bg-amber-100 text-amber-800 border-amber-200",
  "Tarde/Cierre": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Noche": "bg-slate-100 text-slate-700 border-slate-200",
};

export interface TechnicianHours {
  total50: number;
  total100: number;
}

interface UserProfile {
  userId: string;
  displayName: string;
  defaultShift: string;
}

interface TeamShiftsPanelProps {
  users: UserProfile[] | undefined;
  isLoading: boolean;
  onShiftChange: (userId: string, shift: string) => void;
  hoursSummary?: Record<string, TechnicianHours>;
}

export function TeamShiftsPanel({ users, isLoading, onShiftChange, hoursSummary }: TeamShiftsPanelProps) {
  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">Equipo y Turnos</h2>
          <p className="text-xs text-muted-foreground">Turno asignado a cada técnico</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No hay técnicos registrados.
        </div>
      ) : (
        <div className="divide-y">
          {users
            .slice()
            .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"))
            .map((user) => {
              const shift = user.defaultShift || "Tarde/Cierre";
              const color = shiftColors[shift] ?? "bg-muted text-muted-foreground border-transparent";
              const hours = hoursSummary?.[user.userId];
              const hasReports = hours !== undefined;
              const has50 = hasReports && hours.total50 > 0;
              const has100 = hasReports && hours.total100 > 0;
              return (
                <div
                  key={user.userId}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.displayName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
                        {shift}
                      </span>
                      {hoursSummary !== undefined && (
                        hasReports ? (
                          <span className="text-xs font-mono font-semibold flex gap-1.5">
                            {has50 && (
                              <span className="text-primary">{hours.total50}h (50%)</span>
                            )}
                            {has100 && (
                              <span className="text-destructive">{hours.total100}h (100%)</span>
                            )}
                            {!has50 && !has100 && (
                              <span className="text-muted-foreground">0h extras</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">Sin partes</span>
                        )
                      )}
                    </div>
                  </div>
                  <Select
                    value={shift}
                    onValueChange={(v) => onShiftChange(user.userId, v)}
                  >
                    <SelectTrigger className="h-8 w-[150px] text-xs shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFT_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
