import { motion } from "framer-motion";
import { Bus, Clock, Navigation, Bell, Star, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { mockAvailableRoutes, mockBusLocations, mockRouteStops } from "@/utils/mockData";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import type { AvailableRoute,StudentProfile } from "@/types";

/* ===================== */
/* Types */
/* ===================== */

type BusStatus = "on-route" | "approaching" | "arrived" | "delayed" | "active";

const statusStyles: Record<BusStatus, string> = {
  "on-route": "bg-primary/10 text-primary border-primary/30",
  approaching: "bg-yellow-500/10 text-yellow-600 border-yellow-400/30",
  arrived: "bg-green-500/10 text-green-600 border-green-400/30",
  delayed: "bg-destructive/10 text-destructive border-destructive/30",
  active: "bg-green-500/10 text-green-600 border-green-400/30",
};

const StudentHomeTab = ({ profile }: { profile: StudentProfile }) => {
  const { toast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [favoriteStop, setFavoriteStop] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<AvailableRoute | null>(null);

  /* ===================== */
  /* Persist Notifications */
  /* ===================== */

  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) setNotificationsEnabled(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  /* ===================== */
  /* Active Routes */
  /* ===================== */

  const activeRoutes = useMemo(() => {
    return mockAvailableRoutes.filter((route) => route.status === "active");
  }, []);

  useEffect(() => {
    if (activeRoutes.length > 0) {
      setSelectedRoute(activeRoutes[0]);
    } else {
      setSelectedRoute(null);
    }
  }, [activeRoutes]);

  /* ===================== */
  /* Selected Bus */
  /* ===================== */

  const selectedBus = useMemo(() => {
    if (!selectedRoute) return null;
    return mockBusLocations.find((b) => b.busNumber === selectedRoute.busNumber);
  }, [selectedRoute]);

  /* ===================== */
  /* Live ETA Simulation */
  /* ===================== */

  useEffect(() => {
    if (!selectedRoute) return;

    const interval = setInterval(() => {
      setSelectedRoute((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eta: Math.max(prev.eta - 1, 0),
        };
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedRoute]);

  /* ===================== */
  /* Handlers */
  /* ===================== */

  const handleSelectRoute = (route: AvailableRoute) => {
    setSelectedRoute(route);
    toast({
      title: "Route Selected ✅",
      description: `You are now tracking ${route.routeName} (${route.busNumber}).`,
    });
  };

  const getOccupancyPercentage = () => {
    if (!selectedBus) return 0;
    return (selectedBus.occupancy / selectedBus.capacity) * 100;
  };

  /* ===================== */
  /* UI */
  /* ===================== */

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black">Hi {profile?.name ?? "Student"} 👋</h1>
          <p className="text-[9px] uppercase font-bold tracking-[0.1em] text-muted-foreground">Premium Access Active</p>
        </div>
      </div>

      {/* Live Tracking */}
      {selectedBus &&
        (() => {
          const statusStyle = selectedBus.status === "arrived" ? "bg-green-500/10 text-green-600 border-green-400/30" : selectedBus.status === "approaching" ? "bg-yellow-500/10 text-yellow-600 border-yellow-400/30" : selectedBus.status === "delayed" ? "bg-red-500/10 text-red-600 border-red-400/30" : "bg-primary/10 text-primary border-primary/30";

          const percent = (selectedBus.occupancy / selectedBus.capacity) * 100;

          const occupancyColor = percent > 80 ? "bg-red-500" : percent > 50 ? "bg-yellow-500" : "bg-green-500";

          const totalStops = mockRouteStops.length;
          const completedStops = mockRouteStops.filter((s) => s.status === "completed").length;

          const progressWidth = totalStops > 1 ? (completedStops / (totalStops - 1)) * 100 : 0;

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.4 }}
              className="
        relative rounded-2xl p-6 border shadow-xl
        bg-gradient-to-br from-primary/15 via-background to-background
        backdrop-blur-xl
        overflow-hidden
      "
            >
              {/* ✨ Inner Glass Glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />

              {/* Top Section */}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Bus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wider">Tracking Live</p>
                    <h2 className="text-xl font-extrabold tracking-tight">{selectedBus.busNumber}</h2>
                  </div>
                </div>

                <Badge className={`capitalize px-3 py-1 text-xs border ${statusStyle}`}>{selectedBus.status.replace("-", " ")}</Badge>
              </div>

              <div className="border-t border-border/50 my-5 relative z-10" />

              {/* Middle Section */}
              <div className="flex justify-between items-center relative z-10">
                {/* ETA */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Time to Arrival</p>

                  <motion.p
                    key={selectedRoute?.eta}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.6 }}
                    className="
              text-5xl font-extrabold tracking-tight
              drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]
            "
                  >
                    {selectedRoute?.eta} min
                  </motion.p>

                  <p className="text-xs text-muted-foreground mt-1">Estimated arrival</p>

                  {favoriteStop && <p className="text-xs mt-2 font-semibold text-primary">⭐ Your Stop: {favoriteStop}</p>}
                </div>

                {/* Occupancy */}
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground tracking-wider">Occupancy</p>

                  <p className="text-xl font-bold">
                    {selectedBus.occupancy}/{selectedBus.capacity}
                  </p>

                  <div className="mt-2 w-28 ml-auto">
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div className={`h-2 ${occupancyColor} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 my-6 relative z-10" />

              {/* Stops Timeline */}
              <div className="relative flex items-center justify-between z-10">
                {/* Base Line */}
                <div className="absolute top-2 left-0 right-0 h-[2px] bg-border" />

                {/* Animated Progress Line */}
                <div className="absolute top-2 left-0 h-[2px] bg-primary transition-all duration-500" style={{ width: `${progressWidth}%` }} />

                {mockRouteStops.map((stop) => {
                  const isCompleted = stop.status === "completed";
                  const isCurrent = stop.status === "current";

                  return (
                    <div key={stop.id} className="relative flex-1 text-center">
                      <div
                        className={`
                  mx-auto h-4 w-4 rounded-full transition-all duration-300
                  ${isCompleted && "bg-green-500"}
                  ${isCurrent && "bg-blue-500 ring-4 ring-primary/30 scale-110"}
                  ${!isCompleted && !isCurrent && "bg-gray-400"}
                `}
                      />
                      <p className="text-[10px] mt-2 text-muted-foreground">{stop.name}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

      {/* Available Routes */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            Available Routes
          </h3>
          <Badge>{activeRoutes.length} ROUTES</Badge>
        </div>

        {activeRoutes.map((route, index) => (
          <motion.div key={route.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleSelectRoute(route)} onClick={() => handleSelectRoute(route)} className={`p-4 rounded-xl border cursor-pointer transition ${selectedRoute?.id === route.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-black">{route.busNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {route.routeName} • {route.driverName}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="font-black">{route.eta}m</span>
                </div>
                <p className="text-xs text-muted-foreground">{route.estimatedPickupTime}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {route.stops.map((stop) => (
                <button
                  key={stop}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFavoriteStop(stop);
                  }}
                  className={`px-2 py-1 text-xs rounded-full border transition ${favoriteStop === stop ? "bg-primary text-white" : "bg-secondary hover:bg-primary/10"}`}
                >
                  {favoriteStop === stop ? <Star className="h-3 w-3 inline mr-1" /> : <MapPin className="h-3 w-3 inline mr-1" />}
                  {stop}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudentHomeTab;
