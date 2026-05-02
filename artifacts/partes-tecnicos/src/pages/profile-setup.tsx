import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { useClerk } from "@clerk/react";
import scaniaLionWatermark from "@/assets/scania-lion-watermark.png";

const BASE_API = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_API}/api/profile/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });

      const data = await res.json();

      if (res.status === 201 || res.status === 200) {
        await queryClient.invalidateQueries({ queryKey: getGetCurrentProfileQueryKey() });
        setLocation("/app");
      } else {
        setError(data?.error ?? "No se pudo completar el registro.");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="bg-secondary text-secondary-foreground py-4 px-6 border-b border-secondary-border shadow-sm">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
            <img src={scaniaLionWatermark} alt="SCANIA" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SCANIA</h1>
            <p className="text-xs text-secondary-foreground/70 font-mono">COMPLETAR REGISTRO</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-secondary mb-1">Completá tu registro</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Ingresá tu nombre y apellido exactamente como aparecen en la lista de usuarios autorizados.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold text-secondary">
                    Nombre
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Ej. Pablo"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className="bg-muted/50"
                    autoComplete="given-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold text-secondary">
                    Apellido
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Ej. Aimar"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    className="bg-muted/50"
                    autoComplete="family-name"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold mt-2"
                  disabled={isLoading || !firstName.trim() || !lastName.trim()}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Confirmar y entrar
                </Button>
              </form>
            </div>

            <div className="px-8 py-4 bg-muted/30 border-t text-center">
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Salir y volver al inicio
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
