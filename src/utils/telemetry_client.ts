/**
 * telemetry_client.ts
 * 
 * Handles real-time collection and transmission of drill vector data.
 * Uses a buffering strategy to optimize network usage.
 */

// Toggle to false to disable console logs
const DEBUG_LOG = true;
const MOCK_MODE = true;
const WS_URL = "ws://localhost:8080/telemetry";

export interface DrillCommand {
    seq: number;        // Sequence number for ordering
    dtMs: number;       // Delta time in milliseconds
    angleDeg: number;   // Steering angle
    throttle: number;   // 0.0 to 1.0
}

export class TelemetryClient {
    private buffer: DrillCommand[] = [];
    private readonly BATCH_SIZE = 10;
    private socket: WebSocket | null = null;
    private isConnected = false;
    private sessionId: string;
    private seqCounter = 0; // Internal sequence counter

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.connect();
    }

    private connect() {
        if (MOCK_MODE) {
            this.isConnected = true;
            if (DEBUG_LOG) console.log(`[Telemetry] Mock Connection Established for Session: ${this.sessionId}`);
            return;
        }

        this.socket = new WebSocket(WS_URL);
        this.socket.onopen = () => {
            this.isConnected = true;
            console.log("[Telemetry] WS Connected");
            // Send auth/init packet if needed
            this.socket?.send(JSON.stringify({ type: "INIT_TELEMETRY", sessionId: this.sessionId }));
        };
        this.socket.onerror = (err) => console.error("[Telemetry] WS Error", err);
        this.socket.onclose = () => {
            this.isConnected = false;
            console.log("[Telemetry] WS Closed");
        };
    }

    public push(command: Omit<DrillCommand, 'seq'>) {
        // Assign sequence number automatically
        const data: DrillCommand = {
            ...command,
            seq: this.seqCounter++
        };
        this.buffer.push(data);

        if (this.buffer.length >= this.BATCH_SIZE) {
            this.flush();
        }
    }

    public flush() {
        if (this.buffer.length === 0) return;

        const payload = {
            type: "DRILL_COMMAND_BATCH",
            sessionId: this.sessionId, // Session ID is sent with the batch
            timestamp: Date.now(),
            commands: [...this.buffer]
        };

        if (MOCK_MODE) {
            if (DEBUG_LOG) {
                const lastCmd = this.buffer[this.buffer.length - 1];
                console.log(`[Telemetry] Sent Batch (Seq ${this.buffer[0].seq} - ${lastCmd.seq}):`, 
                    `Angle: ${lastCmd.angleDeg.toFixed(1)}°, Throttle: ${lastCmd.throttle}`);
            }
        } else if (this.isConnected && this.socket) {
            this.socket.send(JSON.stringify(payload));
        }

        // Clear buffer
        this.buffer = [];
    }

    public close() {
        this.flush(); // Send remaining data
        if (this.socket) {
            this.socket.close();
        }
    }
}
