export interface Student {
  id: string;
  name: string;
  grade: string;
  bus: string;
  stop: string;
  status: "active" | "inactive";
  email: string;
  phone: string;
  parentPhone?: string;
  route?: string;
  pickupPoint?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  assignedBus: string;
  status: "active" | "inactive";
  availability: "available" | "on-duty" | "off-duty";
  avatar?: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  plateNumber: string;
  assignedDriver: string;
  route: string;
  status: "active" | "maintenance" | "inactive";
}

export interface Route {
  id: string;
  name: string;
  assignedBus: string;
  stops: string[];
  status: "active" | "inactive";
}
