import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getSoundSystem } from "../utils/soundSystem";

// [로컬 개발 시 변경할 부분]
// 로컬 VS Code에서는 아래 주석을 해제하고 figma:asset 줄을 주석 처리하세요.
// import bgImage from "../assets/MainBackground.png";
// import characterImage from "../assets/Mory.png";
// import logoIcon from "../assets/Logo.png";

// [현재 웹 빌더용 임포트]
import logoIcon from "../assets/Logo.png";
import bgImage from "../assets/Background.png";
import characterImage from "../assets/Mory.png";

interface IntroScreenProps {
  onStart: () => void;
  onHowItWorks: () => void;
}

export function IntroScreen({ onStart, onHowItWorks }: IntroScreenProps) {
  const [introPhase, setIntroPhase] = useState(0);
  const soundSystem = useRef(getSoundSystem());

  // Walking scene state
  const [walkX, setWalkX] = useState(-15);
  const [walkStep, setWalkStep] = useState(0);
  const [showExclamation, setShowExclamation] = useState(false);
  const [walkingDone, setWalkingDone] = useState(false);
  const [lampBlink, setLampBlink] = useState(false);
  const footstepTick = useRef(0);
  const walkTargetX = 45;
  const derrickX = 50;

  // Dialogue state
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Stars
  const stars = useMemo(() =>
    Array.from({ length: 35 }).map(() => ({
      w: 1 + Math.random() * 2.5,
      top: Math.random() * 60,
      left: Math.random() * 100,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 3,
    })), []);

  // Embedded rocks
  const embeddedRocks = useMemo(() =>
    Array.from({ length: 18 }).map(() => ({
      left: 5 + Math.random() * 90,
      top: 25 + Math.random() * 70,
      w: 0.3 + Math.random() * 0.8, // vw
      h: 0.2 + Math.random() * 0.5, // vw
      rotation: Math.random() * 360,
      shade: Math.floor(Math.random() * 3),
    })), []);

  useEffect(() => {
    const interval = setInterval(() => setLampBlink(p => !p), 500);
    return () => clearInterval(interval);
  }, []);

  // Phase 1: Walking
  useEffect(() => {
    if (introPhase !== 1) return;

    const walkInterval = setInterval(() => {
      setWalkX(prev => {
        const next = prev + 0.6;
        if (next >= walkTargetX) {
          clearInterval(walkInterval);
          setTimeout(() => {
            setShowExclamation(true);
            soundSystem.current.playDiscovery();
            setTimeout(() => setWalkingDone(true), 1500);
          }, 300);
          return walkTargetX;
        }
        return next;
      });
      setWalkStep(p => p + 1);
    }, 40);

    const stepInterval = setInterval(() => {
      footstepTick.current++;
      if (footstepTick.current % 5 === 0) {
        soundSystem.current.playFootstep();
      }
    }, 40);

    return () => {
      clearInterval(walkInterval);
      clearInterval(stepInterval);
    };
  }, [introPhase]);

  useEffect(() => {
    if (introPhase === 1 && walkingDone) {
      const timer = setTimeout(() => setIntroPhase(2), 800);
      return () => clearTimeout(timer);
    }
  }, [introPhase, walkingDone]);

  // Dialogue
  const dialogues: Record<number, string> = {
    2: "Hey, you there! I just found something incredible! My sensors are picking up a massive oil deposit right beneath this spot!",
    3: "I can't extract it alone — I need a skilled driller to help me tap into it. Will you help me strike oil?",
  };

  useEffect(() => {
    const text = dialogues[introPhase];
    if (!text) return;
    setDisplayedText("");
    setIsTyping(true);
    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx <= text.length) {
        setDisplayedText(text.slice(0, idx));
        idx++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);
    return () => clearInterval(typeInterval);
  }, [introPhase]);

  // Input
  const handleNext = () => {
    soundSystem.current.playClick();
    soundSystem.current.resume();
    if (introPhase === 0) setIntroPhase(1);
    else if (introPhase === 2 && !isTyping) setIntroPhase(3);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [introPhase, isTyping]);

  const groundH = 25;
  const rockShadeColors = ["#6b5a48", "#5a4a38", "#3d2e1f"];

  // --- Inline Styles for Local Robustness (Tailwind-free) ---
  const S = {
    container: {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative' as const,
      backgroundColor: '#0a0a0a',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      fontFamily: "'VT323', monospace",
      userSelect: 'none' as const,
    },
    absoluteFull: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
    },
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flexColCenter: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanlines: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
      backgroundSize: '100% 4px',
      pointerEvents: 'none' as const,
      zIndex: 50,
    },
    overlay: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      pointerEvents: 'none' as const,
      zIndex: 0,
    }
  };

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .text-glow { text-shadow: 0 0 10px rgba(251,191,36,0.5), 0 0 20px rgba(251,191,36,0.3); }
        .exclamation-pop { animation: excPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes excPop { 0%{transform:scale(0) translateY(0);opacity:0;} 60%{transform:scale(1.4) translateY(-16px);opacity:1;} 100%{transform:scale(1) translateY(-8px);opacity:1;} }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      <div style={S.overlay} />
      <div style={S.scanlines} />

      <AnimatePresence mode="wait">
        {/* =========== PHASE 0: Title =========== */}
        {introPhase === 0 && (
          <motion.div
            key="title-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ ...S.absoluteFull, zIndex: 20, ...S.flexColCenter }}
          >
            {/* Background Glow - Reduced size */}
            <div style={{ position: 'absolute', inset: 0, ...S.flexCenter, pointerEvents: 'none' }}>
              <div style={{ width: '30vw', height: '30vw', backgroundColor: '#f59e0b', filter: 'blur(10vw)', opacity: 0.1, animation: 'pulse 2s infinite' }} />
            </div>

            {/* Logo - Adjusted to 25vh (was 35vh) */}
            <div style={{ position: 'relative', marginBottom: '3vh' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: '#f59e0b', filter: 'blur(4vh)', opacity: 0.2, animation: 'pulse 2s infinite' }} />
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                src={logoIcon}
                alt="Game Logo"
                style={{ width: 'auto', height: '25vh', minHeight: '180px', objectFit: 'contain', filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))' }}
              />
            </div>

            {/* Title Text - Adjusted to 10vh (was 12vh) */}
            <h1 style={{ fontSize: '10vh', lineHeight: 0.9, fontWeight: 900, textAlign: 'center', color: 'white', textShadow: '0.4vh 0.4vh 0 black', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="text-glow" style={{ display: 'block', color: 'white', transform: 'skewX(-6deg)' }}>OIL</span>
              <span className="text-glow" style={{ display: 'block', color: '#f59e0b', transform: 'skewX(-6deg)' }}>STRIKE</span>
            </h1>

            {/* Subtitle - Adjusted to 3vh (was 4vh) */}
            <p style={{ marginTop: '3vh', fontSize: '3vh', color: 'rgba(253, 230, 138, 0.8)', letterSpacing: '0.3em', textTransform: 'uppercase', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.8vh 2.5vh' }}>
              Deep Drilling Simulator
            </p>

            {/* Start Prompt - Adjusted to 3.5vh (was 5vh) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: '6vh', color: '#fbbf24', fontSize: '3.5vh', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Press Space to Start
            </motion.div>
          </motion.div>
        )}

        {/* =========== PHASE 1: Walking Discovery Scene =========== */}
        {introPhase === 1 && (
          <motion.div
            key="walking-scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ ...S.absoluteFull, zIndex: 20 }}
          >
            {/* Stars */}
            {stars.map((star, i) => (
              <motion.div
                key={i}
                style={{ position: 'absolute', backgroundColor: 'white', borderRadius: '50%', width: star.w, height: star.w, top: `${star.top}%`, left: `${star.left}%` }}
                animate={{ opacity: [0.2, 0.9, 0.2] }}
                transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
              />
            ))}

            {/* Horizon Glow */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${groundH}%`, height: '8vh', pointerEvents: 'none', background: 'linear-gradient(to top, rgba(120, 53, 15, 0.2), transparent)' }} />

            {/* Ground Layers */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${groundH}%` }}>
              {/* SVG Surface Line */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1vh', transform: 'translateY(-0.5vh)', pointerEvents: 'none' }} viewBox="0 0 1000 6" preserveAspectRatio="none">
                <path d="M0,3 Q50,0 100,3 T200,3 T300,2 T400,4 T500,3 T600,2 T700,4 T800,3 T900,2 T1000,3" fill="none" stroke="#8b7355" strokeWidth="2" opacity="0.6" />
              </svg>

              {/* Layers */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, #5c4a35, #4a3825)' }} />
              <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '25%', background: 'linear-gradient(to bottom, #3d2b1f, #352418)' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px' }} viewBox="0 0 1000 4" preserveAspectRatio="none">
                  <path d="M0,2 Q80,0 160,2 T320,2 T480,3 T640,1 T800,2 T1000,2" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                </svg>
              </div>
              <div style={{ position: 'absolute', top: '55%', left: 0, right: 0, height: '25%', background: 'linear-gradient(to bottom, #2a1a0e, #221508)' }}>
                 <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px' }} viewBox="0 0 1000 4" preserveAspectRatio="none">
                  <path d="M0,2 Q120,3 240,1 T480,2 T720,3 T960,1 T1000,2" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                </svg>
              </div>
              <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, #1a0f06, #0d0804)' }}>
                 <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px' }} viewBox="0 0 1000 4" preserveAspectRatio="none">
                  <path d="M0,2 Q150,0 300,2 T600,3 T900,1 T1000,2" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Rocks */}
              {embeddedRocks.map((rock, i) => (
                <div key={`rock-${i}`} style={{ position: 'absolute', left: `${rock.left}%`, top: `${rock.top}%`, width: `${rock.w}vw`, height: `${rock.h}vw`, background: rockShadeColors[rock.shade], transform: `rotate(${rock.rotation}deg)`, opacity: 0.5 + Math.random() * 0.3, borderRadius: '50%' }} />
              ))}
            </div>

            {/* Derrick - Adjusted Height 25vh */}
            <div style={{ position: 'absolute', zIndex: 10, left: `${derrickX}%`, bottom: `${groundH}%`, transform: 'translateX(-50%)' }}>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', width: '20vh', height: '35vh', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center 70%, rgba(255,220,150,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
                  {/* Structure */}
                  <div style={{ width: '7vh', height: '25vh', background: '#1a1510', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', position: 'relative' }}>
                     {/* Red Light */}
                     <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} style={{ position: 'absolute', top: '-1.2vh', left: '50%', transform: 'translateX(-50%)', width: '2.5vh', height: '2.5vh', background: 'red', borderRadius: '50%', boxShadow: '0 0 15px red' }} />
                  </div>
               </motion.div>
            </div>

            {/* Character - Adjusted to 20vh */}
            <div style={{ position: 'absolute', zIndex: 30, left: `${walkX}%`, bottom: `${groundH - 3}%`, transform: 'translateX(-50%)' }}>
               <AnimatePresence>
                {showExclamation && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', top: '-8vh', left: '50%', transform: 'translateX(-50%)' }}>
                    <div className="text-6xl font-black text-red-500 exclamation-pop" style={{ fontSize: '8vh', color: '#ef4444', fontWeight: 900, textShadow: '0.4vh 0.4vh 0 black' }}>!</div>
                  </motion.div>
                )}
               </AnimatePresence>
               <img src={characterImage} alt="Mory" style={{ width: 'auto', height: '20vh', imageRendering: 'pixelated', transform: walkingDone ? "scaleX(-1)" : `scaleX(-1) translateY(${Math.sin(walkStep * 0.5) * 3}px) rotate(${Math.sin(walkStep * 0.5) * 2}deg)` }} />
            </div>

            {/* Scene Label - Adjusted to 2.5vh */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ position: 'absolute', top: '5vh', left: '50%', transform: 'translateX(-50%)', color: 'rgba(253, 230, 138, 0.4)', fontSize: '2.5vh', letterSpacing: '0.5em', textTransform: 'uppercase', zIndex: 10 }}>
              Exploration Site
            </motion.div>
          </motion.div>
        )}

        {/* =========== PHASE 2 & 3: Dialogue =========== */}
        {(introPhase === 2 || introPhase === 3) && (
          <motion.div
            key={`phase-${introPhase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...S.absoluteFull, zIndex: 20, ...S.flexCenter }}
          >
            {/* Stars Background again */}
            {stars.map((star, i) => (
              <motion.div key={i} style={{ position: 'absolute', backgroundColor: 'white', borderRadius: '50%', width: star.w, height: star.w, top: `${star.top}%`, left: `${star.left}%` }} animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }} />
            ))}

            <div style={{ position: 'relative', width: '95%', maxWidth: '1400px', padding: '3vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4vh', zIndex: 30 }}>
               {/* Portrait - Adjusted to 22vh */}
               <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '22vh', height: '22vh', position: 'relative', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', border: '0.5vh solid rgba(120, 53, 15, 0.5)', overflow: 'hidden', boxShadow: '0 0 4vh rgba(245, 158, 11, 0.2)' }}>
                     <img src={characterImage} alt="Mory Portrait" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.5) translateY(10%)', imageRendering: 'pixelated' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '-1.5vh', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'black', border: '0.2vh solid #d97706', padding: '0.4vh 1.5vh', borderRadius: '0.4vh', color: '#f59e0b', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '1.8vh', whiteSpace: 'nowrap', boxShadow: '0 0.4vh 0.8vh rgba(0,0,0,0.3)' }}>
                    Mory the Mole
                  </div>
               </motion.div>

               {/* Dialogue Box - Widened significantly */}
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', border: '0.3vh solid #92400e', padding: '3vh 4vh', position: 'relative', boxShadow: '0 0 4vh rgba(0,0,0,0.5)', width: '80vw', maxWidth: '1200px' }}>
                  {/* Corner decos */}
                  <div style={{ position: 'absolute', top: '-0.8vh', left: '-0.8vh', width: '1.5vh', height: '1.5vh', borderTop: '0.3vh solid #f59e0b', borderLeft: '0.3vh solid #f59e0b' }} />
                  <div style={{ position: 'absolute', top: '-0.8vh', right: '-0.8vh', width: '1.5vh', height: '1.5vh', borderTop: '0.3vh solid #f59e0b', borderRight: '0.3vh solid #f59e0b' }} />
                  <div style={{ position: 'absolute', bottom: '-0.8vh', left: '-0.8vh', width: '1.5vh', height: '1.5vh', borderBottom: '0.3vh solid #f59e0b', borderLeft: '0.3vh solid #f59e0b' }} />
                  <div style={{ position: 'absolute', bottom: '-0.8vh', right: '-0.8vh', width: '1.5vh', height: '1.5vh', borderBottom: '0.3vh solid #f59e0b', borderRight: '0.3vh solid #f59e0b' }} />

                  <h3 style={{ color: 'rgba(245, 158, 11, 0.5)', fontSize: '1.8vh', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5vh', borderBottom: '1px solid rgba(120, 53, 15, 0.5)', paddingBottom: '0.8vh' }}>
                    Incoming Transmission
                  </h3>

                  <p style={{ fontSize: '3vh', color: '#fef3c7', lineHeight: 1.6, minHeight: '10vh', textShadow: '0.2vh 0.2vh 0 rgba(0,0,0,0.5)' }}>
                    {displayedText}
                    <span className="animate-pulse" style={{ display: 'inline-block', width: '1.2vh', height: '2.5vh', backgroundColor: '#f59e0b', marginLeft: '0.5vh', verticalAlign: 'middle' }} />
                  </p>

                  <div style={{ marginTop: '2.5vh', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2vh' }}>
                     {!isTyping && introPhase === 2 && (
                        <div style={{ color: 'rgba(245, 158, 11, 0.7)', fontSize: '1.8vh', textTransform: 'uppercase', letterSpacing: '0.1em', animation: 'pulse 1s infinite' }}>
                           Press Space ▶
                        </div>
                     )}
                     {!isTyping && introPhase === 3 && (
                        <button onClick={onStart} style={{ padding: '1.2vh 3vh', backgroundColor: '#059669', color: 'white', fontWeight: 'bold', fontSize: '2.2vh', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '0.4vh solid #065f46', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.1s' }}>
                           Help Mory
                        </button>
                     )}
                  </div>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
