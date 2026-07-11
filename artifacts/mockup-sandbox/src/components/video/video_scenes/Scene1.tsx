import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 0),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 5000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#041e42] to-black opacity-90"
      />
      
      <div className="z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-[#F5A623] text-[3vw] font-bold tracking-[0.2em] mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SCANIA
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.h1 
            initial={{ y: '100%' }}
            animate={phase >= 2 ? { y: 0 } : { y: '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-white text-[6vw] font-black tracking-tighter leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            PARTES TÉCNICOS
          </motion.h1>
        </div>
        
        <div className="overflow-hidden mt-2">
          <motion.h2
            initial={{ y: '-100%', opacity: 0 }}
            animate={phase >= 3 ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-gray-400 text-[2vw] tracking-widest font-light"
          >
            Y SUPERVISIÓN
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
}