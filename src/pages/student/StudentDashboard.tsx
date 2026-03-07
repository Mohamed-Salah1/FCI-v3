import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, MapPin, User, History, Sun, Moon, Home, Clock, Zap, Users, RefreshCw, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { mockAttendance, mockNotifications, mockStudents } from "@/utils/mockData";
import { MOCK_BUSES, interpolateRoute, calcDistance } from "@/utils/mapData";
import StudentMap from "@/components/map/StudentMap";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { Badge } from "@/components/ui/badge";
import wsService from "@/services/websocket";
import type { BusLocation, Notification } from "@/types";
import StudentHomeTab from "@/pages/student/StudentHomeTab";
import StudentProfileTab from "@/pages/student/StudentProfileTab";

export interface StudentLocation {
  lat: number;
  lng: number;
  locationName: string;
  assignedBusId: string;
}

const StudentDashboard = () => {
  const { updateBusLocation, addNotification, notifications, isDark, toggleTheme, logout, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<"home" | "map" | "history" | "profile">("map");
  const [studentLocation, setStudentLocation] = useState<StudentLocation | null>(null);
  const [busProgress, setBusProgress] = useState(0.08);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const studentProfile = mockStudents.find((s) => s.email === user?.email) || mockStudents[0];

  useEffect(() => {
    if (notifications.length === 0) mockNotifications.forEach((n) => addNotification(n));
    wsService.connect();
    const handler = (data: BusLocation | Notification) => {
      if ("busId" in data) updateBusLocation(data as BusLocation);
    };
    wsService.subscribe("bus-location", handler);
    return () => wsService.unsubscribe("bus-location", handler);
  }, []);

  // Animate bus progress after location set
  useEffect(() => {
    clearInterval(intervalRef.current!);
    if (!studentLocation) return;
    setBusProgress(0.08);
    intervalRef.current = setInterval(() => {
      setBusProgress((p) => {
        if (p >= 0.95) { clearInterval(intervalRef.current!); return 0.95; }
        return p + 0.0012;
      });
    }, 600);
    return () => clearInterval(intervalRef.current!);
  }, [studentLocation?.assignedBusId]);

  const handleLocationSet = (loc: StudentLocation) => {
    setStudentLocation(loc);
    setActiveTab("home");
  };

  const handleClearLocation = () => {
    setStudentLocation(null);
    setBusProgress(0.08);
    setActiveTab("map");
  };

  const assignedBus = studentLocation ? MOCK_BUSES.find((b) => b.id === studentLocation.assignedBusId) : null;
  const busPos = assignedBus ? interpolateRoute(assignedBus.route, busProgress) : null;
  const etaMinutes = assignedBus && busPos && studentLocation
    ? Math.max(1, Math.round((calcDistance(busPos[0], busPos[1], studentLocation.lat, studentLocation.lng) / assignedBus.speed) * 60))
    : null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── Header ── */}
      <header className="glass-card-strong border-b border-border/50 px-4 py-3 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bus className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">BusTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-secondary transition-colors">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationPanel />
          <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground">Logout</button>
        </div>
      </header>

      {/* ── Assigned Bus Bar (only on map tab, after location set) ── */}
      <AnimatePresence>
        {activeTab === "map" && studentLocation && assignedBus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div
              className="mx-3 my-2 rounded-xl px-4 py-3 flex items-center gap-3 border"
              style={{
                borderColor: assignedBus.colorHex + "50",
                background: `linear-gradient(90deg, ${assignedBus.colorHex}18 0%, transparent 100%)`,
              }}
            >
              {/* Color dot + bus number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow border-2 border-white"
                style={{ background: assignedBus.colorHex }}
              >
                🚌
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm">{assignedBus.number}</span>
                  <Badge
                    className="text-[9px] text-white border-none h-4 px-1.5"
                    style={{ background: assignedBus.colorHex }}
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {etaMinutes ?? "--"} min ETA
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[110px]">
                    📍 {studentLocation.locationName}
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-3 flex-shrink-0 text-center">
                <div>
                  <p className="text-[11px] font-black">{assignedBus.speed}</p>
                  <p className="text-[9px] text-muted-foreground">km/h</p>
                </div>
                <div>
                  <p className="text-[11px] font-black">{assignedBus.capacity}</p>
                  <p className="text-[9px] text-muted-foreground">cap</p>
                </div>
              </div>

              {/* Change location */}
              <button
                onClick={handleClearLocation}
                className="w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary transition flex-shrink-0 ml-1"
                title="Change pickup location"
              >
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className={`flex-1 overflow-hidden ${activeTab === "map" ? "" : "overflow-y-auto"}`}>

        {/* Map tab - full height, no padding */}
        {activeTab === "map" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-3 pb-0"
          >
            <StudentMap
              fullScreen
              studentLocation={studentLocation}
              onLocationSet={handleLocationSet}
              onClearLocation={handleClearLocation}
            />
          </motion.div>
        )}

        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full overflow-y-auto p-4"
          >
            <StudentHomeTab
              profile={studentProfile}
              studentLocation={studentLocation}
              busProgress={busProgress}
              onGoToMap={() => setActiveTab("map")}
            />
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-4 space-y-3">
            <h2 className="font-semibold">Attendance History</h2>
            {mockAttendance.filter((a) => a.studentName === studentProfile.name).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance records found</p>
            ) : (
              mockAttendance
                .filter((a) => a.studentName === studentProfile.name)
                .map((record) => (
                  <div key={record.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{record.date}</p>
                      <p className="text-xs text-muted-foreground">Bus {record.busNumber} • {record.boardingTime}</p>
                    </div>
                    <Badge variant={record.status === "present" ? "default" : record.status === "late" ? "secondary" : "destructive"}>
                      {record.status}
                    </Badge>
                  </div>
                ))
            )}
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-4">
            <StudentProfileTab profile={studentProfile} />
          </motion.div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="glass-card-strong border-t border-border/50 flex flex-shrink-0">
        {[
          { id: "home" as const, icon: Home, label: "Home" },
          { id: "map" as const, icon: MapPin, label: "Map" },
          { id: "history" as const, icon: History, label: "History" },
          { id: "profile" as const, icon: User, label: "Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StudentDashboard;
