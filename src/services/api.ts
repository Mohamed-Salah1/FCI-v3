import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const locationApi = {
  update: (data: { busId: string; lat: number; lng: number }, timeout?: number) =>
    api.post("/location/update", data, timeout ? { timeout } : {}),
  getAll: (timeout?: number) => api.get("/location/all", timeout ? { timeout } : {}),
};

export const attendanceApi = {
  record: (data: { studentId: string; busId: string; status: string }, timeout?: number) =>
    api.post("/attendance/record", data, timeout ? { timeout } : {}),
  getHistory: (params?: { date?: string; busId?: string }, timeout?: number) =>
    api.get("/attendance/history", { params, ...(timeout ? { timeout } : {}) }),
};

export const notificationApi = {
  getAll: (timeout?: number) => api.get("/notifications", timeout ? { timeout } : {}),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const routeApi = {
  // Route optimization can be slow — allow a longer timeout per call
  optimize: (routeId: string, timeout?: number) =>
    api.post(`/optimizer/route/${routeId}`, {}, timeout ? { timeout } : {}),
  getAll: (timeout?: number) => api.get("/routes", timeout ? { timeout } : {}),
};

export default api;
