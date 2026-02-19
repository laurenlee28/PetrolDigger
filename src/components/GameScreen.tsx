import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, LogOut } from 'lucide-react';
import { MapLevel } from '../types';
import { getSoundSystem } from '../utils/soundSystem';

// Assets (Local fallback handling included in component)
import bgImage from '../assets/BackGround.png'; 

interface GameScreenProps {
  mapData: MapLevel;
  onExit: () => void;
}

type GameState = 'START' | 'VERTICAL' | 'TRANSITION' | 'HORIZONTAL' | 'WIN' | 'GAME_OVER';

export function GameScreen({ mapData, onExit }: GameScreenProps) {
  // Game State
  const [gameState, setGameState] = useState<GameState>('VERTICAL');
  const [score, setScore] = useState(0);
  const [depth, setDepth] = useState(0);
  const [health, setHealth] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  
  // Refs for Game Loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const scoreRef = useRef(0);
  const depthRef = useRef(0);
  const healthRef = useRef(100);
  const gameStateRef = useRef<GameState>('VERTICAL');
  const soundSystemRef = useRef(getSoundSystem());

  // Game Objects
  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, width: 0, height: 0 });
  const obstaclesRef = useRef<any[]>([]);
  const cameraYRef = useRef(0);
  const gameTimeRef = useRef(0);
  
  // Horizontal Mode Specifics
  const horizontalPathRef = useRef<{x: number, y: number}[]>([]);

  // Init Game
  useEffect(() => {
    soundSystemRef.current.startDescentBGM();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      soundSystemRef.current.stopDescentBGM();
    };
  }, []);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      
      // Use relative speed based on screen size ideally, but fixed is okay for logic
      // We will scale movement in the loop
      if (gameStateRef.current === 'VERTICAL') {
        if (e.key === 'ArrowLeft') playerRef.current.vx = -1;
        if (e.key === 'ArrowRight') playerRef.current.vx = 1;
      } else if (gameStateRef.current === 'HORIZONTAL') {
        if (e.key === 'ArrowUp') playerRef.current.vy = -1;
        if (e.key === 'ArrowDown') playerRef.current.vy = 1;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'VERTICAL') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') playerRef.current.vx = 0;
      } else if (gameStateRef.current === 'HORIZONTAL') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerRef.current.vy = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  // Main Game Loop
  const animate = useCallback((time: number) => {
    if (isPaused) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize & DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      // Reset player position on resize
      playerRef.current.x = displayWidth / 2;
    }
    
    // Scale Context: We'll work in logical pixels (CSS pixels)
    // But actually, for crisp rendering, we should keep the scale transform
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Scaling Factors (Relative to 1080p base for consistency)
    const scaleFactor = displayHeight / 1080;
    const logicalW = displayWidth;
    const logicalH = displayHeight;

    gameTimeRef.current += 0.016;

    // Clear Screen
    ctx.fillStyle = '#0f172a'; // Dark slate
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Initialize Player Size if needed
    if (playerRef.current.width === 0) {
      playerRef.current.width = 40 * scaleFactor;
      playerRef.current.height = 60 * scaleFactor;
      playerRef.current.x = logicalW / 2;
      playerRef.current.y = logicalH * 0.2; // 20% down
    }

    // Render based on state
    if (gameStateRef.current === 'VERTICAL') {
      updateVertical(ctx, logicalW, logicalH, scaleFactor);
    } else if (gameStateRef.current === 'HORIZONTAL') {
      updateHorizontal(ctx, logicalW, logicalH, scaleFactor);
    }

    // Sync React State for UI (throttle)
    if (Math.random() < 0.1) {
      setDepth(Math.floor(depthRef.current));
      setScore(scoreRef.current);
      setHealth(Math.floor(healthRef.current));
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);


  // --- VERTICAL LOGIC ---
  const updateVertical = (ctx: CanvasRenderingContext2D, w: number, h: number, s: number) => {
    const scrollSpeed = (4 + (depthRef.current * 0.005)) * s;
    const moveSpeed = 8 * s; // Player horizontal speed

    depthRef.current += 0.1;
    cameraYRef.current += scrollSpeed;

    // Background Pattern
    drawVerticalBackground(ctx, w, h, cameraYRef.current, s);

    // Spawn Obstacles
    if (Math.random() < 0.05) {
      const type = Math.random() > 0.8 ? 'magma' : (Math.random() > 0.9 ? 'powerup' : 'rock');
      const radius = (type === 'rock' ? 40 + Math.random() * 30 : 30) * s;
      obstaclesRef.current.push({
        x: Math.random() * w,
        y: h + radius + 100, // Spawn below screen
        type: type,
        radius: radius
      });
    }

    // Update Player
    playerRef.current.x += playerRef.current.vx * moveSpeed;
    playerRef.current.x = Math.max(playerRef.current.width, Math.min(w - playerRef.current.width, playerRef.current.x));
    
    // Draw Player Drill
    const px = playerRef.current.x;
    const py = h * 0.25; // Player fixed at 25% height visual
    const pW = playerRef.current.width;
    const pH = playerRef.current.height;

    ctx.save();
    ctx.translate(px, py); 
    
    // Drill Body
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(-pW/2, -pH/2, pW, pH);
    ctx.shadowBlur = 0;

    // Drill Bit Animation
    ctx.fillStyle = '#d97706';
    const bitH = pH * 0.6;
    if (Math.floor(Date.now() / 50) % 2 === 0) {
       ctx.beginPath();
       ctx.moveTo(-pW/2, pH/2); ctx.lineTo(0, pH/2 + bitH); ctx.lineTo(pW/2, pH/2);
       ctx.fill();
    } else {
       ctx.beginPath();
       ctx.moveTo(-pW/3, pH/2); ctx.lineTo(0, pH/2 + bitH * 0.8); ctx.lineTo(pW/3, pH/2);
       ctx.fill();
    }
    ctx.restore();

    // Update & Draw Obstacles
    obstaclesRef.current.forEach((obs, index) => {
      obs.y -= scrollSpeed; // Move up relative to camera

      // Draw
      if (obs.type === 'rock') {
        ctx.fillStyle = '#64748b'; 
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(obs.x - obs.radius*0.3, obs.y - obs.radius*0.3, obs.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'magma') {
        const glow = ctx.createRadialGradient(obs.x, obs.y, obs.radius*0.2, obs.x, obs.y, obs.radius);
        glow.addColorStop(0, '#fca5a5');
        glow.addColorStop(0.6, '#ef4444');
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'powerup') {
        ctx.fillStyle = '#a855f7';
        // Diamond shape
        const r = obs.radius;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y - r);
        ctx.lineTo(obs.x + r, obs.y);
        ctx.lineTo(obs.x, obs.y + r);
        ctx.lineTo(obs.x - r, obs.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Collision (Simple Circle-Circleish)
      // Treat player as circle for simplicity here
      const dy = obs.y - py;
      const dx = obs.x - px;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const hitDist = obs.radius + pW/2;
      
      if (dist < hitDist) {
         if (obs.type === 'rock') {
            healthRef.current -= 0.5;
            soundSystemRef.current.playFootstep(); // Hit sound
         } else if (obs.type === 'magma') {
            healthRef.current -= 1.5;
         } else if (obs.type === 'powerup') {
            scoreRef.current += 100;
            obstaclesRef.current.splice(index, 1);
            soundSystemRef.current.playClick();
         }
      }
    });

    // Cleanup
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.y > -100);

    // Transition Logic
    if (depthRef.current > 200) { 
       setGameState('TRANSITION');
       gameStateRef.current = 'HORIZONTAL';
       playerRef.current.x = w * 0.1; // Start left
       playerRef.current.y = h / 2;
       obstaclesRef.current = []; 
    }
  };

  const drawVerticalBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, scrollY: number, s: number) => {
     ctx.strokeStyle = '#1e293b'; 
     ctx.lineWidth = 2 * s;
     
     const spacing = 150 * s;
     const offset = scrollY % spacing;
     
     // Draw grid lines moving up
     for (let y = -offset; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        // Wavy lines
        for (let x = 0; x < w; x += 50) {
           ctx.lineTo(x, y + Math.sin(x * 0.01) * (20 * s));
        }
        ctx.stroke();
     }

     // Side walls
     ctx.fillStyle = '#0f172a'; // darker
     ctx.fillRect(0, 0, 20*s, h);
     ctx.fillRect(w - 20*s, 0, 20*s, h);
  };


  // --- HORIZONTAL LOGIC ---
  const updateHorizontal = (ctx: CanvasRenderingContext2D, w: number, h: number, s: number) => {
    const speed = 5 * s; // World scroll speed
    const playerSpeed = 8 * s; // Player vertical movement
    
    scoreRef.current += 1; 

    // Background Layer
    ctx.fillStyle = '#022c22'; 
    ctx.fillRect(0, 0, w, h);

    // Dynamic Boundaries (Cap Rock)
    ctx.fillStyle = '#14532d'; 
    
    // Top Rock
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= w; x+=20) {
        const time = gameTimeRef.current * 2;
        // Make the wave move left by adding time to x
        const y = (h * 0.15) + Math.sin((x/s + time * 50) * 0.01) * (40 * s) + Math.cos(x/s * 0.02) * (20 * s);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, 0);
    ctx.fill();

    // Bottom Rock
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x+=20) {
        const time = gameTimeRef.current * 2;
        const y = (h * 0.85) + Math.sin((x/s + time * 60 + 1000) * 0.01) * (50 * s);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Spawn
    if (Math.random() < 0.03) {
      const type = Math.random() > 0.7 ? 'rock' : 'coin';
      const safeZoneTop = h * 0.25;
      const safeZoneH = h * 0.5;
      
      obstaclesRef.current.push({
        x: w + 100,
        y: safeZoneTop + Math.random() * safeZoneH, 
        type: type,
        radius: (type === 'rock' ? 40 : 20) * s
      });
    }

    // Update Player
    playerRef.current.y += playerRef.current.vy * playerSpeed;
    // Keep in safe bounds (visually)
    playerRef.current.y = Math.max(h * 0.1, Math.min(h * 0.9, playerRef.current.y));

    // Player Trail
    horizontalPathRef.current.push({ x: playerRef.current.x, y: playerRef.current.y });
    if (horizontalPathRef.current.length > 40) horizontalPathRef.current.shift();

    ctx.beginPath();
    ctx.strokeStyle = '#f97316'; 
    ctx.lineWidth = 15 * s;
    ctx.lineCap = 'round';
    
    // Draw trail
    horizontalPathRef.current.forEach((p, i) => {
        // Shift trail points left to simulate forward movement
        // In reality, world moves left, player stays X.
        // But for trail effect, we need to draw previous positions shifted.
        // This is a simple visual hack:
        const age = horizontalPathRef.current.length - 1 - i;
        const drawX = p.x - (age * speed); 
        if (i === 0) ctx.moveTo(drawX, p.y);
        else ctx.lineTo(drawX, p.y);
    });
    ctx.stroke();

    // Draw Player Head
    const pSize = 30 * s;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(playerRef.current.x - pSize/2, playerRef.current.y - pSize/2, pSize, pSize);

    // Obstacles
    obstaclesRef.current.forEach((obs, index) => {
       obs.x -= speed;

       if (obs.type === 'rock') {
          ctx.fillStyle = '#64748b';
          ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI*2); ctx.fill();
       } else {
          ctx.fillStyle = '#facc15';
          ctx.beginPath(); ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI*2); ctx.fill();
          ctx.lineWidth = 3*s; ctx.strokeStyle = '#a16207'; ctx.stroke();
       }

       const dist = Math.sqrt(Math.pow(obs.x - playerRef.current.x, 2) + Math.pow(obs.y - playerRef.current.y, 2));
       if (dist < obs.radius + pSize/2) {
          if (obs.type === 'rock') {
             healthRef.current -= 5;
             obstaclesRef.current.splice(index, 1);
             soundSystemRef.current.playFootstep();
          } else {
             scoreRef.current += 50;
             obstaclesRef.current.splice(index, 1);
             soundSystemRef.current.playClick();
          }
       }
    });

    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -100);
  };


  // --- STYLES (Inline for Robustness) ---
  const S = {
    container: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#020617',
      fontFamily: "'VT323', monospace",
      overflow: 'hidden',
    },
    canvas: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    uiLayer: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      padding: '2rem',
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      pointerEvents: 'auto' as const,
    },
    statsGroup: {
      display: 'flex',
      gap: '1rem',
    },
    statBox: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)', // Slate-900 transparent
      border: '2px solid #475569',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      minWidth: '120px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)',
    },
    label: {
      color: '#94a3b8', // slate-400
      fontSize: '0.875rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
      marginBottom: '0.25rem',
      display: 'block',
    },
    value: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      lineHeight: 1,
      display: 'block',
    },
    controlsGroup: {
      display: 'flex',
      gap: '0.5rem',
    },
    iconButton: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      border: '2px solid #475569',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      width: '48px',
      height: '48px',
    },
    exitButton: {
      backgroundColor: 'rgba(127, 29, 29, 0.8)', // red-900
      border: '2px solid #ef4444',
      color: 'white',
      padding: '0.5rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      letterSpacing: '0.1em',
      fontSize: '1.125rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      height: '48px',
    }
  };

  return (
    <div style={S.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
      `}</style>

      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef}
        style={S.canvas}
      />

      {/* UI Overlay */}
      <div style={S.uiLayer}>
        
        {/* Top Header */}
        <div style={S.topBar}>
          <div style={S.statsGroup}>
            <div style={S.statBox}>
              <span style={S.label}>Depth</span>
              <span style={S.value}>{depth}m</span>
            </div>
            <div style={S.statBox}>
              <span style={S.label}>Hull</span>
              <span style={{ ...S.value, color: health < 30 ? '#ef4444' : '#22c55e' }}>{health}%</span>
            </div>
            <div style={S.statBox}>
              <span style={S.label}>Score</span>
              <span style={{ ...S.value, color: '#fbbf24' }}>{score}</span>
            </div>
          </div>

          <div style={S.controlsGroup}>
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              style={S.iconButton}
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            <button 
              onClick={onExit}
              style={S.exitButton}
            >
              <LogOut size={20} />
              EXIT
            </button>
          </div>
        </div>

        {/* Center Messages */}
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
           {isPaused && (
             <div style={{ 
               display: 'inline-block', 
               backgroundColor: 'rgba(0,0,0,0.8)', 
               color: 'white', 
               padding: '1rem 3rem', 
               fontSize: '3rem', 
               border: '4px solid white',
               textTransform: 'uppercase',
               letterSpacing: '0.2em'
             }}>
               Paused
             </div>
           )}
           
           {!isPaused && gameState === 'HORIZONTAL' && (
              <div style={{ 
                color: 'rgba(34, 197, 94, 0.4)', 
                fontSize: '2rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em',
                marginBottom: '2rem'
              }}>
                 Running Horizontal Drill
              </div>
           )}
        </div>

        {/* Bottom Status / Controls Hint */}
        <div style={{ textAlign: 'center', opacity: 0.7 }}>
           <div style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {gameState === 'VERTICAL' ? 'Use Arrow Keys to Steer' : 'Use Up/Down to Navigate Strata'}
           </div>
        </div>

      </div>
    </div>
  );
}
