import React from "react";

interface PixelDrillAIProps {
  active?: boolean;
  className?: string;
}

export function PixelDrillAI({ active = false, className = "" }: PixelDrillAIProps) {
  // AI Color Palette - Red/Cyber theme
  const c = {
    black: "#09090b",
    darkGrey: "#450a0a",    // Dark Red (Rose-950)
    lightGrey: "#7f1d1d",   // Red-900
    shadowGrey: "#18181b",
    
    rimMain: "#991b1b",     // Red-800
    rimLight: "#dc2626",    // Red-600
    
    rivet: "#ef4444",       // Red-500
    rivetShadow: "#000000",

    cableDark: "#18181b",
    cableLight: "#450a0a",
    
    grip: "#7c2d12",        // Orange-900
    gripHighlight: "#ea580c", // Orange-600
    
    yellow: "#fbbf24",      // Warning (Amber-400)
    yellowShadow: "#f59e0b",
    
    // LED colors - Blue for AI
    ledOn: "#3b82f6",       // Blue-500 (AI active)
    ledOff: "#1e3a8a",      // Blue-900 (dim)
    ledGreen: "#10b981",    // Keep green
    ledGreenOff: "#064e3b",
    
    // Drill Bit - Chrome/Silver
    bitOutline: "#1f2937",
    bitLight: "#d1d5db",    // Gray-300 (shinier)
    bitMain: "#9ca3af",     // Gray-400
    bitShadow: "#6b7280",
    bitDark: "#4b5563",
    
    augerMetal: "#71717a",  // Zinc-500
    augerShadow: "#27272a",
    augerHighlight: "#d4d4d8", // Zinc-300 (brighter)
  };

  const w = 32; 
  const bodyHeight = 48;
  const cableHeight = 120;
  
  const pipeWidth = 20;
  const pipeX = (w - pipeWidth) / 2;
  const connectionY = 5;

  return (
    <div style={{ position: 'relative', width: w * 4, height: bodyHeight * 4 }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${bodyHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ overflow: 'visible' }}
      >
        <defs>
            {/* Drill Bit Pattern */}
            <pattern 
                id="drillSpiralPatternAI" 
                patternUnits="userSpaceOnUse" 
                width="12" 
                height="12" 
            >
                <path d="M0,12 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M-6,6 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M6,18 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                {active && (
                   <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="12 0" dur="0.08s" repeatCount="indefinite" />
                )}
            </pattern>

            {/* AUGER PATTERN */}
            <pattern 
                id="augerPatternAI" 
                patternUnits="userSpaceOnUse" 
                width={pipeWidth} 
                height="16"
            >
                <path 
                    d={`M0,4 Q${pipeWidth/2},8 ${pipeWidth},4 L${pipeWidth},10 Q${pipeWidth/2},14 0,10 Z`} 
                    fill={c.augerMetal} 
                />
                <path 
                    d={`M0,10 Q${pipeWidth/2},14 ${pipeWidth},10 L${pipeWidth},16 L0,16 Z`} 
                    fill={c.augerShadow} 
                />
                 <path 
                    d={`M0,0 L${pipeWidth},0 L${pipeWidth},4 Q${pipeWidth/2},8 0,4 Z`} 
                    fill={c.augerShadow} 
                />
                <path 
                    d={`M0,4 Q${pipeWidth/2},8 ${pipeWidth},4`} 
                    fill="none" 
                    stroke={c.augerHighlight} 
                    strokeWidth="1" 
                    opacity="0.8"
                />
                {active && (
                    <animateTransform 
                        attributeName="patternTransform" 
                        type="translate" 
                        from="0 0" 
                        to="0 16" 
                        dur="0.15s" 
                        repeatCount="indefinite" 
                        easing="linear"
                    />
                )}
            </pattern>
        </defs>

        {/* AUGER / DRILL STRING */}
        <g>
            <rect x={pipeX} y={-cableHeight} width={pipeWidth} height={cableHeight + connectionY} fill={c.darkGrey} />
            <rect x={pipeX} y={-cableHeight} width="2" height={cableHeight + connectionY} fill={c.black} opacity="0.3" /> 
            <rect x={pipeX + pipeWidth - 2} y={-cableHeight} width="2" height={cableHeight + connectionY} fill={c.black} opacity="0.3" /> 
            <rect x={pipeX} y={-cableHeight} width={pipeWidth} height={cableHeight + connectionY} fill="url(#augerPatternAI)" />
            <rect x={pipeX} y={-cableHeight} width="1" height={cableHeight + connectionY} fill={c.black} opacity="0.5" />
            <rect x={pipeX + pipeWidth - 1} y={-cableHeight} width="1" height={cableHeight + connectionY} fill={c.black} opacity="0.5" />
            <rect x={pipeX - 1} y={connectionY - 2} width={pipeWidth + 2} height={2} fill={c.rimMain} />
            <rect x={pipeX - 1} y={connectionY - 2} width={pipeWidth + 2} height={1} fill={c.rimLight} />
            <rect x={pipeX - 1} y={connectionY} width={pipeWidth + 2} height={1} fill={c.black} opacity="0.4" />
        </g>

        {/* HOUSING - Red Theme */}
        <rect x="4" y="5" width="24" height="14" fill={c.darkGrey} />
        <rect x="4" y="5" width="1" height="14" fill={c.lightGrey} opacity="0.5" /> 
        <rect x="27" y="5" width="1" height="14" fill={c.shadowGrey} opacity="0.5" /> 

        {/* TOP RIM */}
        <rect x="3" y="5" width="26" height="3" fill={c.rimMain} />
        <rect x="3" y="5" width="26" height="1" fill={c.rimLight} opacity="0.5" />
        <rect x="3" y="7" width="26" height="1" fill={c.black} opacity="0.3" />
        
        {/* Rivets Top */}
        {[5, 9, 13, 17, 21, 25].map(x => (
           <g key={`rt-${x}`}>
             <rect x={x} y={6} width={1} height={1} fill={c.rivet} />
             <rect x={x} y={7} width={1} height={1} fill={c.black} opacity="0.2" /> 
           </g>
        ))}

        {/* BOTTOM RIM */}
        <rect x="3" y="16" width="26" height="3" fill={c.rimMain} />
        <rect x="3" y="16" width="26" height="1" fill={c.rimLight} opacity="0.5" />
        <rect x="3" y="18" width="26" height="1" fill={c.black} opacity="0.5" />
        
        {/* Rivets Bottom */}
        {[5, 9, 13, 17, 21, 25].map(x => (
           <g key={`rb-${x}`}>
             <rect x={x} y={17} width={1} height={1} fill={c.rivet} />
             <rect x={x} y={18} width={1} height={1} fill={c.black} opacity="0.2" />
           </g>
        ))}

        <rect x="3" y="5" width="1" height="14" fill={c.black} />
        <rect x="28" y="5" width="1" height="14" fill={c.black} />

        {/* LEFT PANEL - Blue AI LEDs */}
        <rect x="6" y="9" width="4" height="6" fill={c.black} opacity="0.5" />
        
        {/* Blue AI Light (instead of red) */}
        <rect x="7" y="10" width="2" height="1" fill={active ? c.ledOn : c.ledOff} />
        <rect x="7" y="10" width="1" height="1" fill="white" opacity={active ? "0.5" : "0.2"} /> 

        {/* Green Ready Light */}
        <rect x="7" y="13" width="2" height="1" fill={active ? c.ledGreen : c.ledGreenOff} />
        <rect x="7" y="13" width="1" height="1" fill="white" opacity="0.3" /> 

        {/* RIGHT - AI Label */}
        <g>
          {/* AI text (pixel style) - BRIGHT & LARGE */}
          <text 
            x="23" 
            y="14" 
            fontSize="8" 
            fontFamily="monospace" 
            fontWeight="bold" 
            fill="#ffffff"
            textAnchor="middle"
          >
            AI
          </text>
          
          {/* Bright glow effect */}
          <text 
            x="23" 
            y="14" 
            fontSize="8" 
            fontFamily="monospace" 
            fontWeight="bold" 
            fill="#60a5fa"
            textAnchor="middle"
            opacity="0.8"
          >
            AI
          </text>
        </g>

        {/* DRILL BIT - Chrome/Silver */}
        <g transform="translate(4, 19)">
            <DrillBitRowAI y={0} w={24} active={active} c={c} />
            <DrillBitRowAI y={2} w={22} active={active} c={c} />
            <DrillBitRowAI y={4} w={20} active={active} c={c} />
            <DrillBitRowAI y={6} w={18} active={active} c={c} />
            <DrillBitRowAI y={8} w={16} active={active} c={c} />
            <DrillBitRowAI y={10} w={14} active={active} c={c} />
            <DrillBitRowAI y={12} w={12} active={active} c={c} />
            <DrillBitRowAI y={14} w={10} active={active} c={c} />
            <DrillBitRowAI y={16} w={8} active={active} c={c} />
            <DrillBitRowAI y={18} w={6} active={active} c={c} />
            <DrillBitRowAI y={20} w={4} active={active} c={c} />
            <DrillBitRowAI y={22} w={2} active={active} c={c} />
            
            {/* Tip */}
            <rect x={11} y={24} width={2} height={2} fill={c.bitShadow} />
            <rect x={11} y={26} width={1} height={1} fill={c.black} />
        </g>
      </svg>
    </div>
  );
}

