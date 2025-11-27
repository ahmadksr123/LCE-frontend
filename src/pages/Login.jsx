import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");   
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");   
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Save user & token in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update App state
      onLogin(data.user);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 w-screen">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
        <div className="flex items-center space-x-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/4/47/LUMS_Logo.png"
            alt="LUMS Logo"
            className="h-10"
          />
          <span className="font-semibold text-blue-700 text-lg">
            Centre for Entrepreneurship
          </span>
        </div>
        <nav className="space-x-6 font-medium text-gray-600 hidden md:flex">
          <a href="/" className="hover:text-purple-700">Home</a>
          <a href="/" className="hover:text-purple-700">Who We Are</a>
          <a href="/" className="hover:text-purple-700">What We Offer</a>
          <a href="/" className="hover:text-purple-700">Knowledge Hub</a>
        </nav>
      </header>

      {/* Main Section */}
      <div className="flex flex-1 w-full flex-col md:flex-row">
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-purple-200 flex items-center justify-center text-white p-8 md:p-12">
          <div className="text-center md:text-left max-w-md">
            <p className="text-sm mb-4 text-purple-700">
              Flexible, modern coworking space designed for productivity and community.
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug text-purple-900">
              DISCOVER <br /> YOUR IDEAL <br /> WORKSPACE
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-6 text-center">
              Login
            </h2>

            {error && (
              <div className="mb-4 text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-purple-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-purple-500 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-purple-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-purple-500 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-md transition 
                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-700 text-white hover:bg-purple-800"}`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="mt-4 text-sm text-gray-600 text-center">
              If you don't have an account, contact admin.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
