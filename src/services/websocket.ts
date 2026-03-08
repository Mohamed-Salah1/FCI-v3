import type { BusLocation, Notification } from "@/utils/data";

type MessageHandler = (data: BusLocation | Notification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting: boolean = false;
  private url: string;

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
  }

  connect() {
    // Prevent concurrent connection attempts (fixes reconnection storm)
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (!parsed || typeof parsed.type !== "string") {
            if (import.meta.env.DEV) {
              console.warn("[WS] Unexpected message shape:", parsed);
            }
            return;
          }
          const { type, data } = parsed;
          this.handlers.get(type)?.forEach((handler) => handler(data));
        } catch (err) {
          if (import.meta.env.DEV) {
            console.error("[WS] Failed to parse message:", err);
          }
        }
      };
      this.ws.onopen = () => {
        this.isConnecting = false;
      };
      this.ws.onclose = () => {
        this.isConnecting = false;
        // Clear any existing timer before scheduling a new one
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };
      this.ws.onerror = () => {
        this.isConnecting = false;
        this.ws?.close();
      };
    } catch {
      this.isConnecting = false;
      this.startMockUpdates();
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(type, [...existing, handler]);
  }

  unsubscribe(type: string, handler: MessageHandler) {
    const existing = this.handlers.get(type) || [];
    this.handlers.set(type, existing.filter((h) => h !== handler));
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  private startMockUpdates() {
    setInterval(() => {
      const baseLat = 31.1070;
      const baseLng = 30.9440;

      const mockBuses: BusLocation[] = [
        { busId: "bus-1", busNumber: "SB-101", lat: baseLat + Math.random() * 0.01, lng: baseLng + Math.random() * 0.01, destinationLat: 31.0994, destinationLng: 30.9475, speed: 35, heading: 45, occupancy: 28, capacity: 40, status: "on-route", routeName: "Route Alpha", nextStop: "Al Geish St Central", eta: 8, driverName: "Ahmad K.", lastUpdated: new Date().toISOString() },
        { busId: "bus-2", busNumber: "SB-102", lat: baseLat - Math.random() * 0.01, lng: baseLng + Math.random() * 0.008, destinationLat: 31.0994, destinationLng: 30.9475, speed: 20, heading: 120, occupancy: 35, capacity: 40, status: "approaching", routeName: "Route Beta", nextStop: "University Gate", eta: 3, driverName: "Sara M.", lastUpdated: new Date().toISOString() },
        { busId: "bus-3", busNumber: "SB-103", lat: baseLat + Math.random() * 0.008, lng: baseLng - Math.random() * 0.01, destinationLat: 31.0994, destinationLng: 30.9475, speed: 0, heading: 0, occupancy: 0, capacity: 40, status: "idle", routeName: "Route Gamma", nextStop: "Depot", eta: 0, driverName: "Omar R.", lastUpdated: new Date().toISOString() },
        { busId: "bus-4", busNumber: "SB-104", lat: baseLat - Math.random() * 0.006, lng: baseLng - Math.random() * 0.007, destinationLat: 31.0994, destinationLng: 30.9475, speed: 45, heading: 270, occupancy: 22, capacity: 40, status: "on-route", routeName: "Route Delta", nextStop: "Al Mahkama St", eta: 12, driverName: "Lina H.", lastUpdated: new Date().toISOString() },
      ];

      mockBuses.forEach((bus) => {
        this.handlers.get("bus-location")?.forEach((h) => h(bus));
      });
    }, 3000);
  }
}

export const wsService = new WebSocketService();
export default wsService;
