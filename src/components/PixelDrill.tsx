import React from "react";
import { motion } from "motion/react";

interface PixelDrillProps {
  active?: boolean;
  className?: string;
}

export function PixelDrill({ active = false, className = "" }: PixelDrillProps) {
  // Pixel Art Palette
  const c = {
    black: "#09090b",     // Almost black
    darkGrey: "#27272a",  // Housing body (Zinc-800)
    lightGrey: "#3f3f46", // Housing highlight (Zinc-700)
    shadowGrey: "#18181b",// Housing shadow (Zinc-900)
    
    rimMain: "#27272a",   // Rim color
    rimLight: "#52525b",  // Rim highlight
    
    rivet: "#71717a",     // Rivets (Zinc-500)
    rivetShadow: "#000000",

    cableDark: "#18181b", // Cable dark
    cableLight: "#3f3f46",// Cable light
    
    grip: "#92400e",      // Handle grip (Amber-800)
    gripHighlight: "#b45309", // Amber-700
    
    yellow: "#facc15",    // Warning sign (Yellow-400)
    yellowShadow: "#eab308", // Yellow-500
    
    red: "#ef4444",       // Red light
    redDim: "#7f1d1d",    // Red light off
    green: "#22c55e",     // Green light
    greenDim: "#14532d",  // Green light off
    
    // Drill Bit Greys
    bitOutline: "#1f2937",
    bitLight: "#9ca3af",  // Highlight
    bitMain: "#6b7280",   // Main grey
    bitShadow: "#4b5563", // Shadow
    bitDark: "#374151",   // Deep shadow
    
    // Auger / Pipe specific
    augerMetal: "#52525b", // Zinc-600
    augerShadow: "#27272a", // Zinc-800
    augerHighlight: "#a1a1aa", // Zinc-400
  };

  // Dimensions
  const w = 32; 
  const bodyHeight = 48;
  const cableHeight = 120;
  
  // Auger Dimensions - Thicker and connecting directly to body
  const pipeWidth = 20; // Increased thickness (was 14)
  const pipeX = (w - pipeWidth) / 2; // Centered
  
  // Body starts at y=5, so pipe connects there
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
            {/* 1. Drill Bit Pattern */}
            <pattern 
                id="drillSpiralPattern" 
                patternUnits="userSpaceOnUse" 
                width="12" 
                height="12" 
            >
                <path d="M0,12 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M-6,6 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M6,18 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                {active && (
                   <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="12 0" dur="0.1s" repeatCount="indefinite" />
                )}
            </pattern>

            {/* 2. AUGER PATTERN (Thicker) */}
            <pattern 
                id="augerPattern" 
                patternUnits="userSpaceOnUse" 
                width={pipeWidth} 
                height="16" // Repeating unit height
            >
                {/* Thread Highlight */}
                <path 
                    d={`M0,4 Q${pipeWidth/2},8 ${pipeWidth},4 L${pipeWidth},10 Q${pipeWidth/2},14 0,10 Z`} 
                    fill={c.augerMetal} 
                />
                
                {/* Dark groove */}
                <path 
                    d={`M0,10 Q${pipeWidth/2},14 ${pipeWidth},10 L${pipeWidth},16 L0,16 Z`} 
                    fill={c.augerShadow} 
                />
                 <path 
                    d={`M0,0 L${pipeWidth},0 L${pipeWidth},4 Q${pipeWidth/2},8 0,4 Z`} 
                    fill={c.augerShadow} 
                />
                
                {/* Specular highlight */}
                <path 
                    d={`M0,4 Q${pipeWidth/2},8 ${pipeWidth},4`} 
                    fill="none" 
                    stroke={c.augerHighlight} 
                    strokeWidth="1" 
                    opacity="0.8"
                />

                {/* Animation */}
                {active && (
                    <animateTransform 
                        attributeName="patternTransform" 
                        type="translate" 
                        from="0 0" 
                        to="0 16" 
                        dur="0.2s" 
                        repeatCount="indefinite" 
                        easing="linear"
                    />
                )}
            </pattern>
        </defs>

        {/* ================= AUGER / DRILL STRING ================= */}
        {/* Draws from way up (-cableHeight) down to the body connection point */}
        <g>
            {/* 1. Base Cylinder */}
            <rect x={pipeX} y={-cableHeight} width={pipeWidth} height={cableHeight + connectionY} fill={c.darkGrey} />
            
            {/* 2. Side Shading */}
            <rect x={pipeX} y={-cableHeight} width="2" height={cableHeight + connectionY} fill={c.black} opacity="0.3" /> 
            <rect x={pipeX + pipeWidth - 2} y={-cableHeight} width="2" height={cableHeight + connectionY} fill={c.black} opacity="0.3" /> 

            {/* 3. The Patterned Overlay */}
            <rect x={pipeX} y={-cableHeight} width={pipeWidth} height={cableHeight + connectionY} fill="url(#augerPattern)" />
            
            {/* 4. Edges/Outline */}
            <rect x={pipeX} y={-cableHeight} width="1" height={cableHeight + connectionY} fill={c.black} opacity="0.5" />
            <rect x={pipeX + pipeWidth - 1} y={-cableHeight} width="1" height={cableHeight + connectionY} fill={c.black} opacity="0.5" />
            
            {/* 5. Connection Collar at Body Interface (Where pipe meets housing) */}
            <rect x={pipeX - 1} y={connectionY - 2} width={pipeWidth + 2} height={2} fill={c.rimMain} />
            <rect x={pipeX - 1} y={connectionY - 2} width={pipeWidth + 2} height={1} fill={c.rimLight} />
            {/* Shadow under collar */}
            <rect x={pipeX - 1} y={connectionY} width={pipeWidth + 2} height={1} fill={c.black} opacity="0.4" />
        </g>

        {/* ================= HOUSING ================= */}
        {/* Main Body Box - Starts at y=5 */}
        <rect x="4" y="5" width="24" height="14" fill={c.darkGrey} />
        
        {/* Subtle Bevel on Main Body */}
        <rect x="4" y="5" width="1" height="14" fill={c.lightGrey} opacity="0.5" /> 
        <rect x="27" y="5" width="1" height="14" fill={c.shadowGrey} opacity="0.5" /> 

        {/* --- TOP RIM --- */}
        <rect x="3" y="5" width="26" height="3" fill={c.rimMain} />
        <rect x="3" y="5" width="26" height="1" fill={c.rimLight} opacity="0.5" /> {/* Top Highlight */}
        <rect x="3" y="7" width="26" height="1" fill={c.black} opacity="0.3" />   {/* Bottom Shadow */}
        
        {/* Rivets Top */}
        {[5, 9, 13, 17, 21, 25].map(x => (
           <g key={`rt-${x}`}>
             <rect x={x} y={6} width={1} height={1} fill={c.rivet} />
             <rect x={x} y={7} width={1} height={1} fill={c.black} opacity="0.2" /> 
           </g>
        ))}

        {/* --- BOTTOM RIM --- */}
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

        {/* Side Borders */}
        <rect x="3" y="5" width="1" height="14" fill={c.black} />
        <rect x="28" y="5" width="1" height="14" fill={c.black} />

        {/* --- LEFT PANEL (Lights) --- */}
        <rect x="6" y="9" width="4" height="6" fill={c.black} opacity="0.5" />
        
        {/* Red Light */}
        <rect x="7" y="10" width="2" height="1" fill={!active ? c.red : c.redDim} />
        <rect x="7" y="10" width="1" height="1" fill="white" opacity="0.3" /> 

        {/* Green Light */}
        <rect x="7" y="13" width="2" height="1" fill={active ? c.green : c.greenDim} />
        <rect x="7" y="13" width="1" height="1" fill="white" opacity="0.3" /> 

        {/* --- RIGHT SYMBOL (Warning) --- */}
        <path d="M19,15 h7 l-3.5,-6 Z" fill={c.yellow} />
        <path d="M22.5,9 l3.5,6 h-1 Z" fill={c.yellowShadow} opacity="0.4" />
        <rect x="22" y="10" width="1" height="2" fill="black" />
        <rect x="22" y="13" width="1" height="1" fill="black" />

        {/* ================= DRILL BIT ================= */}
        <g transform="translate(4, 19)">
            {/* Row 1 (Width 24) */}
            <DrillBitRow y={0} w={24} active={active} c={c} />
            <DrillBitRow y={2} w={22} active={active} c={c} />
            <DrillBitRow y={4} w={20} active={active} c={c} />
            <DrillBitRow y={6} w={18} active={active} c={c} />
            <DrillBitRow y={8} w={16} active={active} c={c} />
            <DrillBitRow y={10} w={14} active={active} c={c} />
            <DrillBitRow y={12} w={12} active={active} c={c} />
            <DrillBitRow y={14} w={10} active={active} c={c} />
            <DrillBitRow y={16} w={8} active={active} c={c} />
            <DrillBitRow y={18} w={6} active={active} c={c} />
            <DrillBitRow y={20} w={4} active={active} c={c} />
            <DrillBitRow y={22} w={2} active={active} c={c} />
            
            {/* Tip */}
            <rect x={11} y={24} width={2} height={2} fill={c.bitShadow} />
            <rect x={11} y={26} width={1} height={1} fill={c.black} />
        </g>
      </svg>
    </div>
  );
}

