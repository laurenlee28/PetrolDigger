import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Target, User, Cpu, ArrowLeft, ArrowRight, Zap, ArrowDown, MoveHorizontal, Droplets, Timer, Trophy } from "lucide-react";
import { getSoundSystem } from "../utils/soundSystem";
import characterImage from '../assets/Mory.png'; // Local fallback for character image
import bgImage from "../assets/BackGround.png"; // Local fallback for background image

interface TutorialScreenProps {
  onComplete: () => void;
}

export function TutorialScreen({ onComplete }: TutorialScreenProps) {
  const [tutorialStep, setTutorialStep] = useState(0);
  const soundSystem = useRef(getSoundSystem());

  // Geology Layers with distinct wave properties
  const layers = [
    { color: "#3f3f46", name: "Overburden", thickness: 56, target: false, amp: 15, freq: 0.03, phase: 0 },
    { color: "#1c1917", name: "Cap Rock", thickness: 56, target: false, amp: 20, freq: 0.05, phase: 100 },
    { color: "#09090b", name: "Impermeable", thickness: 56, target: false, amp: 22, freq: 0.03, phase: 40 },
    { color: "#059669", name: "Reservoir (Target)", thickness: 84, target: true, amp: 18, freq: 0.04, phase: 150 },
    { color: "#020617", name: "Basement", thickness: 98, target: false, amp: 12, freq: 0.03, phase: 200 },
  ];

  const width = 300;
  const totalHeight = 350;
  const boundaries: number[][] = [];

  boundaries.push(Array.from({ length: width / 5 + 1 }, (_, i) => {
    const x = i * 5;
    return Math.sin(x * 0.02) * 5;
  }));

  let currentMeanY = 0;
  const layerMidpoints: number[] = [];

  layers.forEach((l) => {
    const startY = currentMeanY;
    currentMeanY += l.thickness;
    layerMidpoints.push(startY + l.thickness / 2);
    const boundary = Array.from({ length: width / 5 + 1 }, (_, i) => {
      const x = i * 5;
      return currentMeanY + Math.sin((x + l.phase) * l.freq) * l.amp + Math.sin(x * 0.1) * (l.amp * 0.3);
    });
    boundaries.push(boundary);
  });

  const tutorialDialogues = [
    {
      text: "See that green layer? That's our oil reservoir!\nWe drill down vertically first, then steer sideways to stay inside the pay zone — that's called horizontal drilling!",
    },
    {
      text: "In Stage 1, you drill VERTICALLY through rock layers!\nDodge the boulders and hazards as you descend — reach the shale reservoir to advance!",
    },
    {
      text: "Stage 2 is called GEOSTEERING — drilling sideways through the reservoir!\nCollect all the oil droplets within the time limit. The faster you collect them all, the higher your rank. Go for 1st place!",
    }
  ];

  const handleNext = () => {
    soundSystem.current.playTransition();
    if (tutorialStep < 2) {
      setTutorialStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tutorialStep]);

  // Helper to build SVG layer paths
  const buildLayerPath = (i: number) => {
    const topBoundary = boundaries[i];
    const bottomBoundary = boundaries[i + 1];
    let path = `M 0 ${topBoundary[0]}`;
    for (let k = 1; k < topBoundary.length; k++) path += ` L ${k * 5} ${topBoundary[k]}`;
    for (let k = bottomBoundary.length - 1; k >= 0; k--) path += ` L ${k * 5} ${bottomBoundary[k]}`;
    path += " Z";
    return path;
  };

  // --- Shared inline styles ---
  const S = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'VT323', monospace",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      userSelect: 'none' as const,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
    },
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      pointerEvents: 'none' as const,
    },
    scanlines: {
      position: 'fixed' as const,
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
      backgroundSize: '100% 4px',
      pointerEvents: 'none' as const,
    },
    mainWrap: {
      maxWidth: '1600px',
      width: '100%',
      minHeight: '100vh',
      padding: '1rem 1.5rem',
      position: 'relative' as const,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '1rem',
      borderBottom: '4px solid rgba(255,255,255,0.2)',
      paddingBottom: '1rem',
      flexShrink: 0,
      gap: '1rem',
    },
    progressBar: {
      display: 'flex',
      gap: '0.5rem',
    },
    phaseLabel: {
      fontSize: 'clamp(1rem, 2.5vh, 1.5rem)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.2em',
      color: '#f59e0b',
      fontWeight: 'bold',
      textAlign: 'right' as const,
      textShadow: '2px 2px 0 #000',
    },
    contentArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
    },
    grid3col: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      width: '100%',
    },
    grid3colResponsive: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.75rem',
    },
    boxRetro: {
      background: 'rgba(0,0,0,0.85)',
      border: '4px solid #334155',
      boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
    },
    svgContainer: {
      flex: 1,
      backgroundColor: 'black',
      border: '4px solid #475569',
      position: 'relative' as const,
      overflow: 'hidden',
      width: '100%',
    },
    moryDialogueBubble: {
      backgroundColor: 'rgba(26, 21, 16, 0.9)',
      border: '2px solid rgba(245, 158, 11, 0.6)',
      padding: '1.5rem',
      position: 'relative' as const,
      width: '100%',
      marginBottom: '1.5rem',
      maxWidth: '28rem',
      margin: '0 auto 1.5rem',
      boxShadow: '6px 6px 0 rgba(0,0,0,0.6), inset 0 0 30px rgba(251,191,36,0.05)',
    },
    cornerAccent: (top: string, left: string, right?: string, bottom?: string): React.CSSProperties => ({
      position: 'absolute',
      top: top !== 'auto' ? top : undefined,
      left: left !== 'auto' ? left : undefined,
      right: right || undefined,
      bottom: bottom || undefined,
      width: '0.5rem', height: '0.5rem',
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
    }),
    moryNameTag: {
      position: 'absolute' as const,
      top: '-1rem', left: '1.5rem',
      backgroundColor: '#f59e0b',
      padding: '0.1rem 0.75rem',
      color: 'black',
      fontSize: '1.1rem',
      letterSpacing: '0.15em',
    },
    moryText: {
      color: '#fef3c7',
      fontSize: 'clamp(1rem, 2vh, 1.25rem)',
      lineHeight: 1.6,
      letterSpacing: '0.05em',
      marginTop: '0.5rem',
      whiteSpace: 'pre-line' as const,
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    },
    moryImg: {
      width: 'clamp(8rem, 15vh, 12rem)',
      height: 'clamp(8rem, 15vh, 12rem)',
      objectFit: 'contain' as const,
      imageRendering: 'pixelated' as const,
      filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.8))',
      flexShrink: 0,
    },
    pressSpace: {
      marginTop: '1.5rem',
      fontSize: 'clamp(1rem, 2vh, 1.25rem)',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      flexShrink: 0,
    },
    infoCard: (borderTopColor: string): React.CSSProperties => ({
      ...({
        background: 'rgba(0,0,0,0.85)',
        border: '4px solid #334155',
        boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
      }),
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: `4px solid ${borderTopColor}`,
    }),
    iconBox: (borderColor: string, bgColor: string): React.CSSProperties => ({
      width: '2.5rem', height: '2.5rem',
      border: `2px solid ${borderColor}`,
      backgroundColor: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '0.5rem',
    }),
    cardText: (color: string): React.CSSProperties => ({
      color, fontSize: 'clamp(0.6rem, 1.3vh, 0.875rem)',
      textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.3,
    }),
  };

  // Tail triangle (pointing down)
  const BubbleTail = () => (
    <>
      <div style={{
        position: 'absolute', bottom: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
        borderTop: '14px solid rgba(245, 158, 11, 0.6)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-0.5rem', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
        borderTop: '12px solid rgba(26, 21, 16, 0.9)', zIndex: 10,
      }} />
    </>
  );

  // Mory column component (shared across steps)
  const MoryColumn = ({ stepIndex }: { stepIndex: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={S.moryDialogueBubble}>
        <div style={S.cornerAccent('0', '0')} />
        <div style={{ ...S.cornerAccent('0', 'auto', '0') }} />
        <div style={{ ...S.cornerAccent('auto', '0', undefined, '0') }} />
        <div style={{ ...S.cornerAccent('auto', 'auto', '0', '0') }} />
        <div style={S.moryNameTag}>MORY</div>
        <p style={S.moryText}>{tutorialDialogues[stepIndex].text}</p>
        <BubbleTail />
      </div>
      <img src={characterImage} alt="Mory" style={S.moryImg} />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          ...S.pressSpace,
          color: stepIndex === 2 ? '#34d399' : '#fbbf24',
          textAlign: 'center',
        }}
      >
        {stepIndex === 2 ? 'Press Space to Launch' : 'Press Space'}
      </motion.div>
    </div>
  );

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 1024px) {
          .tutorial-grid-3 { grid-template-columns: 1fr !important; }
          .tutorial-span2 { grid-column: span 1 !important; }
        }
      `}</style>

      <div style={S.overlay} />
      <div style={S.scanlines} />

      <div style={S.mainWrap}>
        {/* Header / Progress */}
        <div style={S.headerRow}>
          <div style={S.progressBar}>
            {[0, 1, 2].map(step => (
              <div key={step} style={{
                height: '1rem', width: '3rem', border: '2px solid',
                borderColor: step <= tutorialStep ? '#fcd34d' : '#334155',
                backgroundColor: step <= tutorialStep ? '#f59e0b' : '#0f172a',
                boxShadow: step <= tutorialStep ? '0 0 10px rgba(245,158,11,0.5)' : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <div style={S.phaseLabel}>
            Training Phase {tutorialStep + 1}/3
          </div>
        </div>

        {/* Main Content */}
        <div style={S.contentArea}>
          <AnimatePresence mode="wait">

            {/* ========== STEP 0: Target Zone ========== */}
            {tutorialStep === 0 && (
              <motion.div
                key="step0"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="tutorial-grid-3"
                style={S.grid3col}
              >
                {/* Col 1: Geological Structure */}
                <div style={{ ...S.boxRetro, padding: '1rem', display: 'flex', flexDirection: 'column', height: '520px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', flexShrink: 0 }}>
                    <h3 style={{ fontSize: 'clamp(1rem, 2.2vh, 1.5rem)', fontWeight: 'bold', color: '#34d399', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>
                      Geological Structure
                    </h3>
                  </div>
                  <div style={S.svgContainer}>
                    {/* Target label overlay */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                      {layers.map((l, i) => (
                        l.target ? (
                          <div key={`label-${i}`} style={{
                            position: 'absolute', width: '100%',
                            top: `${(layerMidpoints[i] / totalHeight) * 100}%`,
                            transform: 'translateY(-50%)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', textShadow: '1px 1px 2px black' }}>
                              TARGET
                            </span>
                          </div>
                        ) : null
                      ))}
                    </div>
                    <svg viewBox={`0 0 ${width} ${totalHeight}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                      {layers.map((l, i) => (
                        <g key={i}>
                          <path d={buildLayerPath(i)} fill={l.color} stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                          {l.target && (
                            <motion.path d={buildLayerPath(i)} fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="10 5"
                              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
                          )}
                        </g>
                      ))}
                      <g transform={`translate(50, ${boundaries[0][10] - 28})`}>
                        <polygon points="0,28 6,0 12,28" fill="#888" stroke="#aaa" strokeWidth="1" />
                        <rect x="-3" y="27" width="18" height="3" fill="#777" />
                        <rect x="5" y="28" width="2" height="14" fill="#f97316" opacity="0.8" />
                        <motion.circle cx="6" cy="-2" r="2" fill="#ef4444"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Col 2: Drill Path */}
                <div style={{ ...S.boxRetro, padding: '1rem', display: 'flex', flexDirection: 'column', height: '520px' }}>
                  <h3 style={{ fontSize: 'clamp(1rem, 2.2vh, 1.5rem)', fontWeight: 'bold', color: '#fb923c', marginBottom: '1rem', textTransform: 'uppercase', textShadow: '2px 2px 0 #000', flexShrink: 0 }}>
                    Drill Path
                  </h3>
                  <div style={S.svgContainer}>
                    <svg viewBox={`0 0 ${width} ${totalHeight}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
                      {layers.map((l, i) => (
                        <g key={i}>
                          <path d={buildLayerPath(i)} fill={l.color} opacity="0.6" stroke="rgba(0,0,0,0.3)" />
                          {l.target && <path d={buildLayerPath(i)} fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="10 5" opacity="0.5" />}
                        </g>
                      ))}
                    </svg>
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 300 350" preserveAspectRatio="none">
                      <g transform="translate(38, -4)">
                        <polygon points="0,32 8,0 16,32" fill="#888" stroke="#aaa" strokeWidth="1" />
                        <rect x="-4" y="31" width="24" height="4" fill="#777" />
                        <motion.circle cx="8" cy="-3" r="3" fill="#ef4444"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
                      </g>
                      <motion.path
                        initial={{ pathLength: 0, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: [1, 1, 0.4, 1] }}
                        transition={{ pathLength: { duration: 4, ease: "linear" }, opacity: { duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: 4 } }}
                        d="M 46 35 L 46 210 L 110 235 L 170 200 L 230 230 L 290 200"
                        fill="none" stroke="#f97316" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                        style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.8))" }}
                      />
                      <motion.circle cx="46" cy="35" r="4" fill="#f97316"
                        animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                        style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.9))" }} />
                    </svg>
                  </div>
                </div>

                {/* Col 3: Mory */}
                <MoryColumn stepIndex={0} />
              </motion.div>
            )}

            {/* ========== STEP 1: Vertical Drill ========== */}
            {tutorialStep === 1 && (
              <motion.div
                key="step1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="tutorial-grid-3"
                style={S.grid3col}
              >
                {/* Col 1-2: Stage Info + Preview */}
                <div className="tutorial-span2" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Stage 1 Description */}
                  <div style={{ ...S.boxRetro, padding: '1rem', borderLeft: '8px solid #f97316', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ ...S.iconBox('#f97316', 'rgba(124,45,18,0.3)'), width: '2.5rem', height: '2.5rem', flexShrink: 0 }}>
                        <ArrowDown style={{ width: 24, height: 24, color: '#fb923c' }} />
                      </div>
                      <h2 style={{ fontSize: 'clamp(1rem, 2.5vh, 1.5rem)', fontWeight: 900, color: '#fb923c', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>
                        Stage 1: Vertical Drill
                      </h2>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.875rem, 1.8vh, 1.125rem)', lineHeight: 1.5 }}>
                      Drill straight down through underground rock layers. Dodge boulders and hazards while descending as fast as you can. Your goal is to reach the <span style={{ color: '#34d399', fontWeight: 'bold' }}>shale reservoir (target layer)</span> to advance to Stage 2!
                    </p>
                  </div>

                  {/* Surf Game Preview */}
                  <div style={{ ...S.boxRetro, padding: 0, display: 'flex', flexDirection: 'column', height: '320px', overflow: 'hidden' }}>
                    {/* HUD */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: 'black', borderBottom: '2px solid #475569',
                      padding: '0.375rem 0.75rem', flexShrink: 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#f87171', fontSize: '0.875rem', textTransform: 'uppercase' }}>HP</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3].map(h => (
                            <div key={`hp-${h}`} style={{
                              width: '1.25rem', height: '0.75rem',
                              border: '1px solid',
                              borderColor: h <= 2 ? '#f87171' : '#475569',
                              backgroundColor: h <= 2 ? '#ef4444' : '#1e293b',
                            }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#fbbf24', fontSize: '0.875rem', textTransform: 'uppercase' }}>Score</span>
                        <span style={{ color: 'white', fontSize: '1.125rem' }}>328</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#22d3ee', fontSize: '0.875rem', textTransform: 'uppercase' }}>Boost</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[1, 2, 3].map(b => (
                            <div key={`boost-${b}`} style={{
                              width: '1.25rem', height: '0.75rem',
                              border: '1px solid',
                              borderColor: b <= 2 ? '#22d3ee' : '#475569',
                              backgroundColor: b <= 2 ? '#06b6d4' : '#1e293b',
                            }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Game Scene */}
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
                      <svg viewBox="0 0 480 260" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                        <rect width="480" height="260" fill="#0d0b09" />
                        {/* Rock veins */}
                        {[
                          "M 0 40 Q 60 50 120 30 Q 180 10 240 45 Q 300 70 360 35 Q 420 10 480 50",
                          "M 0 100 Q 80 110 140 90 Q 200 75 280 105 Q 360 125 440 90 L 480 95",
                          "M 0 160 Q 70 175 130 150 Q 190 130 260 165 Q 330 190 400 155 L 480 160",
                          "M 0 220 Q 50 210 110 230 Q 170 245 250 215 Q 340 195 420 225 L 480 220",
                          "M 60 0 Q 70 40 55 80 Q 45 120 65 160 Q 80 200 60 260",
                          "M 180 0 Q 190 50 175 100 Q 165 150 185 200 Q 195 240 180 260",
                          "M 320 0 Q 310 45 330 90 Q 345 130 325 170 Q 310 210 330 260",
                          "M 440 0 Q 430 55 445 110 Q 455 160 435 210 Q 425 240 440 260",
                        ].map((d, idx) => (
                          <path key={`crack-${idx}`} d={d} fill="none" stroke="#2a1f15" strokeWidth="2" opacity="0.7" />
                        ))}
                        {/* Boulders */}
                        {[
                          { cx: 80, cy: 60, r: 22 }, { cx: 380, cy: 45, r: 18 }, { cx: 150, cy: 150, r: 28 },
                          { cx: 330, cy: 130, r: 24 }, { cx: 50, cy: 200, r: 16 }, { cx: 420, cy: 190, r: 20 },
                          { cx: 240, cy: 80, r: 14 }, { cx: 200, cy: 220, r: 18 }, { cx: 350, cy: 230, r: 15 },
                          { cx: 110, cy: 110, r: 12 },
                        ].map((rock, idx) => (
                          <g key={`rock-${idx}`}>
                            <ellipse cx={rock.cx} cy={rock.cy} rx={rock.r} ry={rock.r * 0.8} fill={`hsl(0, 0%, ${28 + (idx % 4) * 4}%)`} />
                            <ellipse cx={rock.cx - rock.r * 0.2} cy={rock.cy - rock.r * 0.3} rx={rock.r * 0.5} ry={rock.r * 0.3} fill="rgba(255,255,255,0.08)" />
                          </g>
                        ))}
                        {/* Fire hazards */}
                        {[
                          { cx: 280, cy: 50, r: 14 }, { cx: 430, cy: 100, r: 12 },
                          { cx: 60, cy: 140, r: 10 }, { cx: 380, cy: 220, r: 13 },
                        ].map((fire, idx) => (
                          <g key={`fire-${idx}`}>
                            <circle cx={fire.cx} cy={fire.cy} r={fire.r + 4} fill="#f97316" opacity="0.15" />
                            <circle cx={fire.cx} cy={fire.cy} r={fire.r} fill="#ef4444" opacity="0.6" />
                            <circle cx={fire.cx} cy={fire.cy} r={fire.r * 0.6} fill="#fb923c" opacity="0.8" />
                            <circle cx={fire.cx} cy={fire.cy} r={fire.r * 0.3} fill="#fbbf24" opacity="0.9" />
                          </g>
                        ))}
                        {/* Boost pickups */}
                        {[
                          { x: 130, y: 200 }, { x: 300, y: 175 }, { x: 210, y: 100 },
                          { x: 400, y: 155 }, { x: 70, y: 90 }, { x: 460, y: 60 },
                        ].map((bolt, idx) => (
                          <g key={`bolt-${idx}`} transform={`translate(${bolt.x}, ${bolt.y})`}>
                            <circle cx="0" cy="0" r="6" fill="#a855f7" opacity="0.15" />
                            <polygon points="-3,-8 2,-2 -1,-2 3,8 -2,2 1,2" fill="#a855f7" stroke="#c084fc" strokeWidth="0.5" />
                          </g>
                        ))}
                        {/* Target layer */}
                        <rect x="0" y="225" width="480" height="35" fill="#059669" opacity="0.25" />
                        <motion.line x1="0" y1="225" x2="480" y2="225" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4"
                          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
                        <motion.line x1="0" y1="260" x2="480" y2="260" stroke="#10b981" strokeWidth="2" strokeDasharray="8 4"
                          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
                        <text x="240" y="247" textAnchor="middle" fill="#34d399" style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '3px' }}>SHALE RESERVOIR · TARGET</text>
                        {/* Depth arrow */}
                        <g transform="translate(15, 130)">
                          <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <polygon points="0,-12 6,0 0,-4 -6,0" fill="#f97316" opacity="0.7" />
                            <polygon points="0,0 6,12 0,8 -6,12" fill="#f97316" opacity="0.5" />
                          </motion.g>
                        </g>
                        {/* Player */}
                        <g transform="translate(230, 130)">
                          <g transform="translate(2, -8)">
                            <rect x="-3" y="-8" width="6" height="6" fill="#fbbf24" rx="1" />
                            <rect x="-4" y="-2" width="8" height="8" fill="#92400e" />
                            <rect x="-1" y="-9" width="2" height="2" fill="#fef3c7" />
                          </g>
                        </g>
                      </svg>
                      {/* Scanline overlay */}
                      <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.15) 50%)', backgroundSize: '100% 4px',
                      }} />
                    </div>
                  </div>

                  {/* 3 Info Cards */}
                  <div style={S.grid3colResponsive}>
                    <div style={S.infoCard('#0ea5e9')}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <motion.div animate={{ x: [-3, 0] }} transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}
                          style={S.iconBox('#0ea5e9', 'rgba(12,74,110,0.4)')}>
                          <ArrowLeft style={{ width: 16, height: 16, color: '#38bdf8' }} />
                        </motion.div>
                        <motion.div animate={{ x: [0, 3] }} transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}
                          style={S.iconBox('#0ea5e9', 'rgba(12,74,110,0.4)')}>
                          <ArrowRight style={{ width: 16, height: 16, color: '#38bdf8' }} />
                        </motion.div>
                      </div>
                      <p style={S.cardText('#7dd3fc')}>Steer left & right<br />to dodge obstacles</p>
                    </div>
                    <div style={S.infoCard('#ef4444')}>
                      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 1 }}
                        style={S.iconBox('#ef4444', 'rgba(127,29,29,0.3)')}>
                        <Cpu style={{ width: 20, height: 20, color: '#f87171' }} />
                      </motion.div>
                      <p style={S.cardText('#fca5a5')}>AI-X is chasing you!<br />Stay ahead to survive</p>
                    </div>
                    <div style={S.infoCard('#a855f7')}>
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                        style={S.iconBox('#a855f7', 'rgba(88,28,135,0.3)')}>
                        <Zap style={{ width: 20, height: 20, color: '#c084fc' }} />
                      </motion.div>
                      <p style={S.cardText('#d8b4fe')}>Use boost to<br />outrun AI-X</p>
                    </div>
                  </div>
                </div>

                {/* Col 3: Mory */}
                <MoryColumn stepIndex={1} />
              </motion.div>
            )}

            {/* ========== STEP 2: Horizontal Drill ========== */}
            {tutorialStep === 2 && (
              <motion.div
                key="step2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="tutorial-grid-3"
                style={S.grid3col}
              >
                {/* Col 1-2: Stage Info + Preview */}
                <div className="tutorial-span2" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Stage 2 Description */}
                  <div style={{ ...S.boxRetro, padding: '1rem', borderLeft: '8px solid #10b981', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ ...S.iconBox('#10b981', 'rgba(6,78,59,0.3)'), width: '2.5rem', height: '2.5rem', flexShrink: 0 }}>
                        <MoveHorizontal style={{ width: 24, height: 24, color: '#34d399' }} />
                      </div>
                      <h2 style={{ fontSize: 'clamp(1rem, 2.5vh, 1.5rem)', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>
                        Stage 2: Horizontal Drill
                      </h2>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.875rem, 1.8vh, 1.125rem)', lineHeight: 1.5 }}>
                      Now inside the shale reservoir, steer your drill sideways using <span style={{ color: '#34d399', fontWeight: 'bold' }}>geosteering</span> technology. Collect all <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>oil droplets</span> within the time limit — the faster you collect them, the higher your ranking!
                    </p>
                  </div>

                  {/* Game Preview */}
                  <div style={{ ...S.boxRetro, padding: 0, display: 'flex', flexDirection: 'column', height: '320px', overflow: 'hidden' }}>
                    {/* HUD */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: 'black', borderBottom: '2px solid #475569',
                      padding: '0.375rem 0.75rem', flexShrink: 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#fbbf24', fontSize: '0.875rem', textTransform: 'uppercase' }}>Oil</span>
                        <span style={{ color: 'white', fontSize: '1.125rem' }}>7/12</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#f87171', fontSize: '0.875rem', textTransform: 'uppercase' }}>Time</span>
                        <span style={{ color: 'white', fontSize: '1.125rem' }}>01:24</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#facc15', fontSize: '0.875rem', textTransform: 'uppercase' }}>Rank</span>
                        <span style={{ color: 'white', fontSize: '1.125rem' }}>#2</span>
                      </div>
                    </div>

                    {/* Game Scene */}
                    <div style={{ flex: 1, position: 'relative', backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
                      <svg viewBox="0 0 480 260" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                        <rect width="480" height="260" fill="#05120a" />
                        {/* Cap rock */}
                        <path d="M 0 0 L 480 0 L 480 35 Q 400 45 320 38 Q 240 30 160 42 Q 80 50 0 40 Z" fill="#1c1917" />
                        <path d="M 0 35 Q 80 50 160 42 Q 240 30 320 38 Q 400 45 480 35" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 3" />
                        {/* Basement */}
                        <path d="M 0 220 Q 80 210 160 218 Q 240 228 320 215 Q 400 208 480 222 L 480 260 L 0 260 Z" fill="#020617" />
                        <path d="M 0 220 Q 80 210 160 218 Q 240 228 320 215 Q 400 208 480 222" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 3" />
                        {/* Reservoir zone */}
                        <rect x="0" y="35" width="480" height="185" fill="#059669" opacity="0.12" />
                        {/* Rock veins */}
                        {[
                          "M 0 70 Q 60 65 120 75 Q 200 80 280 68 Q 360 60 440 72 L 480 70",
                          "M 0 120 Q 80 115 160 125 Q 240 130 320 118 Q 400 110 480 120",
                          "M 0 170 Q 70 175 140 165 Q 210 160 280 172 Q 350 180 420 168 L 480 170",
                        ].map((d, idx) => (
                          <path key={`rv-${idx}`} d={d} fill="none" stroke="#0f4a31" strokeWidth="1.5" opacity="0.5" />
                        ))}
                        {/* Oil droplets */}
                        {[
                          { cx: 60, cy: 80 }, { cx: 140, cy: 110 }, { cx: 200, cy: 160 },
                          { cx: 280, cy: 90 }, { cx: 340, cy: 145 }, { cx: 400, cy: 100 },
                          { cx: 100, cy: 180 }, { cx: 240, cy: 130 }, { cx: 360, cy: 190 },
                          { cx: 430, cy: 170 }, { cx: 170, cy: 70 }, { cx: 320, cy: 60 },
                        ].map((drop, idx) => (
                          <g key={`drop-${idx}`}>
                            <motion.circle cx={drop.cx} cy={drop.cy} r="6"
                              fill={idx < 7 ? "#1a1a1a" : "#f59e0b"}
                              stroke={idx < 7 ? "#333" : "#fbbf24"}
                              strokeWidth="1.5"
                              opacity={idx < 7 ? 0.3 : 1}
                              animate={idx >= 7 ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } : {}}
                              transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.15 }}
                            />
                            {idx >= 7 && <circle cx={drop.cx} cy={drop.cy} r="10" fill="#f59e0b" opacity="0.1" />}
                          </g>
                        ))}
                        {/* Rock obstacles */}
                        {[
                          { cx: 120, cy: 140, r: 16 }, { cx: 300, cy: 110, r: 20 },
                          { cx: 450, cy: 140, r: 14 }, { cx: 80, cy: 55, r: 10 }, { cx: 380, cy: 75, r: 12 },
                        ].map((rock, idx) => (
                          <g key={`rock2-${idx}`}>
                            <ellipse cx={rock.cx} cy={rock.cy} rx={rock.r} ry={rock.r * 0.75} fill={`hsl(0, 0%, ${30 + (idx % 3) * 5}%)`} />
                            <ellipse cx={rock.cx - rock.r * 0.2} cy={rock.cy - rock.r * 0.25} rx={rock.r * 0.4} ry={rock.r * 0.25} fill="rgba(255,255,255,0.06)" />
                          </g>
                        ))}
                        {/* Drill path */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 5, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                          d="M 20 130 Q 60 125 100 135 Q 140 145 180 125 Q 220 110 260 130 Q 300 150 340 135 Q 380 120 420 130"
                          fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                          style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.6))" }}
                        />
                        {/* Player */}
                        <g transform="translate(20, 123)">
                          <rect x="-3" y="-6" width="6" height="5" fill="#fbbf24" rx="1" />
                          <rect x="-4" y="-1" width="8" height="7" fill="#92400e" />
                          <rect x="-1" y="-7" width="2" height="2" fill="#fef3c7" />
                        </g>
                        {/* Labels */}
                        <text x="8" y="48" fill="#10b981" opacity="0.6" style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '1px' }}>CAP ROCK</text>
                        <text x="8" y="240" fill="#475569" opacity="0.6" style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '1px' }}>BASEMENT</text>
                        <rect x="155" y="240" width="170" height="18" fill="rgba(0,0,0,0.7)" rx="2" />
                        <text x="240" y="253" textAnchor="middle" fill="#10b981" style={{ fontSize: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>HORIZONTAL STEERING</text>
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.15) 50%)', backgroundSize: '100% 4px',
                      }} />
                    </div>
                  </div>

                  {/* 3 Info Cards */}
                  <div style={S.grid3colResponsive}>
                    <div style={S.infoCard('#06b6d4')}>
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                        style={S.iconBox('#06b6d4', 'rgba(22,78,99,0.3)')}>
                        <Droplets style={{ width: 20, height: 20, color: '#22d3ee' }} />
                      </motion.div>
                      <p style={S.cardText('#67e8f9')}>Collect all oil<br />droplets to win</p>
                    </div>
                    <div style={S.infoCard('#ef4444')}>
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                        style={S.iconBox('#ef4444', 'rgba(127,29,29,0.3)')}>
                        <Timer style={{ width: 20, height: 20, color: '#f87171' }} />
                      </motion.div>
                      <p style={S.cardText('#fca5a5')}>Beat the clock!<br />Time is limited</p>
                    </div>
                    <div style={S.infoCard('#eab308')}>
                      <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.8 }}
                        style={S.iconBox('#eab308', 'rgba(113,63,18,0.3)')}>
                        <Trophy style={{ width: 20, height: 20, color: '#facc15' }} />
                      </motion.div>
                      <p style={S.cardText('#fde047')}>Faster = Higher<br />rank. Aim for #1!</p>
                    </div>
                  </div>
                </div>

                {/* Col 3: Mory */}
                <MoryColumn stepIndex={2} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
