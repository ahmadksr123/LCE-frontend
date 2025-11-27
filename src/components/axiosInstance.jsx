// src/components/axiosInstance.jsx
import axios from "axios";

// Auto-switch for Vite:
// import.meta.env.PROD === true → production build
// import.meta.env.PROD === false → local development
const baseURL = import.meta.env.PROD
  ? "https://lce-backend-bxn1.onrender.com"
  : "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
