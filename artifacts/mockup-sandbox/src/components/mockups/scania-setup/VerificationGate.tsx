import React, { useState } from "react";
import { AlertCircle, CheckCircle2, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";
import "./_group.css";

const AUTHORIZED_USERS = [
  "P. González",
  "J. Baez",
  "F. Barrera",
  "J. Espinola",
  "G. Mancuello",
  "C. Martinez",
  "G. Perez",
  "G. Pipet",
  "N. Ueki",
  "J. Duarte"
];

export function VerificationGate() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsLoading(true);
    setError(null);

    // Simulate API check
    setTimeout(() => {
      setIsLoading(false);
      // In this mockup we always show an error unless they type a specific name to test success
      const fullName = `${firstName.trim().charAt(0).toUpperCase()}. ${lastName.trim()}`;
      
      if (AUTHORIZED_USERS.some(u => u.toLowerCase() === fullName.toLowerCase())) {
        // Success would redirect here
        alert("¡Verificación exitosa! Redirigiendo...");
      } else {
        setError("Tu nombre no figura en la lista autorizada. Contacta a RRHH si crees que es un error.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Left Panel - Navy Blue */}
      <div className="w-full md:w-[35%] bg-[#2B3A4A] text-white flex flex-col p-6 md:p-8 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-[#ffb800] flex items-center justify-center shrink-0">
            <span className="text-[#2B3A4A] font-bold text-lg leading-none">S</span>
          </div>
          <div>
            <h2 className="font-bold tracking-widest text-sm text-gray-200">SCANIA</h2>
            <p className="text-[10px] text-[#ffb800] tracking-[0.2em] uppercase">Novedades</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-green-500/30">
            <ShieldCheck className="w-4 h-4" />
            Sistema Autorizado
          </div>
          <h1 className="text-2xl font-bold mb-2">Verificación de Acceso</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Este sistema es de uso exclusivo para el personal técnico autorizado. 
            Verifica que tu nombre figure en la lista antes de continuar.
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col mt-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Usuarios Activos</h3>
          <div className="flex-1 overflow-y-auto scania-scrollbar pr-2 space-y-2">
            {AUTHORIZED_USERS.map((user, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                  {user.charAt(0)}
                </div>
                <span className="text-sm text-gray-300 font-medium flex-1">{user}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 right-6">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirma tu Identidad</h2>
            <p className="text-gray-500">Ingresa tu nombre y apellido tal como figuran en tus credenciales de Scania.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">Acceso Denegado</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide text-xs">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent transition-all scania-input"
                placeholder="Ej. Juan"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-wide text-xs">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent transition-all scania-input"
                placeholder="Ej. Perez"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !firstName.trim() || !lastName.trim()}
                className="w-full bg-[#2B3A4A] text-white font-bold py-3.5 px-4 rounded hover:bg-[#1a232c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Identidad"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}