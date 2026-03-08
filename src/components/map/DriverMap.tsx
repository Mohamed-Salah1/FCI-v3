import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MOCK_BUSES, MOCK_STUDENTS, UNIVERSITY, fetchRoadRoute, interpolateRoute, splitRoute } from "@/utils/data";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createBusIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:42px;height:42px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.5);font-size:20px;">🚌</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

const createStudentPickupIcon = (index: number, color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"><span style="font-size:14px;">👤</span><span style="font-size:8px;color:white;font-weight:bold;margin-top:-2px;">#${index + 1}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const startIcon = L.divIcon({
  className: "",
  html: `<div style="background:#10b981;width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(16,185,129,0.5);font-size:18px;">🏁</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const universityIcon = L.divIcon({
  className: "",
  html: `<div style="background:#7c3aed;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(124,58,237,0.5);font-size:18px;">🏛️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

interface DriverMapProps {
  busId?: string;
  className?: string;
  fullScreen?: boolean;
}

const DriverMap = ({ busId = "bus-1", className = "", fullScreen = false }: DriverMapProps) => {
  const bus = MOCK_BUSES.find((b) => b.id === busId) || MOCK_BUSES[0];
  const busStudents = MOCK_STUDENTS.filter((s) => s.assignedBusId === bus.id);

  const [progress, setProgress] = useState(0.12);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Road-snapped route (fallback = straight-line waypoints until OSRM responds)
  const [roadRoute, setRoadRoute] = useState<[number, number][]>(bus.route);
  const [routeLoading, setRouteLoading] = useState(true);

  // Fetch real road route from OSRM when busId changes
  useEffect(() => {
    setRoadRoute(bus.route); // reset to fallback immediately
    setProgress(0.12);

    setRouteLoading(true);
    fetchRoadRoute(bus.waypoints)
      .then((route) => setRoadRoute(route))
      .catch((err) => {
        if (import.meta.env.DEV) {
          console.warn("[DriverMap] OSRM failed for " + bus.id + ", using fallback", err);
        }
      })
      .finally(() => setRouteLoading(false));

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(intervalRef.current!);
          return 1;
        }
        return prev + 0.0015;
      });
    }, 500);

    return () => clearInterval(intervalRef.current!);
  }, [busId]); // eslint-disable-line react-hooks/exhaustive-deps

  const busPos = interpolateRoute(roadRoute, progress);
  const { traveled, remaining } = splitRoute(roadRoute, progress);

  const allPositions: [number, number][] = [...bus.waypoints, ...busStudents.map((s) => [s.lat, s.lng] as [number, number]), [UNIVERSITY.lat, UNIVERSITY.lng]];

  // NOTE: Uses straight-line distance for ETA estimation.
  // For accurate ETAs, replace with a routing engine (OSRM / Google Directions).
  const calcETA = (targetLat: number, targetLng: number): number => {
    const dist = Math.sqrt(Math.pow(busPos[0] - targetLat, 2) + Math.pow(busPos[1] - targetLng, 2)) * 111;
    return Math.max(1, Math.round((dist / bus.speed) * 60));
  };

  return (
    <div className={`relative z-0 overflow-hidden rounded-xl ${fullScreen ? "h-full" : "h-[460px]"} ${className}`}>
      {routeLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-1.5 shadow-lg text-xs font-semibold text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse inline-block" />
          Loading road route…
        </div>
      )}
      <MapContainer center={[31.107, 30.944]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {traveled.length > 1 && <Polyline positions={traveled} pathOptions={{ color: "#9ca3af", weight: 5, opacity: 0.7, dashArray: "10,6" }} />}
        {remaining.length > 1 && <Polyline positions={remaining} pathOptions={{ color: bus.colorHex, weight: 6, opacity: 0.9 }} />}

        <Marker position={busPos} icon={createBusIcon(bus.colorHex)}>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong style={{ color: bus.colorHex }}>🚌 {bus.number}</strong>
              <br />
              Driver: {bus.driverName}
              <br />
              Speed: {bus.speed} km/h
              <br />
              Students: {busStudents.length}
              <br />
              Progress: {Math.round(progress * 100)}%
            </div>
          </Popup>
        </Marker>

        <Marker position={[bus.startLat, bus.startLng]} icon={startIcon}>
          <Popup>
            <strong>🏁 Start Point</strong>
            <br />
            {bus.number} departure
          </Popup>
        </Marker>

        {busStudents.map((student, idx) => (
          <Marker key={student.id} position={[student.lat, student.lng]} icon={createStudentPickupIcon(idx, bus.colorHex)}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>👤 {student.name}</strong>
                <br />
                📍 {student.locationName || "Pickup Point"}
                <br />
                🚌 Bus: {bus.number}
                <br />
                ⏱️ ETA: ~{calcETA(student.lat, student.lng)} min
              </div>
            </Popup>
          </Marker>
        ))}

        <Marker position={[UNIVERSITY.lat, UNIVERSITY.lng]} icon={universityIcon}>
          <Popup>
            <strong>🏛️ {UNIVERSITY.name}</strong>
            <br />
            Final Destination
          </Popup>
        </Marker>

        <FitBounds positions={allPositions} />
      </MapContainer>
    </div>
  );
};

export default DriverMap;
