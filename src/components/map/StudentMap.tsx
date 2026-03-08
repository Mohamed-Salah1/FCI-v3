import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  MOCK_BUSES,
  UNIVERSITY,
  STUDENT_PICKUP_LOCATIONS,
  assignStudentToBus,
  nearestLocationName,
  fetchRoadRoute,
  interpolateRoute,
  splitRoute,
} from "@/utils/data";
import type { StudentLocation } from "@/pages/student/StudentDashboard";

// Fix Leaflet default icons once
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Icons ──
const createBusIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);font-size:18px;">🚌</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const myLocationIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:32px;height:32px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:none;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const universityIcon = L.divIcon({
  className: "",
  html: `<div style="background:#7c3aed;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(124,58,237,0.5);font-size:17px;">🏛️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// ── Only flies to location once when it first changes ──
const OnceFlyer = ({ pos }: { pos: [number, number] | null }) => {
  const map = useMap();
  const prevPos = useRef<string>("");
  useEffect(() => {
    if (!pos) return;
    const key = `${pos[0]},${pos[1]}`;
    if (key !== prevPos.current) {
      prevPos.current = key;
      map.flyTo(pos, 15, { animate: true, duration: 1.2 });
    }
  }, [pos, map]);
  return null;
};

// ── Click handler on map ──
const ClickPicker = ({ onPick, enabled }: { onPick: (lat: number, lng: number) => void; enabled: boolean }) => {
  useMapEvents({
    click(e) {
      if (enabled) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface StudentMapProps {
  className?: string;
  fullScreen?: boolean;
  studentLocation: StudentLocation | null;
  onLocationSet: (loc: StudentLocation) => void;
  onClearLocation: () => void;
}

// ── Main component ──
const StudentMap = ({ className = "", fullScreen = false, studentLocation, onLocationSet, onClearLocation }: StudentMapProps) => {
  const [isPicking, setIsPicking] = useState(false);
  const [busProgress, setBusProgress] = useState(0.08);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate bus movement
  useEffect(() => {
    if (!studentLocation) return;
    clearInterval(intervalRef.current!);
    setBusProgress(0.08);
    intervalRef.current = setInterval(() => {
      setBusProgress((p) => {
        if (p >= 0.95) { clearInterval(intervalRef.current!); return 0.95; }
        return p + 0.0012;
      });
    }, 600);
    return () => clearInterval(intervalRef.current!);
  }, [studentLocation?.assignedBusId]);

  // Fetch real road route from OSRM for the assigned bus
  const [roadRoute, setRoadRoute] = useState<[number, number][] | null>(null);
  useEffect(() => {
    const bus = studentLocation
      ? MOCK_BUSES.find((b) => b.id === studentLocation.assignedBusId)
      : null;
    if (!bus) { setRoadRoute(null); return; }
    setRoadRoute(bus.route); // fallback immediately
    fetchRoadRoute(bus.waypoints)
      .then((r) => setRoadRoute(r))
      .catch(() => { /* keep fallback */ });
  }, [studentLocation?.assignedBusId]);

  const handlePickOnMap = useCallback((lat: number, lng: number) => {
    const busId = assignStudentToBus(lat, lng);
    const locationName = nearestLocationName(lat, lng);
    onLocationSet({ lat, lng, locationName, assignedBusId: busId });
    setIsPicking(false);
  }, [onLocationSet]);

  const handleQuickPick = useCallback((lat: number, lng: number, name: string) => {
    const busId = assignStudentToBus(lat, lng);
    onLocationSet({ lat, lng, locationName: name, assignedBusId: busId });
  }, [onLocationSet]);

  // Derived values
  const assignedBus = studentLocation ? MOCK_BUSES.find((b) => b.id === studentLocation.assignedBusId) : null;
  const activeRoute = roadRoute ?? assignedBus?.route ?? [];
  const busPos = assignedBus && activeRoute.length > 0 ? interpolateRoute(activeRoute, busProgress) : null;
  const { traveled, remaining } = assignedBus && activeRoute.length > 0
    ? splitRoute(activeRoute, busProgress)
    : { traveled: [], remaining: [] };
  const studentPos: [number, number] | null = studentLocation ? [studentLocation.lat, studentLocation.lng] : null;

  return (
    <div className={`flex flex-col ${fullScreen ? "h-full" : "h-[500px]"} ${className}`}>

      {/* ── Map Container (stable, no re-mount) ── */}
      <div className="relative z-0 flex-1 rounded-2xl overflow-hidden border border-border/40 shadow-md">
        <MapContainer
          center={[31.1070, 30.9440]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickPicker onPick={handlePickOnMap} enabled={isPicking} />
          <OnceFlyer pos={studentPos} />

          {/* University */}
          <Marker position={[UNIVERSITY.lat, UNIVERSITY.lng]} icon={universityIcon}>
            <Popup><strong>🏛️ Kafr El Sheikh University</strong><br />Final Destination</Popup>
          </Marker>

          {/* Assigned bus + route */}
          {assignedBus && busPos && (
            <>
              {/* Traveled route - gray dashed */}
              {traveled.length > 1 && (
                <Polyline
                  positions={traveled}
                  pathOptions={{ color: "#9ca3af", weight: 4, opacity: 0.6, dashArray: "8,6" }}
                />
              )}

              {/* Remaining route - solid colored */}
              {remaining.length > 1 && (
                <Polyline
                  positions={remaining}
                  pathOptions={{ color: assignedBus.colorHex, weight: 5, opacity: 0.9 }}
                />
              )}

              {/* Student → University line (dashed, light) */}
              {studentPos && (
                <Polyline
                  positions={[studentPos, [UNIVERSITY.lat, UNIVERSITY.lng]]}
                  pathOptions={{ color: "#7c3aed", weight: 2, opacity: 0.4, dashArray: "6,8" }}
                />
              )}

              {/* Bus → Student line */}
              {studentPos && (
                <Polyline
                  positions={[busPos, studentPos]}
                  pathOptions={{ color: assignedBus.colorHex, weight: 3, opacity: 0.85, dashArray: "10,8" }}
                />
              )}

              {/* Bus marker */}
              <Marker position={busPos} icon={createBusIcon(assignedBus.colorHex)}>
                <Popup>
                  <strong style={{ color: assignedBus.colorHex }}>🚌 {assignedBus.number}</strong><br />
                  Driver: {assignedBus.driverName}<br />
                  Speed: {assignedBus.speed} km/h
                </Popup>
              </Marker>
            </>
          )}

          {/* Student pin */}
          {studentPos && (
            <Marker position={studentPos} icon={myLocationIcon}>
              <Popup>
                <strong>📍 Your Pickup</strong><br />
                {studentLocation?.locationName}<br />
                {assignedBus && <span style={{ color: assignedBus.colorHex }}>Bus: {assignedBus.number}</span>}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* ── Overlay: no location yet ── */}
        {!studentLocation && !isPicking && (
          <div
            className="absolute inset-0 z-[1000] flex items-center justify-center"
            style={{ background: "rgba(5,15,25,0.5)", backdropFilter: "blur(3px)" }}
          >
            <div className="bg-background border border-border/70 rounded-2xl shadow-2xl p-6 mx-5 w-full max-w-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Set Your Pickup Location</p>
                  <p className="text-xs text-muted-foreground">Choose where you want to be picked up</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* Use current location = default to nearest pickup spot */}
                <button
                  onClick={() => handleQuickPick(31.1000, 30.9450, "Sakha Road Junction")}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-all active:scale-95"
                >
                  Use My Current Location
                </button>
                <button
                  onClick={() => setIsPicking(true)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all active:scale-95"
                >
                  Pick on Map
                </button>
              </div>

              {/* Quick location shortcuts */}
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Nearby Areas</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {STUDENT_PICKUP_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => handleQuickPick(loc.lat, loc.lng, loc.name)}
                      className="text-left px-2.5 py-2 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition text-[11px] font-medium truncate"
                    >
                      📌 {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Picking mode hint ── */}
        {isPicking && (
          <>
            <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-between bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg">
              <span>🎯 Tap anywhere on the map</span>
              <button
                onClick={() => setIsPicking(false)}
                className="ml-2 bg-white/20 hover:bg-white/30 rounded-lg px-2 py-0.5 text-[10px]"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentMap;
