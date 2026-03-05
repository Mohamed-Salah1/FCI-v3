import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Map, Users, Bus, Bell, Settings, LogOut,
  ChevronLeft, ChevronRight, BarChart3, Route, ClipboardList
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/map", label: "Live Map", icon: Map },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/buses", label: "Buses", icon: Bus },
  { to: "/admin/drivers", label: "Drivers", icon: Users },
  { to: "/admin/routes", label: "Routes", icon: Route },
  { to: "/admin/students", label: "Students", icon: Users },
];

const studentLinks = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
];

const driverLinks = [
  { to: "/driver", label: "Dashboard", icon: LayoutDashboard },
];

const AppSidebar = () => {
  const { sidebarOpen, setSidebarOpen, user, logout } = useAppStore();
  const location = useLocation();

  // Filter links based on user role
  const getLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case "admin":
        return adminLinks;
      case "student":
        return studentLinks;
      case "driver":
        return driverLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.2 }}
      className="h-screen sticky top-0 glass-card-strong border-r border-border/50 flex flex-col z-30"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Bus className="h-4 w-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-sm whitespace-nowrap"
            >
              BusTrack Pro
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/50 space-y-1">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
};

export default AppSidebar;
