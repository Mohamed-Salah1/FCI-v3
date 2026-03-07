import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bus, Users, Map, User, CheckCircle, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { mockRouteStops, mockStudentPickups, mockDrivers } from "@/utils/mockData";
import DriverMap from "@/components/map/DriverMap";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StudentPickup, DriverProfile } from "@/types";
import DriverHeader from "@/pages/driver/DriverHeader";
import DriverHomeTab from "@/pages/driver/DriverHomeTab";
import DriverStudentsTab from "@/pages/driver/DriverStudentsTab";
import DriverProfileTab from "@/pages/driver/DriverProfileTab";
import DriverBottomNav from "@/pages/driver/DriverBottomNav";

type TabType = "Home" | "students" | "map" | "profile";

const DriverDashboard = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("Home");
  const [pickups, setPickups] = useState<StudentPickup[]>(mockStudentPickups);
  const [tripStatus, setTripStatus] = useState<"idle" | "running" | "paused" | "ended">("idle");
  const [seconds, setSeconds] = useState(0);

  const driverProfile = mockDrivers.find((d) => d.email === user?.email) || mockDrivers[0];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (tripStatus === "running") { interval = setInterval(() => setSeconds((prev) => prev + 1), 1000); }
    return () => { if (interval) clearInterval(interval); };
  }, [tripStatus]);

  const confirmBoarding = (id: string) => setPickups((prev) => prev.map((s) => (s.id === id ? { ...s, status: "boarded" as const } : s)));
  const markAbsent = (id: string) => setPickups((prev) => prev.map((s) => (s.id === id ? { ...s, status: "absent" as const } : s)));

  const boarded = pickups.filter((p) => p.status === "boarded").length;
  const absent = pickups.filter((p) => p.status === "absent").length;
  const waiting = pickups.filter((p) => p.status === "waiting").length;

  return (
    <div className="h-screen flex flex-col bg-background">
      <DriverHeader profile={driverProfile} />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {activeTab === "Home" && (
          <DriverHomeTab tripStatus={tripStatus}  seconds={seconds} boarded={boarded} waiting={waiting} absent={absent} />
        )}
        {activeTab === "students" && (
          <DriverStudentsTab pickups={pickups} boarded={boarded} waiting={waiting} absent={absent} confirmBoarding={confirmBoarding} markAbsent={markAbsent} />
        )}
        {activeTab === "map" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-170px)]">
            <DriverMap busId={driverProfile.busNumber === "SB-101" ? "bus-1" : driverProfile.busNumber === "SB-102" ? "bus-2" : "bus-3"} fullScreen />
          </motion.div>
        )}
        {activeTab === "profile" && <DriverProfileTab profile={driverProfile} />}
      </div>
      <DriverBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DriverDashboard;