// Sub-component for a single row of the drill bit
function DrillBitRow({ y, w, active, c }: { y: number, w: number, active: boolean, c: any }) {
    const maxWidth = 24;
    const x = (maxWidth - w) / 2;
    const height = 2; 
    
    // Create the base shading pixels
    const pixels = [];
    for (let r = 0; r < height; r++) {
        for (let cX = 0; cX < w; cX++) {
            // Enhanced Metallic Cylinder Shading
            let color = c.bitMain;
            const pct = cX / w;

            if (pct < 0.1) color = c.bitDark;       // Left edge shadow
            else if (pct < 0.25) color = c.bitLight;// Left Highlight (Specular)
            else if (pct > 0.8) color = c.bitDark;  // Right shadow
            else if (pct > 0.6) color = c.bitShadow;// Gradient to shadow
            
            pixels.push(
                <rect key={`${r}-${cX}`} x={x + cX} y={r} width={1} height={1} fill={color} />
            );
        }
    }

    return (
        <g transform={`translate(0, ${y})`}>
            {/* Base Shape */}
            {pixels}
            
            {/* Spiral Thread Overlay (Pattern) */}
            <rect 
                x={x} 
                y={0} 
                width={w} 
                height={height} 
                fill="url(#drillSpiralPattern)" 
                style={{ mixBlendMode: 'multiply', opacity: 0.6 }} 
            />
            
            {/* Outline sides */}
            <rect x={x} y={0} width={1} height={height} fill={c.black} opacity={0.3} />
            <rect x={x + w - 1} y={0} width={1} height={height} fill={c.black} opacity={0.6} />
        </g>
    );
}

// Drill Pattern
function DrillPattern({ active }: { active: boolean }) {
    return (
        <defs>
            <pattern 
                id="drillSpiralPattern" 
                patternUnits="userSpaceOnUse" 
                width="12" 
                height="12" 
            >
                <path d="M0,12 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M-6,6 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                <path d="M6,18 l12,-12 v3 l-12,12 z" fill="#000" opacity="0.5" />
                
                {active && (
                   <animateTransform 
                       attributeName="patternTransform" 
                       type="translate" 
                       from="0 0" 
                       to="12 0" 
                       dur="0.1s" 
                       repeatCount="indefinite" 
                   />
                )}
            </pattern>
        </defs>
    );
}