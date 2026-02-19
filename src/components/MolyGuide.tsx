import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import characterImage from '../assets/Mory.png'; // Local fallback for character image

interface MolyGuideProps {
  dialogue: string;
  emotion?: 'happy' | 'excited' | 'serious' | 'worried';
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center' | 'bottom-left-side';
  onNext?: () => void;
  showNext?: boolean;
  autoNext?: boolean;
  autoNextDelay?: number;
}

export function MolyGuide({ 
  dialogue, 
  emotion = 'happy',
  position = 'bottom-left',
  onNext,
  showNext = true,
  autoNext = false,
  autoNextDelay = 3000
}: MolyGuideProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [lampBlink, setLampBlink] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= dialogue.length) {
        setDisplayedText(dialogue.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30);
    return () => clearInterval(typeInterval);
  }, [dialogue]);

  useEffect(() => {
    if (autoNext && !isTyping && onNext) {
      const timer = setTimeout(() => { onNext(); }, autoNextDelay);
      return () => clearTimeout(timer);
    }
  }, [autoNext, isTyping, onNext, autoNextDelay]);

  useEffect(() => {
    const blinkInterval = setInterval(() => { setLampBlink(prev => !prev); }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 50 },
    'bottom-right': { position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 },
    'top-left': { position: 'fixed', top: '2rem', left: '2rem', zIndex: 50 },
    'top-right': { position: 'fixed', top: '2rem', right: '2rem', zIndex: 50 },
    'center': { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 },
    'bottom-left-side': { position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 50 },
  };

  const isSide = position === 'bottom-left-side';

  const bubblePositionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { position: 'absolute', bottom: '100%', left: 0, marginBottom: '1rem' },
    'bottom-right': { position: 'absolute', bottom: '100%', right: 0, marginBottom: '1rem' },
    'top-left': { position: 'absolute', top: '100%', left: 0, marginTop: '1rem' },
    'top-right': { position: 'absolute', top: '100%', right: 0, marginTop: '1rem' },
    'center': { position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '1rem' },
    'bottom-left-side': { position: 'absolute', left: '160px', bottom: '10px', minWidth: '500px', maxWidth: '700px' },
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ ...positionStyles[position], userSelect: 'none' }}
    >
      <style>{`
        @keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>

      <div style={{ position: 'relative' }}>
        {/* Speech Bubble */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            ...bubblePositionStyles[position],
            background: '#fff',
            border: '4px solid #000',
            boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
            imageRendering: 'pixelated',
            padding: '1rem 1.5rem',
            minWidth: isSide ? '500px' : '300px',
            maxWidth: isSide ? '700px' : '600px',
          }}
        >
          <p style={{
            color: 'black',
            fontSize: 'clamp(1rem, 2.2vh, 1.5rem)',
            fontFamily: "'VT323', monospace",
            lineHeight: 1.4,
            letterSpacing: '0.05em',
          }}>
            {displayedText}
            {isTyping && <span style={{ animation: 'cursorBlink 0.7s step-end infinite' }}>▌</span>}
          </p>

          {/* Next Arrow */}
          {showNext && !isTyping && onNext && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onNext}
              style={{
                position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                color: 'black', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'VT323', monospace", fontSize: '1.1rem', fontWeight: 'bold',
              }}
            >
              <span style={{ animation: 'cursorBlink 1s infinite' }}>NEXT</span>
              <ChevronRight style={{ width: 20, height: 20 }} />
            </motion.button>
          )}

          {/* Tail */}
          {isSide ? (
            <div style={{
              position: 'absolute', left: '-12px', bottom: '1.5rem',
              width: 0, height: 0,
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              borderRight: '16px solid #000',
            }} />
          ) : (
            <div style={{
              position: 'absolute', bottom: '-14px',
              left: position.includes('right') ? undefined : '2rem',
              right: position.includes('right') ? '2rem' : undefined,
              width: 0, height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '16px solid #000',
            }} />
          )}
        </motion.div>

        {/* Moly Character */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          <img
            src={characterImage}
            alt="Moly Guide"
            style={{
              width: 'clamp(8rem, 15vh, 10rem)',
              height: 'clamp(8rem, 15vh, 10rem)',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.8))',
            }}
          />
          {/* Helmet Lamp Glow */}
          <div style={{
            position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            width: '2rem', height: '2rem', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)',
            filter: 'blur(8px)',
            opacity: lampBlink ? 1 : 0,
            transition: 'opacity 0.2s',
          }} />
        </motion.div>
      </div>
    </motion.div>
  );
}
