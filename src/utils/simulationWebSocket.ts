import { BackendSimulationData } from '../types';

type MessageHandler = (data: BackendSimulationData) => void;

/**
 * Handles WebSocket connection for the drilling simulation.
 * Supports a 'mock' mode for frontend-only development.
 */
export class SimulationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: MessageHandler | null = null;
  private mockInterval: number | null = null; // For testing without BE

  // Mock state tracking
  private lastSentData = { x: 0, y: 0, theta: 0 };

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connects to the WebSocket server.
   * If url is 'mock', it starts the internal simulation loop.
   */
  connect(onMessage: MessageHandler) {
    this.onMessage = onMessage;

    // --- MOCK MODE ---
    if (this.url === 'mock') {
        console.log("🔌 [WS] Starting Mock WebSocket Mode");
        this.startMockMode();
        return;
    }

    // --- REAL WEBSOCKET ---
    try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ [WS] Connected to Simulation Server');
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as BackendSimulationData;
            if (this.onMessage) this.onMessage(data);
          } catch (e) {
            console.error('❌ [WS] Failed to parse message', e);
          }
        };

        this.ws.onclose = () => {
          console.log('⚠️ [WS] Disconnected from Simulation Server');
        };

        this.ws.onerror = (err) => {
          console.error('❌ [WS] WebSocket Error', err);
        };
    } catch (err) {
        console.error('❌ [WS] Connection Failed', err);
    }
  }

  /**
   * Sends current drill state to the server.
   */
  send(data: { x: number; y: number; theta: number }) {
    // In mock mode, we just update our local tracking to echo back later
    if (this.url === 'mock') {
        this.lastSentData = data; 
        return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.mockInterval) {
        window.clearInterval(this.mockInterval);
        this.mockInterval = null;
    }
  }

  // --- MOCK IMPLEMENTATION (Simulates BE Logic) ---
  private startMockMode() {
      // Push updates from "Server" every 100ms (10Hz)
      this.mockInterval = window.setInterval(() => {
          if (!this.onMessage) return;

          // Use the last known position from the client
          const { x, y, theta } = this.lastSentData;
          
          // Generate Dummy Data (Logic from previous API mock)
          
          // 1. Drill State
          const drillState = {
            x: x,
            y: y,
            depth: y, 
            theta: theta
          };

          // 2. 3x3 Label Map
          const labelMap = [
            [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)],
            [Math.floor(Math.random() * 3), 1, Math.floor(Math.random() * 3)], 
            [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)],
          ];

          // 3. Log Parameters (Gamma, Res, Den, Neu)
          const baseGamma = 50 + Math.random() * 20;
          const logParams: [number, number, number, number] = [
            baseGamma, 
            2000 - baseGamma * 10 + Math.random() * 100, 
            2.0 + Math.random() * 0.5, 
            0.1 + Math.random() * 0.3  
          ];

          const mockData: BackendSimulationData = {
              drillState,
              labelMap,
              logParams,
              timestamp: Date.now()
          };

          this.onMessage(mockData);
      }, 100); 
  }
}
