import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Car, Calendar, MapPin } from 'lucide-react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 0),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 1800),
      setTimeout(() => setPhase(5), 2400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const items = [
    { icon: Clock, text: "Horas 50% y 100%" },
    { icon: Calendar, text: "Fines de Semana" },
    { icon: MapPin, text: "Distancia +40km" },
    { icon: Car, text: "Horas de Embarque" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-20"
      initial={{ opacity: 0, x: '100vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100vw', filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-1/2 pr-10">
        <motion.h2 
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
          className="text-[#F5A623] text-[2vw] font-bold tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          PRECAISIÓN TOTAL
        </motion.h2>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white text-[5vw] font-black leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          CARGA DE <br/>PARTES
        </motion.h1>
      </div>

      <div className="w-1/2 grid grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={phase >= (idx + 2) ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center justify-center gap-4"
          >
            <item.icon className="w-12 h-12 text-[#F5A623]" />
            <span className="text-white text-[1.5vw] font-medium">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}