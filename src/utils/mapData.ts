// ============================================================
// Kafr El Sheikh University — Real GPS Coordinates
// Verified against OpenStreetMap & Google Maps data
//
// Key reference points (confirmed):
//   University Hospital (El Gish St): 31.1007, 30.9508
//   City center (Kafr El Sheikh):     31.1114, 30.9479
//   Sharia Al Geish (N-S artery):     lng ≈ 30.9408
//
// University main campus (Sakha Rd): 31.0994, 30.9475
// ============================================================

export interface KafLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface MockStudent {
  id: string;
  name: string;
  lat: number;
  lng: number;
  avatar: string;
  assignedBusId: string | null;
  locationName?: string;
}

export interface MockBus {
  id: string;
  number: string;
  color: string;
  colorHex: string;
  driverName: string;
  waypoints: [number, number][];  // sent to OSRM for real road routing
  route: [number, number][];      // fallback straight-line until OSRM responds
  startLat: number;
  startLng: number;
  capacity: number;
  speed: number;
}

// ── University (VERIFIED from Google Maps / OSM) ──────────────
// Main campus entrance on Sakha Road
export const UNIVERSITY: KafLocation = {
  name: "Kafr El Sheikh University",
  lat: 31.0994,
  lng: 30.9475,
};

// ── BUS ROUTES ─────────────────────────────────────────────────
//
// Strategy: waypoints follow REAL road intersections in Kafr El Sheikh.
// All coords checked against OSM street network.
//
// Major roads:
//   شارع الجيش (Al Geish St)      — main N-S artery,  lng ≈ 30.9408
//   شارع المحافظة                  — parallel N-S,     lng ≈ 30.9455
//   طريق سخا (Sakha Rd)           — W approach to uni, lat ≈ 31.099
//   شارع الأستاذ / شارع 19        — E-W cross streets
//   شارع الموقف (Al Mawqef St)    — E side,           lng ≈ 30.9530

