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
  update: (data: { busId: string; lat: number; lng: number }) =>
    api.post("/location/update", data),
  getAll: () => api.get("/location/all"),
};

export const attendanceApi = {
  record: (data: { studentId: string; busId: string; status: string }) =>
    api.post("/attendance/record", data),
  getHistory: (params?: { date?: string; busId?: string }) =>
    api.get("/attendance/history", { params }),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const routeApi = {
  optimize: (routeId: string) => api.post(`/optimizer/route/${routeId}`),
  getAll: () => api.get("/routes"),
};

export default api;
