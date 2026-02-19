/**
 * prepare_map.ts
 * 
 * Handles the communication with the Backend (BE) to prepare the game session.
 * - Establishes WebSocket connection
 * - Sends selected Map ID
 * - Waits for 'READY' signal from BE
 */

// Toggle this to FALSE when actual Backend is ready
const MOCK_MODE = true; 
const WS_URL = "ws://localhost:8080/game-session";

export interface MapPreparationResult {
    success: boolean;
    sessionId?: string;
    message?: string;
}

export function requestMapPreparation(mapId: string): Promise<MapPreparationResult> {
    return new Promise((resolve, reject) => {
        if (MOCK_MODE) {
            console.log(`[Mock] Connecting to BE for map: ${mapId}...`);
            
            // Simulate network delay and processing
            setTimeout(() => {
                console.log(`[Mock] BE sent 'READY' signal for ${mapId}`);
                resolve({ success: true, sessionId: `mock-session-${Date.now()}` });
            }, 1500); // 1.5 seconds delay
            return;
        }

        // --- REAL WEBSOCKET IMPLEMENTATION ---
        try {
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log("[WS] Connected. Sending Map ID...");
                const payload = {
                    type: "SELECT_MAP",
                    mapId: mapId,
                    timestamp: Date.now()
                };
                socket.send(JSON.stringify(payload));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Protocol: BE sends { type: "MAP_READY", sessionId: "..." }
                    if (data.type === "MAP_READY") {
                        console.log("[WS] Received READY signal.");
                        socket.close(); // Close connection or keep it open depending on architecture
                        resolve({ success: true, sessionId: data.sessionId });
                    } 
                    else if (data.type === "ERROR") {
                        socket.close();
                        reject(new Error(data.message || "Unknown BE Error"));
                    }
                } catch (e) {
                    reject(new Error("Failed to parse BE response"));
                }
            };

            socket.onerror = (error) => {
                console.error("[WS] Error:", error);
                reject(error);
            };

            socket.onclose = () => {
                // If closed before resolving, it might be an issue (unless handled in onmessage)
                console.log("[WS] Connection closed");
            };

        } catch (error) {
            reject(error);
        }
    });
}