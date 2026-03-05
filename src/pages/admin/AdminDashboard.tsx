import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { Bus, Users, AlertTriangle, Clock } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import KPICard from "@/components/dashboard/KPICard";
import MapView from "@/components/map/MapView";
import AttendanceTable from "@/components/dashboard/AttendanceTable";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import { useAppStore } from "@/store/useAppStore";
import { mockBusLocations, mockAttendance, mockNotifications } from "@/utils/mockData";
import wsService from "@/services/websocket";
import type { BusLocation, Notification } from "@/types";

const LiveMapPage = lazy(() => import("./LiveMapPage"));
const AttendancePage = lazy(() => import("./AttendancePage"));
const AnalyticsPage = lazy(() => import("./AnalyticsPage"));
const BusesPage = lazy(() => import("./BusesPage"));
const DriversPage = lazy(() => import("./DriversPage"));
const RoutesPage = lazy(() => import("./RoutesPage"));
const StudentsPage = lazy(() => import("./StudentsPage"));

const Loader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const AdminHome = () => {
  const { busLocations, setBusLocations, updateBusLocation, addNotification, notifications } = useAppStore();

  useEffect(() => {
    if (busLocations.length === 0) setBusLocations(mockBusLocations);
    if (notifications.length === 0) mockNotifications.forEach((n) => addNotification(n));
    wsService.connect();
    const handler = (data: BusLocation | Notification) => {
      if ("busId" in data) updateBusLocation(data as BusLocation);
    };
    wsService.subscribe("bus-location", handler);
    return () => { wsService.unsubscribe("bus-location", handler); };
  }, [busLocations.length, notifications.length, setBusLocations, addNotification, updateBusLocation]);

  const activeBuses = busLocations.filter((b) => b.status !== "idle").length;
  const onboardStudents = busLocations.reduce((sum, b) => sum + b.occupancy, 0);
  const lateBuses = busLocations.filter((b) => b.status === "delayed").length;
  const alerts = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Active Buses" value={activeBuses} icon={Bus} variant="primary" trend="+2 from yesterday" />
          <KPICard title="Onboard Students" value={onboardStudents} icon={Users} variant="success" trend="85% capacity" />
          <KPICard title="Late Buses" value={lateBuses} icon={Clock} variant="warning" trend="1 resolved" />
          <KPICard title="Active Alerts" value={alerts} icon={AlertTriangle} variant="destructive" trend="3 new today" />
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
    </AppLayout>
  );
};

const AdminDashboard = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route index element={<AdminHome />} />
      <Route path="map" element={<LiveMapPage />} />
      <Route path="attendance" element={<AttendancePage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="buses" element={<BusesPage />} />
      <Route path="drivers" element={<DriversPage />} />
      <Route path="routes" element={<RoutesPage />} />
      <Route path="students" element={<StudentsPage />} />
    </Routes>
  </Suspense>
);

export default AdminDashboard;
