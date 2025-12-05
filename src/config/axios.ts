import axios from "axios";

// Get API base URL from environment variable or use default
const API_BASE_URL =
  // import.meta.env.VITE_API_BASE_URL || "https://localhost:7075/api";
   import.meta.env.VITE_API_BASE_URL || "https://summercampapi-339197681269.asia-southeast1.run.app/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  withCredentials: false, // Set to true if you need to send cookies
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login (but not if already on login page)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect to login if not already on login or register pages
      if (currentPath !== "/login" && currentPath !== "/register") {
        // Clear tokens from both storages
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      window.location.href = "/forbidden";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
