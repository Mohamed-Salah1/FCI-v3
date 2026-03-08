import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bus, Users, AlertTriangle, Clock } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import KPICard from "@/components/dashboard/KPICard";
import MapView from "@/components/map/MapView";
import AttendanceTable from "@/components/dashboard/AttendanceTable";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import { useAppStore } from "@/store/useAppStore";
import { mockBusLocations, mockAttendance, mockNotifications } from "@/utils/data";
import wsService from "@/services/websocket";
import type { BusLocation, Notification } from "@/utils/data";

import LiveMapTab from "./LiveMapPage";
import AttendanceTab from "./AttendancePage";
import AnalyticsTab from "./AnalyticsPage";
import BusesTab from "./BusesPage";
import DriversTab from "./DriversPage";
import RoutesTab from "./RoutesPage";
import StudentsTab from "./StudentsPage";

export type AdminTab =
  | "dashboard"
  | "map"
  | "attendance"
  | "analytics"
  | "buses"
  | "drivers"
  | "routes"
  | "students";

const TAB_TITLES: Record<AdminTab, string> = {
  dashboard:  "Dashboard",
  map:        "Live Tracking Map",
  attendance: "Attendance Records",
  analytics:  "Analytics & Reports",
  buses:      "Fleet Management",
  drivers:    "Driver Management",
  routes:     "Route Management",
  students:   "Student Directory",
};

// ─── Dashboard home ───────────────────────────────────────────────────────────
const AdminHome = () => {
  const { busLocations, setBusLocations, updateBusLocation, addNotification, notifications } =
    useAppStore();

  useEffect(() => {
    if (busLocations.length === 0) setBusLocations(mockBusLocations);
    if (notifications.length === 0) mockNotifications.forEach((n) => addNotification(n));
    wsService.connect();
    const handler = (data: BusLocation | Notification) => {
      if ("busId" in data) updateBusLocation(data as BusLocation);
    };
    wsService.subscribe("bus-location", handler);
    return () => {
      wsService.unsubscribe("bus-location", handler);
    };
  }, [busLocations.length, notifications.length, setBusLocations, addNotification, updateBusLocation]);

  const activeBuses     = busLocations.filter((b) => b.status !== "idle").length;
  const onboardStudents = busLocations.reduce((sum, b) => sum + b.occupancy, 0);
  const totalCapacity   = busLocations.reduce((sum, b) => sum + b.capacity, 0);
  const capacityPct     = totalCapacity > 0 ? Math.round((onboardStudents / totalCapacity) * 100) : 0;
  const lateBuses       = busLocations.filter((b) => b.status === "delayed").length;
  const alerts          = notifications.filter((n) => !n.read).length;
  const approachingBuses = busLocations.filter((b) => b.status === "approaching").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Buses"     value={activeBuses}     icon={Bus}           variant="primary"     trend={`${approachingBuses} approaching university`} />
        <KPICard title="Onboard Students" value={onboardStudents} icon={Users}         variant="success"     trend={`${capacityPct}% capacity utilized`} />
        <KPICard title="Delayed Buses"    value={lateBuses}       icon={Clock}         variant="warning"     trend={lateBuses === 0 ? "All buses on time" : `${lateBuses} behind schedule`} />
        <KPICard title="Unread Alerts"    value={alerts}          icon={AlertTriangle} variant="destructive" trend={alerts === 0 ? "No new alerts" : `${alerts} need attention`} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold mb-3">Live Tracking</h2>
        <MapView buses={busLocations} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold mb-3">Analytics</h2>
        <AnalyticsCharts />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <AttendanceTable records={mockAttendance} />
      </motion.div>
    </div>
  );
};

// ─── Shell ────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const activeTab = useAppStore((s) => s._activeAdminTab as AdminTab);

  return (
    <AppLayout title={TAB_TITLES[activeTab] ?? "Dashboard"}>
      {activeTab === "dashboard"  && <AdminHome />}
      {activeTab === "map"        && <LiveMapTab    asTab />}
      {activeTab === "attendance" && <AttendanceTab  asTab />}
      {activeTab === "analytics"  && <AnalyticsTab   asTab />}
      {activeTab === "buses"      && <BusesTab        asTab />}
      {activeTab === "drivers"    && <DriversTab      asTab />}
      {activeTab === "routes"     && <RoutesTab       asTab />}
      {activeTab === "students"   && <StudentsTab     asTab />}
    </AppLayout>
  );
};

export default AdminDashboard;
