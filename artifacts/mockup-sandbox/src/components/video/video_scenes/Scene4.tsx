import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, ShieldAlert } from 'lucide-react';

export function Scene4() {
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
      className="absolute inset-0 flex items-center justify-center p-20"
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: -90, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <div className="flex flex-col gap-12 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="bg-[#041e42]/80 border-l-4 border-[#F5A623] p-10 flex items-center gap-8 rounded-r-3xl shadow-2xl"
        >
          <ShieldAlert className="w-20 h-20 text-[#F5A623] shrink-0" />
          <div>
            <h2 className="text-white text-[2.5vw] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Guardia Semanal</h2>
            <p className="text-gray-300 text-[1.5vw]">Control estricto de límite: 1 guardia por semana por técnico.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 border-l-4 border-green-500 p-10 flex items-center gap-8 rounded-r-3xl shadow-2xl ml-20"
        >
          <FileSpreadsheet className="w-20 h-20 text-green-500 shrink-0" />
          <div>
            <h2 className="text-white text-[2.5vw] font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Exportación a Excel</h2>
            <p className="text-gray-300 text-[1.5vw]">Generación de reportes listos para el procesamiento de nóminas.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}