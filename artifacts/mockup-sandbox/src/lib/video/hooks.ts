import { useState, useEffect } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const sceneKeys = Object.keys(durations);
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Announce start for export
    if (currentScene === 0) {
      // @ts-ignore
      window.startRecording?.();
    }

    const duration = durations[sceneKeys[currentScene]];
    if (duration) {
      timeout = setTimeout(() => {
        if (currentScene < sceneKeys.length - 1) {
          setCurrentScene(prev => prev + 1);
        } else {
          // Announce stop for export
          // @ts-ignore
          window.stopRecording?.();
          
          // Loop back to start
          setCurrentScene(0);
        }
      }, duration);
    }

    return () => clearTimeout(timeout);
  }, [currentScene, durations, sceneKeys]);

  return { currentScene, sceneKeys };
}