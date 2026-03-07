import type { BusLocation, AttendanceRecord, Notification, RouteStop, StudentPickup, DriverProfile, StudentProfile, AvailableRoute } from "@/types";

// ===== DRIVER PROFILES =====
export const mockDrivers: DriverProfile[] = [
  {
    id: "driver-1",
    name: "Ahmad Khaled",
    email: "driver@bustrack.io",
    phone: "01012345678",
    license: "DRV-987654",
    busNumber: "SB-101",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "driver-2",
    name: "Sara Mostafa",
    email: "sara.m@bustrack.io",
    phone: "01098765432",
    license: "DRV-123456",
    busNumber: "SB-102",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "driver-3",
    name: "Omar Ramadan",
    email: "omar.r@bustrack.io",
    phone: "01055667788",
    license: "DRV-654321",
    busNumber: "SB-103",
    avatar: "https://i.pravatar.cc/150?img=53",
  },
];

// ===== STUDENT PROFILES (no fixed route anymore) =====
export const mockStudents: StudentProfile[] = [
  {
    id: "student-1",
    name: "Maya Johnson",
    email: "student@bustrack.io",
    phone: "01011112222",
    grade: "Grade 10",
    avatar: "https://i.pravatar.cc/150?img=48",
  },
  {
    id: "student-2",
    name: "Ali Hassan",
    email: "ali.h@bustrack.io",
    phone: "01022223333",
    grade: "Grade 9",
    avatar: "https://i.pravatar.cc/150?img=68",
  },
  {
    id: "student-3",
    name: "Emma Davis",
    email: "emma.d@bustrack.io",
    phone: "01033334444",
    grade: "Grade 11",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "student-4",
    name: "Noah Smith",
    email: "noah.s@bustrack.io",
    phone: "01044445555",
    grade: "Grade 8",
    avatar: "https://i.pravatar.cc/150?img=59",
  },
];

// ===== AVAILABLE ROUTES (all routes students can choose from) =====
export const mockAvailableRoutes: AvailableRoute[] = [
  {
    id: "route-1",
    routeName: "Route Alpha",
    busNumber: "SB-101",
    driverName: "Ahmad Khaled",
    stops: ["University Depot", "Al Geish St North", "Al Ustad St", "Al Mahkama St", "KFS University"],
    estimatedPickupTime: "07:15 AM",
    status: "active",
    eta: 8,
    occupancy: 28,
    capacity: 40,
  },
  {
    id: "route-2",
    routeName: "Route Beta",
    busNumber: "SB-102",
    driverName: "Sara Mostafa",
    stops: ["University Depot", "Al Geish St North", "Al Geish St Central", "University Hospital", "KFS University"],
    estimatedPickupTime: "07:25 AM",
    status: "active",
    eta: 3,
    occupancy: 35,
    capacity: 40,
  },
  {
    id: "route-3",
    routeName: "Route Gamma",
    busNumber: "SB-103",
    driverName: "Omar Ramadan",
    stops: ["University Depot", "West District", "Gen. Gamal Hamad St", "Al Mahkama St", "KFS University"],
    estimatedPickupTime: "07:10 AM",
    status: "inactive",
    eta: 0,
    occupancy: 0,
    capacity: 40,
  },
  {
    id: "route-4",
    routeName: "Route Delta",
    busNumber: "SB-104",
    driverName: "Lina Hassan",
    stops: ["University Depot", "Al Geish St Central", "University Hospital", "Sakha Rd", "KFS University"],
    estimatedPickupTime: "07:30 AM",
    status: "active",
    eta: 12,
    occupancy: 22,
    capacity: 40,
  },
];

// ===== BUS LOCATIONS =====
export const mockBusLocations: BusLocation[] = [
  { busId: "bus-1", busNumber: "SB-101", lat: 31.1095, lng: 30.9450, destinationLat: 31.0994, destinationLng: 30.9475, speed: 35, heading: 45, occupancy: 28, capacity: 40, status: "on-route", routeName: "Route Alpha", nextStop: "Al Geish St Central", eta: 8, driverName: "Ahmad K.", lastUpdated: new Date().toISOString() },
  { busId: "bus-2", busNumber: "SB-102", lat: 31.1090, lng: 30.9408, destinationLat: 31.1100, destinationLng: 30.9500, speed: 20, heading: 120, occupancy: 35, capacity: 40, status: "approaching", routeName: "Route Beta", nextStop: "University Gate", eta: 3, driverName: "Sara M.", lastUpdated: new Date().toISOString() },
  { busId: "bus-3", busNumber: "SB-103", lat: 31.1060, lng: 30.9350, destinationLat: 31.0994, destinationLng: 30.9475, speed: 0, heading: 0, occupancy: 0, capacity: 40, status: "idle", routeName: "Route Gamma", nextStop: "Depot", eta: 0, driverName: "Omar R.", lastUpdated: new Date().toISOString() },
  { busId: "bus-4", busNumber: "SB-104", lat: 31.1000, lng: 30.9475, destinationLat: 31.0994, destinationLng: 30.9475, speed: 45, heading: 270, occupancy: 22, capacity: 40, status: "on-route", routeName: "Route Delta", nextStop: "Al Mahkama St", eta: 12, driverName: "Lina H.", lastUpdated: new Date().toISOString() },
];

