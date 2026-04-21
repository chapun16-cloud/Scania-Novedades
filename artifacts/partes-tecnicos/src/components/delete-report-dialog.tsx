import { useState } from "react";
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
import { AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

const BASE_API = import.meta.env.BASE_URL.replace(/\/$/, "");

type Step = "confirm" | "password";

interface Props {
  reportId: number;
  technicianName: string;
  workDate: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteReportDialog({ reportId, technicianName, workDate, open, onClose, onDeleted }: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setStep("confirm");
    setPassword("");
    setError("");
    setIsLoading(false);
    onClose();
  }

  async function handleDelete() {
    if (!password.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_API}/api/service-reports/${reportId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        handleClose();
        onDeleted();
      } else {
        setError(data?.error ?? "No se pudo borrar el parte.");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <DialogTitle className="text-destructive">Borrar parte pendiente</DialogTitle>
              </div>
              <DialogDescription className="text-base leading-relaxed">
                Vas a borrar el parte de <strong className="text-foreground">{technicianName}</strong> del día{" "}
                <strong className="text-foreground">{workDate}</strong>. Esta acción quedará registrada.
                <br /><br />
                Los partes borrados se guardan en un log separado y se pueden exportar a Excel.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => { setStep("password"); setError(""); }}
              >
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <DialogTitle>Confirmar con contraseña</DialogTitle>
              </div>
              <DialogDescription>
                Ingresá tu contraseña para confirmar el borrado del parte.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="del-pwd">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="del-pwd"
                    type={showPwd ? "text" : "password"}
                    placeholder="Tu contraseña de acceso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && password.trim()) handleDelete(); }}
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => { setStep("confirm"); setError(""); setPassword(""); }} disabled={isLoading}>
                Atrás
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || !password.trim()}
              >
                {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                Confirmar borrado
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
