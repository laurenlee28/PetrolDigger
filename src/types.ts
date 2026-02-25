// Shared types for Oil Strike

export type Screen = "intro" | "tutorial" | "how-it-works" | "map" | "game";

export interface MapLevel {
  id: string | number;
  name: string;
  difficulty: number;
  layers?: {
    name: string;
    color: string;
    height: number;
    isTarget?: boolean;
  }[];
  depth?: string;
  stars?: number;
  dipAngle?: number;
}

export interface GameResult {
  humanPath: { x: number; y: number }[];
  aiPath: { x: number; y: number }[];
  optimalPath: { x: number; y: number }[]; // BE provided optimal path
  targets?: { x: number; y: number }[]; // List of target points
  targetDepth?: number; // Legacy: For layer visualization
  targetThickness?: number; // Legacy
  humanAccuracy: number;
  aiAccuracy: number;
  humanTime: number;
  aiTime: number;
  humanWon: boolean;
}

// --- Backend Communication Types ---

export interface DrillState {
  x: number;
  y: number;
  depth: number;
  theta: number;
}

// 3x3 grid of surrounding formation types/values
export type LabelMap = number[][];

// 4 logging parameters (e.g., Gamma, Resistivity, Density, Neutron)
export type LogParameters = [number, number, number, number];

export interface BackendSimulationData {
  drillState: DrillState;
  labelMap: LabelMap;
  logParams: LogParameters;
  timestamp: number;
}
