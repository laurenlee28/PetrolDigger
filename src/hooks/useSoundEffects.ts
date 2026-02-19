import { useEffect, useRef } from 'react';
import { getSoundSystem } from '../utils/soundSystem';

export function useSoundEffects() {
  const soundSystem = useRef(getSoundSystem());
  const lastBlockBreakTime = useRef(0);
  const lastSparkTime = useRef(0);
  const lastLayerChangeTime = useRef(0);
  const lastCountdownTime = useRef(0);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      soundSystem.current.stopDrill();
    };
  }, []);

  return {
    // Drill sounds
    startDrill: () => {
      soundSystem.current.startDrill();
    },
    stopDrill: () => {
      soundSystem.current.stopDrill();
    },

    // Block break sound (throttled)
    playBlockBreak: () => {
      const now = Date.now();
      if (now - lastBlockBreakTime.current > 50) { // Max 20/sec
        soundSystem.current.playBlockBreak();
        lastBlockBreakTime.current = now;
      }
    },

    // Spark sound (throttled)
    playSpark: () => {
      const now = Date.now();
      if (now - lastSparkTime.current > 100) { // Max 10/sec
        soundSystem.current.playSpark();
        lastSparkTime.current = now;
      }
    },

    // Layer change sound (throttled)
    playLayerChange: () => {
      const now = Date.now();
      if (now - lastLayerChangeTime.current > 500) { // Max 2/sec
        soundSystem.current.playLayerChange();
        lastLayerChangeTime.current = now;
      }
    },

    // UI sounds (not throttled)
    playClick: () => {
      soundSystem.current.playClick();
    },

    playCountdownTick: () => {
      const now = Date.now();
      if (now - lastCountdownTime.current > 900) { // Once per second max
        soundSystem.current.playCountdownTick();
        lastCountdownTime.current = now;
      }
    },

    playAlarm: () => {
      soundSystem.current.playAlarm();
    },

    playWin: () => {
      soundSystem.current.playWin();
    },

    playLose: () => {
      soundSystem.current.playLose();
    },

    // Mute control
    toggleMute: () => {
      return soundSystem.current.toggleMute();
    },

    getMuted: () => {
      return soundSystem.current.getMuted();
    }
  };
}