// ===== ATTENDANCE =====
export const mockAttendance: AttendanceRecord[] = [
  { id: "1", studentName: "Maya Johnson", busNumber: "SB-101", date: "2026-02-22", boardingTime: "07:15", status: "present" },
  { id: "2", studentName: "Ali Hassan", busNumber: "SB-101", date: "2026-02-22", boardingTime: "07:18", status: "present" },
  { id: "3", studentName: "Emma Davis", busNumber: "SB-102", date: "2026-02-22", boardingTime: "-", status: "absent" },
  { id: "4", studentName: "Noah Smith", busNumber: "SB-102", date: "2026-02-22", boardingTime: "07:32", status: "late" },
  { id: "5", studentName: "Maya Johnson", busNumber: "SB-101", date: "2026-02-21", boardingTime: "07:10", status: "present" },
  { id: "6", studentName: "Maya Johnson", busNumber: "SB-104", date: "2026-02-20", boardingTime: "07:40", status: "late" },
  { id: "7", studentName: "Ali Hassan", busNumber: "SB-102", date: "2026-02-21", boardingTime: "-", status: "absent" },
  { id: "8", studentName: "Emma Davis", busNumber: "SB-103", date: "2026-02-21", boardingTime: "07:12", status: "present" },
];

// ===== NOTIFICATIONS =====
export const mockNotifications: Notification[] = [
  { id: "1", title: "Bus SB-105 Delayed", message: "SB-105 is running 10 minutes behind schedule due to traffic.", type: "warning", timestamp: new Date(Date.now() - 120000).toISOString(), read: false },
  { id: "2", title: "Bus SB-102 Approaching", message: "SB-102 will arrive at University Gate in 3 minutes.", type: "info", timestamp: new Date(Date.now() - 300000).toISOString(), read: false },
  { id: "3", title: "Attendance Recorded", message: "28 students boarded SB-101 successfully.", type: "success", timestamp: new Date(Date.now() - 600000).toISOString(), read: true },
  { id: "4", title: "Route Optimized", message: "Route Alpha has been optimized, saving 12 minutes.", type: "success", timestamp: new Date(Date.now() - 900000).toISOString(), read: true },
  { id: "5", title: "SB-103 Maintenance Due", message: "Bus SB-103 is due for scheduled maintenance.", type: "error", timestamp: new Date(Date.now() - 1800000).toISOString(), read: false },
];

// ===== ROUTE STOPS (Student Pickup Points in Kafr El Sheikh — No Fixed Stations) =====
export const mockRouteStops: RouteStop[] = [
  { id: "s1", name: "University Depot",      lat: 31.0994, lng: 30.9475, eta: "06:45", status: "completed", studentsCount: 0 },
  { id: "s2", name: "Al Geish St North",      lat: 31.1148, lng: 30.9408, eta: "07:05", status: "completed", studentsCount: 2 },
  { id: "s3", name: "Al Geish St Central",    lat: 31.1060, lng: 30.9408, eta: "07:18", status: "current",   studentsCount: 3 },
  { id: "s4", name: "Al Mahkama St Junction", lat: 31.1007, lng: 30.9408, eta: "07:28", status: "upcoming",  studentsCount: 1 },
  { id: "s5", name: "KFS University Gate",    lat: 31.0994, lng: 30.9475, eta: "07:40", status: "upcoming",  studentsCount: 0 },
];

// ===== STUDENT PICKUPS (Pickup Points based on student home locations) =====
export const mockStudentPickups: StudentPickup[] = [
  { id: "p1", name: "Maya Johnson", stop: "Al Ustad St North", status: "boarded", avatar: "https://i.pravatar.cc/150?img=48", phone: "01011112222" },
  { id: "p2", name: "Ali Hassan", stop: "Al Geish St - City Center", status: "waiting", avatar: "https://i.pravatar.cc/150?img=68", phone: "01022223333" },
  { id: "p3", name: "Noah Smith", stop: "West of Al Geish St", status: "waiting", avatar: "https://i.pravatar.cc/150?img=59", phone: "01033334444" },
  { id: "p4", name: "Emma Davis", stop: "Al Geish St North", status: "waiting", avatar: "https://i.pravatar.cc/150?img=45", phone: "01044445555" },
  { id: "p5", name: "Lara Khalil", stop: "Gen. Gamal Hamad St", status: "absent", avatar: "https://i.pravatar.cc/150?img=25", phone: "01055556666" },
];
