import type { BusLocation, Notification } from "@/types";

type MessageHandler = (data: BusLocation | Notification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          this.handlers.get(type)?.forEach((handler) => handler(data));
        } catch {
          // ignore parse errors
        }
      };
      this.ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };
      this.ws.onerror = () => this.ws?.close();
    } catch {
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
      const baseLat = 31.097041;
      const baseLng = 30.946548;

      const mockBuses: BusLocation[] = [
        { busId: "bus-1", busNumber: "SB-101", lat: baseLat + Math.random() * 0.01, lng: baseLng + Math.random() * 0.01, destinationLat: 31.097041, destinationLng: 30.946548, speed: 35, heading: 45, occupancy: 28, capacity: 40, status: "on-route", routeName: "Route Alpha", nextStop: "City Center", eta: 8, driverName: "Ahmad K.", lastUpdated: new Date().toISOString() },
        { busId: "bus-2", busNumber: "SB-102", lat: baseLat - Math.random() * 0.01, lng: baseLng + Math.random() * 0.008, destinationLat: 31.1100, destinationLng: 30.9500, speed: 20, heading: 120, occupancy: 35, capacity: 40, status: "approaching", routeName: "Route Beta", nextStop: "University Gate", eta: 3, driverName: "Sara M.", lastUpdated: new Date().toISOString() },
        { busId: "bus-3", busNumber: "SB-103", lat: baseLat + Math.random() * 0.008, lng: baseLng - Math.random() * 0.01, destinationLat: 31.0800, destinationLng: 30.9300, speed: 0, heading: 0, occupancy: 0, capacity: 40, status: "idle", routeName: "Route Gamma", nextStop: "Depot", eta: 0, driverName: "Omar R.", lastUpdated: new Date().toISOString() },
        { busId: "bus-4", busNumber: "SB-104", lat: baseLat - Math.random() * 0.006, lng: baseLng - Math.random() * 0.007, destinationLat: 31.1000, destinationLng: 30.9100, speed: 45, heading: 270, occupancy: 22, capacity: 40, status: "on-route", routeName: "Route Delta", nextStop: "Mall Junction", eta: 12, driverName: "Lina H.", lastUpdated: new Date().toISOString() },
      ];

      mockBuses.forEach((bus) => {
        this.handlers.get("bus-location")?.forEach((h) => h(bus));
      });
    }, 3000);
  }
}

export const wsService = new WebSocketService();
export default wsService;
