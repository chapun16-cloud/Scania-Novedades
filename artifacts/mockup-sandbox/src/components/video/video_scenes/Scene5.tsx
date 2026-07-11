import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="text-[#F5A623] text-[5vw] font-bold tracking-[0.3em] mb-6"
        initial={{ letterSpacing: '0em', opacity: 0 }}
        animate={phase >= 1 ? { letterSpacing: '0.3em', opacity: 1 } : { letterSpacing: '0em', opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        SCANIA
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-1 bg-[#F5A623]" />
        <h2 className="text-white text-[2vw] tracking-widest font-light uppercase">
          Gestión Eficiente
        </h2>
        <div className="w-12 h-1 bg-[#F5A623]" />
      </motion.div>
    </motion.div>
  );
}