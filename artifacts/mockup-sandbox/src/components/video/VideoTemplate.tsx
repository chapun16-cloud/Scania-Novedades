import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  intro: 6000,
  carga: 7000,
  roles: 6500,
  features: 6500,
  outro: 6000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020d1e] text-white">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Animated gradients for industrial vibe */}
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #F5A623, transparent)' }}
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['-20%', '10%', '-20%'],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #041e42, transparent)' }}
          animate={{
            x: ['20%', '-10%', '20%'],
            y: ['20%', '-10%', '20%'],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Industrial grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4vw_4vw]" />
      </div>

      {/* Persistent Midground Accents */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-1 bg-[#F5A623] z-10"
        animate={{
          width: ['5vw', '15vw', '8vw', '20vw', '10vw'][currentScene],
          opacity: [1, 0.8, 1, 0.6, 1][currentScene],
        }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-1 h-20 bg-[#F5A623] z-10"
        animate={{
          height: ['5vh', '15vh', '8vh', '20vh', '10vh'][currentScene],
        }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      <div className="relative z-20 w-full h-full">
        <AnimatePresence mode="popLayout">
          {currentScene === 0 && <Scene1 key="intro" />}
          {currentScene === 1 && <Scene2 key="carga" />}
          {currentScene === 2 && <Scene3 key="roles" />}
          {currentScene === 3 && <Scene4 key="features" />}
          {currentScene === 4 && <Scene5 key="outro" />}
        </AnimatePresence>
      </div>
    </div>
  );
}