// src/api/authApi.js
import axios from "axios";
import api from "../components/axiosInstance"; // Make sure this path is correct

// const API = "http://localhost:5000/api/auth";
// const API = "https://lce-backend-bxn1.onrender.com/api/auth";
const API = api.defaults.baseURL + "/api/auth";

// ✅ Refresh token
export const refreshToken = async () => {
  try {
    const res = await axios.post(`${API}/refresh`, {}, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Refresh token failed:", err.response?.data || err.message);
    return null;
  }
};

// ✅ Logout
export const logout = async () => {
  try {
    await axios.post(`${API}/logout`, {}, { withCredentials: true });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.reload();
    return true;
  } catch (err) {
    console.error("Logout failed:", err.response?.data || err.message);
    return false;
  }
};
