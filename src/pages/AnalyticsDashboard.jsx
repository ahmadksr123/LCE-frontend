// src/components/analytics/AnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { fetchMeetings } from "../api/calendarApi";
import api from "../components/axiosInstance"; // Make sure this path is correct
import {useNavigate} from "react-router-dom";
import {
  AnalyticsHeader,
  KeyMetricsSection,
  ChartsSection,
  MeetingsTable,
} from "../components/AnalyticsComponents";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [stats, setStats] = useState({ roomStats: {}, userStats: {}, dailyStats: {} });
  const [users, setUsers] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("All");
  const [userChartMonth, setUserChartMonth] = useState("");

  useEffect(() => {
    (async () => {
      const data = await fetchMeetings();
      const meetingsData = data || [];
      setMeetings(meetingsData);
      setFilteredMeetings(meetingsData);
      calculateStats(meetingsData);
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await fetch("http://localhost:5000/api/signup/");
  //       // const res = await fetch("https://lce-backend-bxn1.onrender.com/api/signup/");
  //       const data = await res.json();
  //       setUsers(data || []);
  //     // eslint-disable-next-line no-unused-vars
  //     } catch (err) {
  //       console.error("Failed to fetch users");
  //     }
  //   })();
  // }, []);
  // Fetch users data using axios instance ✅
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/signup/"); // ✅ Using axios instance with proper path
        const data = res.data || [];
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        // Optional: Set fallback empty array
        setUsers([]);
      }
    })();
  }, []);

  const calculateStats = (data) => {
    const roomStats = {};
    const userStats = {};
    const dailyStats = {};

    data.forEach((m) => {
      const room = m.room || "Unassigned";
      const user = m.organizer?.name || "Unknown";
      const dateKey = new Date(m.startTime || m.start)
        .toISOString()
        .split("T")[0];

      roomStats[room] = (roomStats[room] || 0) + 1;
      userStats[user] = (userStats[user] || 0) + 1;
      dailyStats[dateKey] = (dailyStats[dateKey] || 0) + 1;
    });

    setStats({ roomStats, userStats, dailyStats });
  };

  const handleFilter = () => {
    let filtered = [...meetings];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((m) => {
        const d = new Date(m.startTime || m.start);
        return d >= start && d <= end;
      });
    }

    if (selectedRoom !== "All") {
      filtered = filtered.filter((m) => (m.room || "Unassigned") === selectedRoom);
    }

    setFilteredMeetings(filtered);
    calculateStats(filtered);
  };

  const uniqueRooms = [
    "All",
    "Director's office","Room A", "Room B", "Room C", "Room D",
    "Room E", "Room F", "Room G", "Room H", "Room I",
  ];

  const getFilteredUserStats = () => {
    if (!userChartMonth) return stats.userStats || {};

    const filtered = meetings.filter((m) => {
      const date = new Date(m.startTime || m.start)
        .toISOString()
        .slice(0, 7);
      return date === userChartMonth;
    });

    const userStats = {};
    filtered.forEach((m) => {
      const user = m.organizer?.name || "Unknown";
      userStats[user] = (userStats[user] || 0) + 1;
    });
    return userStats;
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/90 border-b border-purple-200/50 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all hover:scale-105"
                title="Back to Calendar"
              >
                
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-purple-700 flex items-center gap-2">
                  <TrendingUp size={24} className="text-purple-600" />
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time meeting insights and statistics
                </p>
              </div>
            </div>
          </div>

          <AnalyticsHeader
            startDate={startDate}
            endDate={endDate}
            selectedRoom={selectedRoom}
            uniqueRooms={uniqueRooms}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setSelectedRoom={setSelectedRoom}
            handleFilter={handleFilter}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
      <div className="max-w-1xl mx-auto p-4 sm:p-6 space-y-6">
        {/* <KeyMetricsSection filteredMeetings={filteredMeetings} stats={stats} users={users} />
        <ChartsSection
          stats={stats}
          users={users}
          uniqueRooms={uniqueRooms}
          userChartMonth={userChartMonth}
          setUserChartMonth={setUserChartMonth}
          getFilteredUserStats={getFilteredUserStats}
        /> */}

        {/* Enhanced Table with New Filters */}
        <MeetingsTable
          allMeetings={meetings}
          filteredMeetings={filteredMeetings}
          users={users}
        />
      </div>
    </div>

     
    </div>
  );
}