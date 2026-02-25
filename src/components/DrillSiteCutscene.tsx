import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSoundSystem } from '../utils/soundSystem';
import characterImage from '../assets/Mory.png';
import tunnelBg from '../assets/Ground.png';

interface DrillSiteCutsceneProps {
  onComplete: () => void;
  scenarioTitle?: string;
}

// Cutscene phases
type Phase = 'walking' | 'scanning' | 'exclamation' | 'dialogue' | 'ready';

export function DrillSiteCutscene({ onComplete, scenarioTitle = 'ZONE' }: DrillSiteCutsceneProps) {
  const [phase, setPhase] = useState<Phase>('walking');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [walkX, setWalkX] = useState(-15); // start off-screen left (percentage)
  const [walkStep, setWalkStep] = useState(0);
  const [showExclamation, setShowExclamation] = useState(false);
  const [lampBlink, setLampBlink] = useState(false);
  const [scanRadius, setScanRadius] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [cameraOffset, setCameraOffset] = useState(0);
  const [drillDown, setDrillDown] = useState(0);
  const soundSystemRef = useRef(getSoundSystem());
  const targetX = 50; // center of screen (percentage)
  const completeCalled = useRef(false);

  const dialogueText = '이 밑에 현재 석유가 매집되어 있는 장소야!\n여기를 시추해서 석유를 찾아내야 해!';

  // Stars
  const stars = useMemo(() =>
    Array.from({ length: 30 }).map(() => ({
      w: 0.2 + Math.random() * 0.3, // vw
      top: Math.random() * 35,
      left: Math.random() * 100,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 3,
    })), []);

  // Oil Bubbles
  const oilBubbles = useMemo(() =>
    [0, 1, 2, 3, 4, 5, 6].map(() => ({
      size: 0.8 + Math.random() * 1.0, // vw
      delay: Math.random() * 2
    })), []);

  // Rock Fragments
  const rockFragments = useMemo(() =>
    Array.from({ length: 15 }).map(() => ({
      left: 10 + Math.random() * 80,
      top: 5 + Math.random() * 35,
      w: 0.4 + Math.random() * 0.8, // vw
      h: 0.3 + Math.random() * 0.6, // vw
      opacity: 0.1 + Math.random() * 0.2,
      rotation: Math.random() * 360,
    })), []);

  // --- Effects ---

  // Lamp
  useEffect(() => {
    const interval = setInterval(() => setLampBlink(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // Camera Parallax
  useEffect(() => {
    if (phase !== 'walking') return;
    const interval = setInterval(() => {
      setCameraOffset(prev => {
        const target = (walkX - 20) * 0.5; // Adjusted sensitivity
        return prev + (target - prev) * 0.05;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [phase, walkX]);

  // Walking Phase
  useEffect(() => {
    if (phase !== 'walking') return;
    const walkInterval = setInterval(() => {
      setWalkX(prev => {
        const next = prev + 0.5; // Slower walk
        if (next >= targetX) {
          clearInterval(walkInterval);
          setTimeout(() => setPhase('scanning'), 300);
          return targetX;
        }
        return next;
      });
      setWalkStep(prev => {
        const next = prev + 1;
        if (next % 12 === 0) soundSystemRef.current.playFootstep();
        return next;
      });
    }, 30);
    return () => clearInterval(walkInterval);
  }, [phase]);

  // Scanning Phase
  useEffect(() => {
    if (phase !== 'scanning') return;
    let pulses = 0;
    const maxPulses = 3;
    const scanInterval = setInterval(() => {
      setScanRadius(prev => {
        const next = prev + 2; // Speed
        if (next >= 100) { // %
          pulses++;
          if (pulses >= maxPulses) {
            clearInterval(scanInterval);
            setTimeout(() => setPhase('exclamation'), 200);
            return 0;
          }
          soundSystemRef.current.playSpark();
          return 0; 
        }
        return next;
      });
    }, 16);
    soundSystemRef.current.playLayerChange();
    return () => clearInterval(scanInterval);
  }, [phase]);

  // Exclamation Phase
  useEffect(() => {
    if (phase !== 'exclamation') return;
    setShowExclamation(true);
    soundSystemRef.current.playDiscovery();
    setShakeIntensity(5); // Shake magnitude
    
    const shakeDecay = setInterval(() => {
      setShakeIntensity(prev => {
        const next = prev * 0.9;
        if (next < 0.1) {
          clearInterval(shakeDecay);
          return 0;
        }
        return next;
      });
    }, 30);

    const timer = setTimeout(() => setPhase('dialogue'), 1500);
    return () => {
      clearTimeout(timer);
      clearInterval(shakeDecay);
    };
  }, [phase]);

  // Dialogue Phase
  useEffect(() => {
    if (phase !== 'dialogue') return;
    setIsTyping(true);
    setDisplayedText('');
    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx <= dialogueText.length) {
        setDisplayedText(dialogueText.slice(0, idx));
        if (idx % 4 === 0 && idx > 0) soundSystemRef.current.playScoreTick();
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 40);
    return () => clearInterval(typeInterval);
  }, [phase]);

  // Ready Phase
  useEffect(() => {
    if (phase !== 'ready') return;
    soundSystemRef.current.playLayerChange();
    const drillInterval = setInterval(() => {
      setDrillDown(prev => {
        const next = prev + 1.5;
        if (next >= 100) {
          clearInterval(drillInterval);
          if (!completeCalled.current) {
            completeCalled.current = true;
            setTimeout(onComplete, 500);
          }
          return 100;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(drillInterval);
  }, [phase, onComplete]);

  // Input Handlers
  const handleProceed = useCallback(() => {
    if (phase === 'dialogue' && !isTyping) {
      soundSystemRef.current.playClick();
      setPhase('ready');
    }
  }, [phase, isTyping]);

  const handleSkip = useCallback(() => {
    if (!completeCalled.current) {
      completeCalled.current = true;
      soundSystemRef.current.playClick();
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && phase === 'dialogue' && !isTyping) {
        e.preventDefault();
        handleProceed();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, isTyping, handleProceed, handleSkip]);


  // --- Render Helpers ---
  const bounceY = Math.sin(walkStep * 0.4) * 0.8; // vh units
  const shakeX = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
  const shakeY = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity : 0;
  const groundTop = 55; // %

  // Inline styles for consistency
  const S = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: '#0f172a',
      fontFamily: "'VT323', monospace",
      userSelect: 'none' as const,
      overflow: 'hidden',
    },
    scanlines: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15))',
      backgroundSize: '100% 4px',
      pointerEvents: 'none' as const,
      zIndex: 90,
    },
    skyLayer: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 30%, #334155 50%, #44403c 60%, #292524 70%, #1c1917 100%)',
    },
    groundLayer: {
      position: 'absolute' as const,
      left: 0, right: 0, bottom: 0,
      top: `${groundTop}%`,
      background: 'linear-gradient(180deg, #78350f 0%, #451a03 30%, #292524 60%, #1c1917 100%)',
      borderTop: '0.8vh solid #451a03',
      overflow: 'hidden',
    },
    dialogueBox: {
      position: 'absolute' as const,
      bottom: '10%', left: '50%',
      transform: 'translateX(-50%)',
      width: '80%', maxWidth: '800px',
      backgroundColor: 'rgba(0,0,0,0.85)',
      border: '4px solid #92400e',
      padding: '2rem',
      color: '#fef3c7',
      zIndex: 80,
      display: 'flex', flexDirection: 'column' as const, gap: '1rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    }
  };

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
      
      {/* Shake Wrapper */}
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${shakeX}vh, ${shakeY}vh)` }}>
        
        <div style={S.scanlines} />
        <div style={{ ...S.skyLayer, transform: `translateX(${cameraOffset}px)` }} />

        {/* Tunnel BG Overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `url(${tunnelBg})`, backgroundSize: 'cover', mixBlendMode: 'overlay' }} />

        {/* Stars */}
        <div style={{ transform: `translateX(${cameraOffset * 0.3}px)` }}>
          {stars.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              backgroundColor: 'white',
              borderRadius: '50%',
              width: `${s.w}vw`, height: `${s.w}vw`,
              top: `${s.top}%`, left: `${s.left}%`,
              animation: `twinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
              opacity: 0.6
            }} />
          ))}
        </div>

        {/* Ground */}
        <div style={S.groundLayer}>
          {/* Rocks */}
          {rockFragments.map((r, i) => (
             <div key={i} style={{
                position: 'absolute',
                left: `${r.left}%`, top: `${r.top}%`,
                width: `${r.w}vw`, height: `${r.h}vw`,
                backgroundColor: '#57534e',
                opacity: r.opacity,
                transform: `rotate(${r.rotation}deg)`
             }} />
          ))}

          {/* Oil Glow */}
          {(phase === 'exclamation' || phase === 'dialogue' || phase === 'ready') && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{
                 position: 'absolute',
                 left: '50%', top: '15%',
                 transform: 'translateX(-50%)',
                 width: '15vw', height: '8vw',
                 background: 'radial-gradient(ellipse, rgba(16,185,129,0.6) 0%, transparent 70%)',
                 filter: 'blur(2vw)'
               }}
            />
          )}

          {/* Oil Bubbles */}
          {(phase === 'dialogue' || phase === 'ready') && oilBubbles.map((b, i) => (
             <motion.div
               key={i}
               initial={{ y: 0, opacity: 0 }}
               animate={{ y: '-10vh', opacity: [0, 1, 0] }}
               transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: b.delay }}
               style={{
                  position: 'absolute',
                  left: `${45 + i * 2}%`, top: '15%',
                  width: `${b.size}vw`, height: `${b.size}vw`,
                  borderRadius: '50%',
                  backgroundColor: '#34d399',
                  boxShadow: '0 0 10px #10b981'
               }}
             />
          ))}

          {/* Drill Down Beam */}
          {phase === 'ready' && (
             <div style={{
                position: 'absolute',
                left: '50%', top: 0,
                transform: 'translateX(-50%)',
                width: '0.8vh',
                height: `${drillDown}%`,
                background: 'linear-gradient(to bottom, #f97316, #ef4444)',
                boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)'
             }} />
          )}

          {/* Scanning Radar Ring (Underground) */}
          {phase === 'scanning' && scanRadius > 0 && (
             <div style={{
                position: 'absolute',
                left: '50%', top: 0,
                transform: 'translate(-50%, -50%)',
                width: `${scanRadius}vw`, height: `${scanRadius}vw`,
                border: '2px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '50%',
                opacity: 1 - (scanRadius / 100)
             }} />
          )}
        </div>

        {/* Derrick - Responsive Size using VH */}
        <AnimatePresence>
          {(phase === 'exclamation' || phase === 'dialogue' || phase === 'ready') && (
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: `${100 - groundTop}%`, // Sit exactly on ground line
                  transform: 'translateX(-50%)',
                  zIndex: 20
               }}
            >
               {/* Scaled Derrick Container - ~20% of screen height */}
               <div style={{ width: '12vh', height: '20vh', position: 'relative' }}>
                  {/* Black Triangle Shape */}
                  <div style={{
                     width: '100%', height: '100%',
                     backgroundColor: '#1c1917', // Black/Dark Stone
                     clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', // Triangle
                     boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                  }} />
                  {/* Inner Detail */}
                  <div style={{
                     position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                     width: '20%', height: '60%',
                     backgroundColor: '#292524',
                     clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }} />
                  {/* Top Light */}
                  <div style={{
                     position: 'absolute', top: '-1vh', left: '50%', transform: 'translateX(-50%)',
                     width: '2vh', height: '2vh',
                     backgroundColor: '#ef4444',
                     borderRadius: '50%',
                     boxShadow: '0 0 10px #ef4444',
                     animation: 'twinkle 1s infinite'
                  }} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character */}
        <motion.div
           style={{
              position: 'absolute',
              left: `${walkX}%`,
              bottom: `${100 - groundTop}%`,
              transform: `translateX(-50%) translateY(${bounceY}vh)`,
              zIndex: 30,
              width: '12vh', // Responsive size
              height: '12vh'
           }}
        >
           {/* Exclamation */}
           <AnimatePresence>
             {showExclamation && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                 style={{ 
                    position: 'absolute', top: '-8vh', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '6vh', color: '#facc15', fontWeight: 'bold',
                    textShadow: '0.5vh 0.5vh 0 black'
                 }}
               >
                 !
               </motion.div>
             )}
           </AnimatePresence>

           <img src={characterImage} alt="Mory" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} />
           
           {/* Lamp Beam */}
           <div style={{
              position: 'absolute', top: '10%', right: '10%',
              width: '2vh', height: '2vh',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8), transparent)',
              filter: 'blur(5px)',
              opacity: lampBlink ? 1 : 0.5
           }} />
        </motion.div>

        {/* Dialogue UI */}
        <AnimatePresence>
           {phase === 'dialogue' && (
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 style={S.dialogueBox}
              >
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #78350f', paddingBottom: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 5px #f59e0b' }} />
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', fontSize: '1.2rem', color: '#f59e0b' }}>Mory</span>
                 </div>
                 <p style={{ fontSize: '1.5rem', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{displayedText}</p>
                 {!isTyping && (
                    <div style={{ alignSelf: 'flex-end', fontSize: '1rem', color: '#9ca3af', animation: 'twinkle 1s infinite' }}>
                       PRESS SPACE
                    </div>
                 )}
              </motion.div>
           )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
