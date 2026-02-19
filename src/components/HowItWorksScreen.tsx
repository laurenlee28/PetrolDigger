import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, ArrowRight, Layers, Zap, ChevronLeft, Terminal } from 'lucide-react';
import { getSoundSystem } from '../utils/soundSystem';
import { MolyGuide } from './MolyGuide';
import bgImage from "../assets/BackGround.png"; // Local fallback for background image

interface HowItWorksScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export function HowItWorksScreen({ onBack, onStart }: HowItWorksScreenProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const soundSystem = getSoundSystem();

  const steps = [
    {
      icon: Layers,
      title: "SYSTEM 01: SENSOR LINK",
      subtitle: "DATA ACQUISITION",
      description: "INITIALIZING REAL-TIME LWD FEED. MONITORING GAMMA, RESISTIVITY, AND DENSITY METRICS.",
      molyTip: "This system collects all the underground data in real-time! It's like having X-ray vision through the earth!",
      color: '#60a5fa', // blue-400
      borderColor: '#3b82f6', // blue-500
      bgTint: 'rgba(30, 58, 138, 0.2)', // blue-900/20
    },
    {
      icon: Cpu,
      title: "SYSTEM 02: NEURAL CORE",
      subtitle: "AI ASSISTANCE",
      description: "MULTI-AGENT AI ANALYZES STRATA PATTERNS. PREDICTING OPTIMAL TRAJECTORIES IN PARALLEL.",
      molyTip: "This is where AI-X gets its power! The neural core analyzes patterns, but it lacks human creativity. That's your advantage!",
      color: '#c084fc', // purple-400
      borderColor: '#a855f7', // purple-500
      bgTint: 'rgba(88, 28, 135, 0.2)', // purple-900/20
    },
    {
      icon: Zap,
      title: "SYSTEM 03: OPTIMIZER",
      subtitle: "PERFORMANCE SYNC",
      description: "COMPARING PILOT INPUT VS AI LATENCY. AIM FOR THE 'PERFECT WELLBORE' MODEL.",
      molyTip: "The optimizer constantly compares your performance with AI-X! It's how we measure who drilled better. May the best driller win!",
      color: '#fbbf24', // amber-400
      borderColor: '#f59e0b', // amber-500
      bgTint: 'rgba(120, 53, 15, 0.2)', // amber-900/20
    }
  ];

  const molyDialogue = hoveredStep !== null 
    ? steps[hoveredStep].molyTip
    : "These are the three core systems that power our drilling operation! Hover over each one to learn more details!";

  const S = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative' as const,
      overflow: 'hidden',
      fontFamily: "'VT323', monospace",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      userSelect: 'none' as const,
    },
    overlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      pointerEvents: 'none' as const,
      zIndex: 0,
    },
    scanlines: {
      position: 'absolute' as const,
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
      backgroundSize: '100% 4px',
      pointerEvents: 'none' as const,
      zIndex: 50,
    },
    content: {
      position: 'relative' as const,
      zIndex: 10,
      maxWidth: '1200px',
      width: '100%',
    },
    headerWrap: {
      marginBottom: '3rem',
      textAlign: 'center' as const,
    },
    headerTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: '1px solid rgba(34,197,94,0.5)',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '0.25rem 1rem',
      marginBottom: '1rem',
      color: '#4ade80',
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      fontSize: '1rem',
    },
    title: {
      fontSize: 'clamp(2.5rem, 7vh, 4.5rem)',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '2px 2px 0 #000',
      letterSpacing: '-0.02em',
      textTransform: 'uppercase' as const,
      marginBottom: '1rem',
    },
    subtitle: {
      fontSize: 'clamp(1rem, 2.5vh, 1.5rem)',
      color: '#cbd5e1',
      maxWidth: '800px',
      margin: '0 auto',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      backgroundColor: 'rgba(0,0,0,0.4)',
      padding: '0.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem',
    },
    actionsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      flexWrap: 'wrap' as const,
    },
  };

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div style={S.overlay} />
      <div style={S.scanlines} />

      <div style={S.content}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={S.headerWrap}
        >
          <div style={S.headerTag}>
            <Terminal style={{ width: 16, height: 16 }} />
            <span>Training Module_v1.0</span>
          </div>
          <h1 style={S.title}>Mission Briefing</h1>
          <p style={S.subtitle}>
            PILOT: Understand the operational parameters before engagement.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div style={S.grid}>
          {steps.map((step, index) => {
            const isHovered = hoveredStep === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                onMouseEnter={() => { soundSystem.playHover(); setHoveredStep(index); }}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: `4px solid ${step.borderColor}`,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.8)',
                  transform: isHovered ? 'translateY(-4px) scale(1.03)' : 'none',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: '1.5rem', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1rem',
                }}>
                  <div style={{
                    padding: '0.75rem', backgroundColor: 'black',
                    border: `2px solid ${step.borderColor}`, color: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <step.icon style={{ width: 32, height: 32 }} />
                  </div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.1)' }}>
                    0{index + 1}
                  </div>
                </div>

                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2.8vh, 1.8rem)', fontWeight: 'bold',
                  color: step.color, marginBottom: '0.25rem',
                  letterSpacing: '-0.02em', textShadow: '2px 2px 0 #000',
                  textTransform: 'uppercase',
                }}>
                  {step.title}
                </h3>
                <div style={{
                  fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)',
                  marginBottom: '1rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', fontWeight: 'bold',
                }}>
                  {step.subtitle}
                </div>

                <div style={{
                  padding: '1rem', backgroundColor: step.bgTint,
                  border: '1px solid rgba(255,255,255,0.05)', flex: 1,
                }}>
                  <p style={{
                    fontSize: 'clamp(0.9rem, 2vh, 1.25rem)', color: '#cbd5e1',
                    lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={S.actionsRow}
        >
          <button
            onMouseEnter={() => soundSystem.playHover()}
            onClick={() => { soundSystem.playClick(); onBack(); }}
            style={{
              padding: '1rem 2rem', border: '4px solid #475569',
              backgroundColor: 'rgba(0,0,0,0.6)', color: '#cbd5e1',
              textTransform: 'uppercase', fontSize: 'clamp(1rem, 2.5vh, 1.5rem)',
              letterSpacing: '0.2em', boxShadow: '4px 4px 0 rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              cursor: 'pointer', fontFamily: "'VT323', monospace",
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft style={{ width: 24, height: 24 }} />
            Back
          </button>

          <button
            onMouseEnter={() => soundSystem.playHover()}
            onClick={() => { soundSystem.playClick(); onStart(); }}
            style={{
              padding: '1rem 2.5rem', border: '4px solid #22c55e',
              backgroundColor: 'rgba(22, 101, 52, 0.4)', color: '#4ade80',
              textTransform: 'uppercase', fontSize: 'clamp(1rem, 2.5vh, 1.5rem)',
              letterSpacing: '0.2em', boxShadow: '4px 4px 0 rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              cursor: 'pointer', fontFamily: "'VT323', monospace",
              fontWeight: 'bold', transition: 'all 0.2s',
            }}
          >
            <span style={{ animation: 'pulse 2s infinite' }}>Start Game</span>
            <ArrowRight style={{ width: 24, height: 24 }} />
          </button>
        </motion.div>
      </div>

      {/* Moly Guide */}
      <MolyGuide
        dialogue={molyDialogue}
        emotion={hoveredStep === 1 ? 'worried' : hoveredStep === 2 ? 'excited' : 'happy'}
        position="bottom-left"
        showNext={false}
      />
    </div>
  );
}
