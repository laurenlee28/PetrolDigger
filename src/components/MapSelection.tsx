import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Layers, Star } from 'lucide-react';
import { requestMapPreparation } from '../utils/prepare_map';
import { getSoundSystem } from '../utils/soundSystem';
import bgImage from "../assets/BackGround.png"; // Local fallback for background image
import { DrillSiteCutscene } from './DrillSiteCutscene';

interface MapSelectionProps {
  onSelect: (mapId: string) => void;
}

// Rock colors
const ROCK_COLORS = {
  SANDSTONE: '#c2410c',
  SHALE: '#059669',
  SILTSTONE: '#52525b',
  LIMESTONE: '#1e3a8a',
};

const scenarios = [
  {
    id: 'zone-a',
    title: 'BEGINNER',
    subtitle: 'LEVEL 01',
    difficulty: 'EASY',
    stars: 1,
    depth: '2,500m',
    color: '#38bdf8', // sky-400
    borderColor: '#0ea5e9', // sky-500
    bgHover: 'rgba(12, 74, 110, 0.4)', // sky-900/40
    dipAngle: 0,
    layers: [
      { name: 'Sandstone', color: ROCK_COLORS.SANDSTONE, height: 23 },
      { name: 'Shale', color: ROCK_COLORS.SHALE, height: 13.5, isTarget: true },
      { name: 'Siltstone', color: ROCK_COLORS.SILTSTONE, height: 9.5 },
      { name: 'Limestone', color: ROCK_COLORS.LIMESTONE, height: 54 }
    ]
  },
  {
    id: 'zone-b',
    title: 'INTERMEDIATE',
    subtitle: 'LEVEL 02',
    difficulty: 'NORMAL',
    stars: 2,
    depth: '3,800m',
    color: '#34d399', // emerald-400
    borderColor: '#10b981', // emerald-500
    bgHover: 'rgba(6, 78, 59, 0.4)', // emerald-900/40
    dipAngle: 1.5,
    layers: [
      { name: 'Sandstone', color: ROCK_COLORS.SANDSTONE, height: 35 },
      { name: 'Siltstone', color: ROCK_COLORS.SILTSTONE, height: 15 },
      { name: 'Shale', color: ROCK_COLORS.SHALE, height: 10, isTarget: true },
      { name: 'Limestone', color: ROCK_COLORS.LIMESTONE, height: 40 }
    ]
  },
  {
    id: 'zone-c',
    title: 'ADVANCED',
    subtitle: 'LEVEL 03',
    difficulty: 'HARD',
    stars: 3,
    depth: '5,200m',
    color: '#f87171', // red-400
    borderColor: '#ef4444', // red-500
    bgHover: 'rgba(127, 29, 29, 0.4)', // red-900/40
    dipAngle: -3,
    layers: [
      { name: 'Sandstone', color: ROCK_COLORS.SANDSTONE, height: 40 },
      { name: 'Siltstone', color: ROCK_COLORS.SILTSTONE, height: 20 },
      { name: 'Shale', color: ROCK_COLORS.SHALE, height: 8, isTarget: true },
      { name: 'Limestone', color: ROCK_COLORS.LIMESTONE, height: 32 }
    ]
  }
];

