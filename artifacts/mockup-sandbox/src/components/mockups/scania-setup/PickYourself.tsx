import React, { useState, useMemo } from "react";
import { Search, LogOut, Check, User, AlertCircle } from "lucide-react";

const ALLOWED_NAMES = [
  "Pedro Gonzalez",
  "Jonatan Baez",
  "Fernando Barrera",
  "Javier Espinola",
  "Gustavo Mancuello",
  "Cristian Martinez",
  "Gonzalo Perez",
  "Guillermo Pipet",
  "Nahuel Ueki",
  "Juan Duarte",
];

export function PickYourself() {
  const [search, setSearch] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredNames = useMemo(() => {
    if (!search.trim()) return ALLOWED_NAMES;
    const lowerSearch = search.toLowerCase();
    return ALLOWED_NAMES.filter(name => name.toLowerCase().includes(lowerSearch));
  }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedName) {
      setError("Por favor, selecciona tu nombre de la lista.");
      return;
    }
    
    // Simulate submission
    setIsSubmitting(true);
    setError(null);
    setTimeout(() => {
      // Simulate error 10% of the time, or success
      if (Math.random() > 0.9) {
        setError("Nombre no encontrado en la lista de usuarios autorizados.");
        setIsSubmitting(false);
      } else {
        alert(`¡Bienvenido, ${selectedName}! (Simulación de éxito)`);
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#2B3A4A] text-white p-4 shadow-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#2B3A4A]" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">SCANIA</h1>
            <p className="text-xs text-slate-300 font-medium tracking-widest">NOVEDADES</p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-white transition-colors flex flex-col items-center gap-1">
          <LogOut size={18} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col">
        <div className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Identifícate</h2>
          <p className="text-slate-500 text-sm">
            Para continuar, selecciona tu nombre de la lista de personal autorizado.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar tu nombre..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedName(null);
              setError(null);
            }}
          />
        </div>

        <div className="flex-1 min-h-0 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-6">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredNames.length} {filteredNames.length === 1 ? 'resultado' : 'resultados'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium bg-slate-200/50 px-2 py-1 rounded-full">
              Solo personal autorizado
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[40vh]">
            {filteredNames.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="text-slate-400 text-sm">No se encontraron nombres que coincidan con "{search}".</p>
              </div>
            ) : (
              filteredNames.map((name) => {
                const isSelected = selectedName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSelectedName(name);
                      setError(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#2B3A4A]' 
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[#ffb800] text-[#2B3A4A]' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isSelected ? <Check size={18} className="stroke-[3]" /> : <User size={18} />}
                      </div>
                      <span className={`font-medium ${isSelected ? 'font-bold' : ''}`}>{name}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!selectedName || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center ${
              !selectedName 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#ffb800] hover:bg-[#ffb800]/90 text-[#2B3A4A] shadow-[#ffb800]/20'
            }`}
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-[#2B3A4A]/30 border-t-[#2B3A4A] rounded-full animate-spin" />
            ) : (
              'Confirmar identidad'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
