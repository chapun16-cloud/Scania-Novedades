import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Users, ShieldCheck, History } from 'lucide-react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-20"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-white text-[4vw] font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Acceso Basado en Roles
        </h1>
      </motion.div>

      <div className="flex w-full max-w-6xl gap-12">
        <motion.div 
          className="flex-1 bg-gradient-to-b from-white/10 to-transparent border border-white/20 p-10 rounded-3xl relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
        >
          <User className="w-16 h-16 text-gray-400 mb-6" />
          <h2 className="text-[#F5A623] text-[2.5vw] font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Técnico</h2>
          <ul className="text-white text-[1.5vw] space-y-4 font-light">
            <li className="flex items-center gap-3"><History className="w-6 h-6 text-[#F5A623]"/> Carga reportes propios</li>
            <li className="flex items-center gap-3"><History className="w-6 h-6 text-[#F5A623]"/> Consulta historial personal</li>
          </ul>
        </motion.div>

        <motion.div 
          className="flex-1 bg-gradient-to-b from-[#F5A623]/20 to-transparent border border-[#F5A623]/40 p-10 rounded-3xl relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Users className="w-16 h-16 text-[#F5A623] mb-6" />
          <h2 className="text-white text-[2.5vw] font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Supervisor</h2>
          <ul className="text-white text-[1.5vw] space-y-4 font-light">
            <li className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-white"/> Visión global del equipo</li>
            <li className="flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-white"/> Revisión y aprobación</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}