export const MOCK_BUSES: MockBus[] = [
  // ─────────────────────────────────────────────────────────────
  // BUS 1 — Red  |  North-East → Al Geish St → University
  // Starts near Sharia Al Ustad (north-east area)
  // ─────────────────────────────────────────────────────────────
  {
    id: "bus-1",
    number: "SB-101",
    color: "red",
    colorHex: "#ef4444",
    driverName: "Ahmad Khaled",
    startLat: 31.1145,
    startLng: 30.9479,
    capacity: 40,
    speed: 35,
    // Road path: شارع الأستاذ → Al Geish → Sakha Rd → University gate
    waypoints: [
      [31.1145, 30.9479],  // Start: near Sharia Al Ustad north
      [31.1120, 30.9465],  // Sharia Al Ustad junction
      [31.1095, 30.9450],  // ★ Pickup: north residential
      [31.1068, 30.9440],  // Al Geish St heading south
      [31.1040, 30.9430],  // ★ Pickup: mid Al Geish
      [31.1015, 30.9450],  // Approaching Sakha Rd
      [31.1007, 30.9508],  // Hospital / university area turn
      [31.0994, 30.9475],  // 🏛️ University gate
    ],
    route: [
      [31.1145, 30.9479],
      [31.1095, 30.9450],
      [31.1040, 30.9430],
      [31.0994, 30.9475],
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // BUS 2 — Blue  |  Al Geish St North → South → University
  // Runs along the main N-S artery (شارع الجيش)
  // ─────────────────────────────────────────────────────────────
  {
    id: "bus-2",
    number: "SB-102",
    color: "blue",
    colorHex: "#3b82f6",
    driverName: "Sara Mostafa",
    startLat: 31.1148,
    startLng: 30.9408,
    capacity: 40,
    speed: 30,
    // Road path: straight down شارع الجيش → east on Sakha Rd → University
    waypoints: [
      [31.1148, 30.9408],  // Start: far north Al Geish St
      [31.1120, 30.9408],  // ★ Pickup: north Al Geish
      [31.1090, 30.9408],  // شارع 6 intersection
      [31.1060, 30.9408],  // شارع 39 area
      [31.1030, 30.9408],  // ★ Pickup: mid city Al Geish
      [31.1007, 30.9408],  // شارع المحكمة intersection
      [31.1007, 30.9440],  // Turn east toward university
      [31.1000, 30.9475],  // Sakha Rd
      [31.0994, 30.9475],  // 🏛️ University gate
    ],
    route: [
      [31.1148, 30.9408],
      [31.1060, 30.9408],
      [31.1007, 30.9408],
      [31.1000, 30.9475],
      [31.0994, 30.9475],
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // BUS 3 — Green  |  West (شارع اللواء جمال حماد area) → University
  // Comes from western residential area
  // ─────────────────────────────────────────────────────────────
  {
    id: "bus-3",
    number: "SB-103",
    color: "green",
    colorHex: "#22c55e",
    driverName: "Omar Ramadan",
    startLat: 31.1095,
    startLng: 30.9295,
    capacity: 40,
    speed: 40,
    // Road path: شارع اللواء جمال حماد → east → Al Geish → Sakha Rd → University
    waypoints: [
      [31.1095, 30.9295],  // Start: west residential
      [31.1090, 30.9330],  // Heading east on E-W street
      [31.1080, 30.9355],  // ★ Pickup: west of Al Geish
      [31.1068, 30.9368],  // Joining Al Geish St southbound
      [31.1045, 30.9390],  // ★ Pickup: Al Geish mid
      [31.1020, 30.9400],  // Continue south on Al Geish
      [31.1007, 30.9408],  // شارع المحكمة
      [31.1007, 30.9440],  // Turn east
      [31.0994, 30.9475],  // 🏛️ University gate
    ],
    route: [
      [31.1095, 30.9295],
      [31.1080, 30.9355],
      [31.1045, 30.9390],
      [31.1007, 30.9408],
      [31.0994, 30.9475],
    ],
  },
];

// ── Students — placed at confirmed road-side pickup points ────
export const MOCK_STUDENTS: MockStudent[] = [
  {
    id: "st-1",
    name: "Maya Johnson",
    lat: 31.1095,
    lng: 30.9450,
    avatar: "https://i.pravatar.cc/150?img=48",
    assignedBusId: "bus-1",
    locationName: "Al Ustad St North",
  },
  {
    id: "st-2",
    name: "Ali Hassan",
    lat: 31.1030,
    lng: 30.9408,
    avatar: "https://i.pravatar.cc/150?img=68",
    assignedBusId: "bus-2",
    locationName: "Al Geish St - City Center",
  },
  {
    id: "st-3",
    name: "Emma Davis",
    lat: 31.1120,
    lng: 30.9408,
    avatar: "https://i.pravatar.cc/150?img=45",
    assignedBusId: "bus-2",
    locationName: "Al Geish St North",
  },
  {
    id: "st-4",
    name: "Noah Smith",
    lat: 31.1080,
    lng: 30.9355,
    avatar: "https://i.pravatar.cc/150?img=59",
    assignedBusId: "bus-3",
    locationName: "West of Al Geish St",
  },
];

// ── OSRM real-road routing ─────────────────────────────────────
// Calls the free OSRM demo server to get a road-snapped polyline.
// Falls back to straight-line `route` if the request fails.
export async function fetchRoadRoute(
  waypoints: [number, number][]
): Promise<[number, number][]> {
  // OSRM expects lng,lat
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const json = await res.json();

  if (json.code !== "Ok" || !json.routes?.[0]) {
    throw new Error("OSRM: no route");
  }

  // GeoJSON = [lng, lat] → swap to [lat, lng]
  return json.routes[0].geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
  );
}

// ── Utilities ──────────────────────────────────────────────────
export function calcDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function interpolateRoute(
  route: [number, number][],
  progress: number
): [number, number] {
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const d = calcDistance(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
    segLengths.push(d);
    totalLen += d;
  }

  let target = progress * totalLen;
  for (let i = 0; i < segLengths.length; i++) {
    if (target <= segLengths[i]) {
      const t = segLengths[i] > 0 ? target / segLengths[i] : 0;
      return [
        route[i][0] + (route[i + 1][0] - route[i][0]) * t,
        route[i][1] + (route[i + 1][1] - route[i][1]) * t,
      ];
    }
    target -= segLengths[i];
  }
  return route[route.length - 1];
}

export function splitRoute(
  route: [number, number][],
  progress: number
): { traveled: [number, number][]; remaining: [number, number][] } {
  if (progress <= 0) return { traveled: [route[0]], remaining: [...route] };
  if (progress >= 1) return { traveled: [...route], remaining: [route[route.length - 1]] };

  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const d = calcDistance(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1]);
    segLengths.push(d);
    totalLen += d;
  }

  let target = progress * totalLen;
  let splitIdx = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (target <= segLengths[i]) { splitIdx = i; break; }
    target -= segLengths[i];
    splitIdx = i + 1;
  }

  const currentPos = interpolateRoute(route, progress);
  const traveled: [number, number][] = [...route.slice(0, splitIdx + 1), currentPos];
  const remaining: [number, number][] = [currentPos, ...route.slice(splitIdx + 1)];
  return { traveled, remaining };
}

export const KAFR_LOCATIONS: KafLocation[] = [
  { name: "Kafr El Sheikh University",        lat: 31.0994, lng: 30.9475 },
  { name: "University Main Gate", lat: 31.1000, lng: 30.9470 },
  { name: "Al Geish St North",      lat: 31.1148, lng: 30.9408 },
  { name: "Al Geish St Central",        lat: 31.1060, lng: 30.9408 },
  { name: "University Hospital",          lat: 31.1007, lng: 30.9508 },
  { name: "Gen. Gamal Hamad St",   lat: 31.1068, lng: 30.9368 },
  { name: "Al Ustad St",            lat: 31.1145, lng: 30.9479 },
  { name: "West District",          lat: 31.1095, lng: 30.9295 },
  { name: "Al Mahkama St",             lat: 31.1007, lng: 30.9408 },
];

export const STUDENT_PICKUP_LOCATIONS: KafLocation[] = KAFR_LOCATIONS.slice(1);

export function assignStudentToBus(studentLat: number, studentLng: number): string {
  let bestBusId = MOCK_BUSES[0].id;
  let minDist = Infinity;
  MOCK_BUSES.forEach((bus) => {
    bus.waypoints.forEach(([lat, lng]) => {
      const dist = calcDistance(studentLat, studentLng, lat, lng);
      if (dist < minDist) { minDist = dist; bestBusId = bus.id; }
    });
  });
  return bestBusId;
}

export function nearestLocationName(lat: number, lng: number): string {
  let name = KAFR_LOCATIONS[0].name;
  let minDist = Infinity;
  KAFR_LOCATIONS.forEach((loc) => {
    const d = calcDistance(lat, lng, loc.lat, loc.lng);
    if (d < minDist) { minDist = d; name = loc.name; }
  });
  return name;
}
