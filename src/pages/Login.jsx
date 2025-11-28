import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import api from "../components/axiosInstance";
import logo from "../assets/lums-university-seeklogo.png";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false); // Modal state

  const formRef = useRef(null);
  const navigate = useNavigate();

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Mobile keyboard scroll fix
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && window.visualViewport.height < window.innerHeight * 0.85) {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  const handleInputFocus = () => {
    if (window.innerWidth < 1024) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const data = res.data;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setSuccess("Login successful! Redirecting...");
      onLogin(data.user);

      setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans w-full overflow-x-hidden relative">
      {/* Premium Purple-White Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500 via-white to-purple-50 -z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDgwIDAgTCAwIDAgMCA4MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIwMCwxODAsMjQwLDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
      </div>

      {/* Glassmorphic Navbar */}      
      <header className=" fixed top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-purple-200/50 shadow-lg">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="LUMS Logo" className="h-10 drop-shadow-md" />
            <span className="font-bold text-xl text-purple-900">
              Centre for Entrepreneurship
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12">
        {/* Left - Hero */}
        <div className="w-full lg:w-1/2 text-center lg:text-left max-w-xl">
          <div className="inline-block px-5 py-2 bg-purple-400 backdrop-blur-md rounded-full border border-purple-300 mb-8 animate-fadeIn">
            <p className="text-purple-800 font-semibold">Premium Workspace Experience</p>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-purple-900 leading-tight mb-6 drop-shadow-xl animate-slideUp">
            DISCOVER <br />
            YOUR IDEAL <br />
            <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              WORKSPACE
            </span>
          </h1>

          <p className="text-lg text-purple-700 mb-10 max-w-lg mx-auto lg:mx-0">
            Flexible, modern coworking space designed for productivity and community.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
  {["500+", "24/7", "100+"].map((num, i) => (
    <div
      key={i}
      className="backdrop-blur-xl bg-white/60 border border-purple-200/60 rounded-2xl p-5 sm:p-6 text-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
    >
      {/* Number - Responsive font size */}
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-800 leading-tight">
        {num}
      </div>

      {/* Label - Responsive font size */}
      <div className="text-xs sm:text-sm font-medium text-purple-600 mt-1.5">
        {["Members", "Access", "Events"][i]}
      </div>
    </div>
  ))}
</div>
        </div>

        {/* Right - Glass Login Card */}
        <div ref={formRef} className="w-full lg:w-1/2 max-w-md">
          <div className="backdrop-blur-2xl bg-white/70 border border-purple-200/50 rounded-3xl shadow-2xl p-8 lg:p-10 animate-fadeIn">
            {/* <h2 className="text-4xl font-bold text-purple-900 text-center mb-8 drop-shadow-md">
              Welcome Back
            </h2> */}

            {error && (
              <div className="mb-6 p-4 bg-red-100/80 backdrop-blur border border-red-300 rounded-xl text-red-700 text-center flex items-center justify-center gap-2 animate-shake">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-100/80 backdrop-blur border border-green-300 rounded-xl text-green-700 text-center flex items-center justify-center gap-2 animate-fadeIn">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-6">
                <label className="block text-purple-900 font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-5 py-4 bg-white/50 backdrop-blur border border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300/50 text-purple-900 placeholder-purple-500 transition"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-purple-900 font-semibold mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-5 py-4 pr-14 bg-white/50 backdrop-blur border border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300/50 text-purple-900 placeholder-purple-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bg-transparent right-4 top-1/2 -translate-y-1/2 text-purple-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex justify-between items-center mb-8 text-sm text-purple-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 bg-transparent h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  Remember me
                </label>
                <a href="" className="hover:underline font-medium">Forgot Password?</a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform
                  ${loading 
                    ? "bg-purple-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-2xl hover:shadow-purple-500/25 active:scale-98"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Contact Admin Trigger */}
            <p className="text-center mt-8 text-purple-700">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="font-bold bg-transparent no-border text-blue-600 "
              >
                Contact Admin
              </button>
            </p>

            <p className="text-center mt-6 text-xs text-purple-500">
              Secured by LCE
            </p>
          </div>
        </div>
      </div>

      {/* ====================== CONTACT ADMIN MODAL ====================== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowContactModal(false)}
          />

          {/* Modal Card */}
          <div className="relative max-w-2xl w-full backdrop-blur-2xl bg-white/85 border border-purple-200/60 rounded-3xl shadow-2xl p-10 animate-slideUp">
            {/* Close X */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute bg-transparent top-4 right-4 text-purple-600 hover:text-purple-800 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-3xl font-bold text-purple-900 text-center mb-10">
              Need Access?
            </h3>

            <div className="grid md:grid-cols-2 gap-10 text-lg">
              {/* Left: Miss Amna Awan */}
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl mb-4">
                  A
                </div>
                <p className="font-semibold text-purple-900">Miss Amna Awan</p>
                <p className="text-purple-700 mt-2 leading-relaxed">
                  Visible, professional,
                  <br />
                  and always ready to help you get onboard!
                </p>
                <a
                  href="mailto:amna.awan@lums.edu.pk"
                  className="mt-6 inline-block px-8 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition shadow-lg"
                >
                  Email Amna
                </a>
              </div>

              {/* Right: Mr. Umar */}
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 bg-gray-200 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="font-semibold text-purple-900">Mr. Umar</p>
                <p className="text-purple-700 mt-2 leading-relaxed italic">
                  Invisible — because his MacBook
                  <br />
                  is doing the attendance.
                  <br />
                  <span className="text-3xl">(¬‿¬)</span>
                </p>
                <span className="mt-6 px-8 py-3 bg-gray-300 text-gray-600 font-medium rounded-xl cursor-not-allowed inline-block">
                  Email Umar (if you can find him)
                </span>
              </div>
            </div>

            <div className="text-center mt-12 text-purple-600 font-medium text-lg">
              Please reach out to <strong>Miss Amna Awan</strong> to get your account created.
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}