function DrillBitRowAI({ y, w, active, c }: { y: number, w: number, active: boolean, c: any }) {
    const maxWidth = 24;
    const x = (maxWidth - w) / 2;
    const height = 2; 
    
    const pixels = [];
    for (let r = 0; r < height; r++) {
        for (let cX = 0; cX < w; cX++) {
            let color = c.bitMain;
            const pct = cX / w;

            if (pct < 0.1) color = c.bitDark;
            else if (pct < 0.25) color = c.bitLight;
            else if (pct > 0.8) color = c.bitDark;
            else if (pct > 0.6) color = c.bitShadow;
            
            pixels.push(
                <rect key={`${r}-${cX}`} x={x + cX} y={r} width={1} height={1} fill={color} />
            );
        }
    }

    return (
        <g transform={`translate(0, ${y})`}>
            {pixels}
            <rect 
                x={x} 
                y={0} 
                width={w} 
                height={height} 
                fill="url(#drillSpiralPatternAI)" 
                style={{ mixBlendMode: 'multiply', opacity: 0.6 }} 
            />
            <rect x={x} y={0} width={1} height={height} fill={c.black} opacity={0.3} />
            <rect x={x + w - 1} y={0} width={1} height={height} fill={c.black} opacity={0.6} />
        </g>
    );
}