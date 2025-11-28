import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
// import "./App.css";


import React from "react";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on first load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("❌ Failed to parse user:", err);
      localStorage.removeItem("user");
    } finally {
      setLoading(false); // Done checking
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            loading ? null : user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            loading ? null : user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route
          path="*"
          element={loading ? null : <Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

      </Routes>
    </Router>
  );
}

export default App;
