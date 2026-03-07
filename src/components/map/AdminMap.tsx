import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  MOCK_BUSES,
  MOCK_STUDENTS,
  UNIVERSITY,
  fetchRoadRoute,
  interpolateRoute,
  splitRoute,
} from "@/utils/mapData";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createBusIcon = (color: string, label: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:42px;height:42px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.45);font-size:18px;">🚌<span style="font-size:8px;color:white;font-weight:bold;margin-top:-2px;">${label}</span></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

const createStudentIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);font-size:14px;">👤</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const universityIcon = L.divIcon({
  className: "",
  html: `<div style="background:#7c3aed;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 12px rgba(124,58,237,0.5);font-size:22px;">🏛️</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
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

interface AdminMapProps {
  className?: string;
  fullScreen?: boolean;
}

const AdminMap = ({ className = "", fullScreen = false }: AdminMapProps) => {
  // Animated progress per bus
  const [progresses, setProgresses] = useState<Record<string, number>>({
    "bus-1": 0.08,
    "bus-2": 0.22,
    "bus-3": 0.15,
  });

  // Road-snapped routes from OSRM (replaces straight-line route once loaded)
  const [roadRoutes, setRoadRoutes] = useState<Record<string, [number, number][]>>(() =>
    Object.fromEntries(MOCK_BUSES.map((b) => [b.id, b.route]))
  );
  const [routesLoading, setRoutesLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch real road routes from OSRM on mount
  useEffect(() => {
    let resolved = 0;
    MOCK_BUSES.forEach(async (bus) => {
      try {
        const roadRoute = await fetchRoadRoute(bus.waypoints);
        setRoadRoutes((prev) => ({ ...prev, [bus.id]: roadRoute }));
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[AdminMap] OSRM failed for ' + bus.id + ', using fallback', err);
        }
      } finally {
        resolved++;
        if (resolved === MOCK_BUSES.length) setRoutesLoading(false);
      }
    });
  }, []);

  // Animation interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgresses((prev) => {
        const next = { ...prev };
        MOCK_BUSES.forEach((bus) => {
          if (prev[bus.id] < 1) {
            next[bus.id] = Math.min(prev[bus.id] + 0.0015, 1);
          }
        });
        return next;
      });
    }, 500);
    return () => clearInterval(intervalRef.current!);
  }, []);

  // Memoize student grouping — O(M) once
  const studentsByBus = useMemo(() => {
    const map = new Map<string, typeof MOCK_STUDENTS>();
    MOCK_STUDENTS.forEach((s) => {
      const list = map.get(s.assignedBusId!) || [];
      list.push(s);
      map.set(s.assignedBusId!, list);
    });
    return map;
  }, []);

  // Memoize bus color lookup
  const busById = useMemo(() => new Map(MOCK_BUSES.map((b) => [b.id, b])), []);

  const allPositions: [number, number][] = [
    ...MOCK_BUSES.map((b) => [b.startLat, b.startLng] as [number, number]),
    ...MOCK_STUDENTS.map((s) => [s.lat, s.lng] as [number, number]),
    [UNIVERSITY.lat, UNIVERSITY.lng],
  ];

  return (
    <div className={`relative overflow-hidden rounded-xl ${fullScreen ? "h-full" : "h-[500px]"} ${className}`}>
      {routesLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-1.5 shadow-lg text-xs font-semibold text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse inline-block" />
          Loading road routes…
        </div>
      )}
      <MapContainer center={[31.1070, 30.9440]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {MOCK_BUSES.map((bus) => {
          const route = roadRoutes[bus.id];
          const progress = progresses[bus.id] ?? 0;
          const busPos = interpolateRoute(route, progress);
          const { traveled, remaining } = splitRoute(route, progress);

          return (
            <div key={bus.id}>
              {traveled.length > 1 && (
                <Polyline
                  positions={traveled}
                  pathOptions={{ color: "#9ca3af", weight: 4, opacity: 0.55, dashArray: "8,5" }}
                />
              )}
              {remaining.length > 1 && (
                <Polyline
                  positions={remaining}
                  pathOptions={{ color: bus.colorHex, weight: 5, opacity: 0.85 }}
                />
              )}
              <Marker position={busPos} icon={createBusIcon(bus.colorHex, bus.number.slice(-3))}>
                <Popup>
                  <div style={{ minWidth: 150 }}>
                    <strong style={{ color: bus.colorHex }}>🚌 {bus.number}</strong><br />
                    Driver: {bus.driverName}<br />
                    Speed: {bus.speed} km/h<br />
                    Students: {(studentsByBus.get(bus.id) || []).length}<br />
                    Progress: {Math.round(progress * 100)}%
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {MOCK_STUDENTS.map((student) => {
          const assignedBus = busById.get(student.assignedBusId!);
          const busColor = assignedBus?.colorHex ?? "#6b7280";
          return (
            <Marker
              key={student.id}
              position={[student.lat, student.lng]}
              icon={createStudentIcon(busColor)}
            >
              <Popup>
                <div>
                  <strong>👤 {student.name}</strong><br />
                  📍 {student.locationName || "Location"}<br />
                  Bus:{" "}
                  <span style={{ color: busColor, fontWeight: "bold" }}>
                    {assignedBus?.number ?? "Unassigned"}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <Marker position={[UNIVERSITY.lat, UNIVERSITY.lng]} icon={universityIcon}>
          <Popup>
            <strong>🏛️ {UNIVERSITY.name}</strong><br />
            Final destination for all buses
          </Popup>
        </Marker>

        <FitBounds positions={allPositions} />
      </MapContainer>
    </div>
  );
};

export default AdminMap;
