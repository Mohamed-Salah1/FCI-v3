import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { BusLocation } from "@/types";

interface MapViewProps {
  buses: BusLocation[];
  className?: string;
  fullScreen?: boolean;
}

const center: [number, number] = [31.097041, 30.946548];

// 🚌 Bus Icon with rotation support
const busIcon = L.icon({
  iconUrl: "/loga.ico",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// 📍 Fit map to route automatically
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
};

const MapView = ({ buses, className = "", fullScreen = false }: MapViewProps) => {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [animatedPosition, setAnimatedPosition] = useState<[number, number] | null>(null);

  const activeBus = buses.find((b) => b.status !== "idle");

  // 🔥 Fetch route when bus changes
  useEffect(() => {
    if (!activeBus) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: import.meta.env.VITE_ORS_API_KEY,
          },
          body: JSON.stringify({
            coordinates: [
              [activeBus.lng, activeBus.lat],
              [30.946548, 31.097041], // 👈 عدل دي لاحقًا لنقطة حقيقية
            ],
          }),
        });

        const data = await response.json();

        const geometry = data.features[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);

        setRouteCoordinates(geometry);
      } catch (err) {
        console.error("Route error:", err);
      }
    };

    fetchRoute();
  }, [activeBus?.lat, activeBus?.lng]);

  // 🚀 Smooth animation
  useEffect(() => {
    if (routeCoordinates.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      setAnimatedPosition(routeCoordinates[i]);
      i++;
      if (i >= routeCoordinates.length) clearInterval(interval);
    }, 500); // 5 ثواني لكل نقطة

    return () => clearInterval(interval);
  }, [routeCoordinates]);

  return (
    <div className={`overflow-hidden rounded-xl ${fullScreen ? "h-full" : "h-[400px]"} ${className}`}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {activeBus && (
          <Marker position={animatedPosition ?? ([activeBus.lat, activeBus.lng] as [number, number])} icon={busIcon}>
            <Popup>
              <strong>{activeBus.busNumber}</strong>
              <br />
              Route: {activeBus.routeName}
              <br />
              ETA: {activeBus.eta} min
            </Popup>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <>
            <Polyline positions={routeCoordinates} pathOptions={{ color: "#2563eb", weight: 6 }} />
            {activeBus && (
              <>
                {/* Start Marker */}
                <Marker position={[activeBus.lat, activeBus.lng]}>
                  <Popup>Start Point</Popup>
                </Marker>

                {/* End Marker */}
                <Marker position={[activeBus.destinationLat, activeBus.destinationLng]}>
                  <Popup>Destination</Popup>
                </Marker>
              </>
            )}
            <FitBounds positions={routeCoordinates} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