export function MapSelection({ onSelect }: MapSelectionProps) {
  const [showCutscene, setShowCutscene] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const soundSystemRef = useRef(getSoundSystem());
  const pendingMapIdRef = useRef<string | null>(null);

  const handleSelect = (mapId: string) => {
    if (showCutscene) return;

    const scenario = scenarios.find(s => s.id === mapId);
    soundSystemRef.current.playClick();
    setSelectedId(mapId);
    setSelectedTitle(scenario ? `${scenario.subtitle} - ${scenario.title}` : 'ZONE');
    setShowCutscene(true);
    pendingMapIdRef.current = mapId;

    soundSystemRef.current.startDescentBGM();

    // Prepare map in background while cutscene plays
    requestMapPreparation(mapId).catch(e => {
      console.error('Map preparation failed:', e);
    });
  };

  const handleCutsceneComplete = () => {
    soundSystemRef.current.stopDescentBGM();
    const mapId = pendingMapIdRef.current;
    if (mapId) {
      onSelect(mapId);
    }
  };

  useEffect(() => {
    return () => {
      soundSystemRef.current.stopDescentBGM();
    };
  }, []);

  // Inline styles for robustness
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
      fontFamily: "'VT323', monospace",
      userSelect: 'none' as const,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      pointerEvents: 'none' as const,
    },
    scanlines: {
      background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
      backgroundSize: '100% 4px',
      position: 'absolute' as const,
      inset: 0,
      pointerEvents: 'none' as const,
      zIndex: 50,
    },
    titleBox: {
        marginBottom: '3rem',
        textAlign: 'center' as const,
        zIndex: 10,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        zIndex: 10,
    }
  };

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #475569; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <div style={S.overlay} />
      <div style={S.scanlines} />

      <AnimatePresence mode="wait">
        {showCutscene ? (
          <DrillSiteCutscene
            key="cutscene"
            onComplete={handleCutsceneComplete}
            scenarioTitle={selectedTitle}
          />
        ) : (
          <motion.div
            key="map-selection"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={S.titleBox}
            >
              <div style={{ display: 'inline-block', border: '2px solid rgba(245, 158, 11, 0.5)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.25rem 1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.3em', textShadow: '2px 2px 0 #000' }}>
                  Mission Select
                </h2>
              </div>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'white', textShadow: '4px 4px 0 #000', lineHeight: 1 }}>
                CHOOSE YOUR ZONE
              </h1>
            </motion.div>

            <div style={S.grid}>
              {scenarios.map((scenario, index) => {
                const isHovered = hoveredId === scenario.id;
                return (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    onMouseEnter={() => {
                      soundSystemRef.current.playHover();
                      setHoveredId(scenario.id);
                    }}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleSelect(scenario.id)}
                    style={{
                        position: 'relative',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                        border: `4px solid ${scenario.borderColor}`,
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transform: isHovered ? 'translateY(-8px)' : 'none',
                        boxShadow: isHovered ? '0 0 30px rgba(0,0,0,0.5)' : '4px 4px 0 rgba(0,0,0,0.5)',
                        transition: 'all 0.2s',
                        height: '100%',
                        minHeight: '340px',
                        ...(isHovered ? { backgroundColor: scenario.bgHover } : {})
                    }}
                  >
                    {/* Decorative Corners */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '1rem', height: '1rem', borderTop: '4px solid white', borderLeft: '4px solid white', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '1rem', height: '1rem', borderTop: '4px solid white', borderRight: '4px solid white', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '1rem', height: '1rem', borderBottom: '4px solid white', borderLeft: '4px solid white', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '1rem', height: '1rem', borderBottom: '4px solid white', borderRight: '4px solid white', opacity: 0.5 }} />

                    {/* HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: 'black', border: `2px solid ${scenario.borderColor}`, display: 'flex', gap: '0.25rem' }}>
                        {Array.from({ length: scenario.stars }).map((_, i) => (
                          <Star key={i} size={20} fill={scenario.color} color={scenario.color} />
                        ))}
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: scenario.color, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {scenario.subtitle}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', textShadow: '2px 2px 0 #000', textTransform: 'uppercase' }}>
                      {scenario.title}
                    </h3>

                    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: '1rem', ...(isHovered ? { backgroundColor: 'rgba(255,255,255,0.5)' } : {}) }} />

                    {/* PREVIEW */}
                    <div style={{ marginBottom: '1rem', width: '100%', border: '2px solid #334155', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden', height: '160px' }}>
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#0f172a', zIndex: 0 }} />
                      
                      {/* Layers */}
                      <div style={{
                          position: 'absolute',
                          left: '50%', top: '50%',
                          width: '110%', height: '110%',
                          transform: `translate(-50%, -50%) rotate(${scenario.dipAngle}deg)`,
                          zIndex: 10,
                          display: 'flex', flexDirection: 'column'
                      }}>
                          {scenario.layers.map((layer, i) => (
                              <div key={i} style={{ flex: layer.height, backgroundColor: layer.color, position: 'relative', width: '100%' }}>
                                  {layer.isTarget && (
                                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '2px dashed rgba(255,255,255,0.4)', borderBottom: '2px dashed rgba(255,255,255,0.4)' }}>
                                          <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', textShadow: '1px 1px 2px black' }}>Target</span>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>

                      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 30, display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Layers size={12} color="white" />
                          <div style={{ fontSize: '0.75rem', color: 'white', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Layer Preview</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>Depth</span>
                            <span style={{ fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>{scenario.depth}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>Difficulty</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: scenario.color }}>{scenario.difficulty}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white', opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }}>
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', fontSize: '0.875rem' }}>Deploy</span>
                        <ArrowRight size={16} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
