export type UserRole = "admin" | "student" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  busNumber: string;
  avatar: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  avatar: string;
}

export interface AvailableRoute {
  id: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  stops: string[];
  estimatedPickupTime: string;
  status: "active" | "inactive";
  eta: number;
  occupancy: number;
  capacity: number;
}

export interface BusLocation {
  busId: string;
  busNumber: string;
  lat: number;
  lng: number;
  destinationLat: number;
  destinationLng: number;
  speed: number;
  heading: number;
  occupancy: number;
  capacity: number;
  status: "on-route" | "approaching" | "arrived" | "idle" | "delayed";
  routeName: string;
  nextStop: string;
  eta: number;
  driverName: string;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  read: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  busNumber: string;
  date: string;
  boardingTime: string;
  status: "present" | "absent" | "late";
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  eta: string;
  status: "completed" | "current" | "upcoming";
  studentsCount: number;
}

export interface StudentPickup {
  id: string;
  name: string;
  stop: string;
  status: "waiting" | "boarded" | "absent";
  avatar?: string;
  phone?: string;
}
