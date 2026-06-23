import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";

const client = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — normalize & token expiry
client.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
