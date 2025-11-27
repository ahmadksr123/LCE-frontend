// src/components/analytics/AnalyticsComponents.jsx
import React, { useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar, Users, Building2, Clock, Download } from "lucide-react";

export function AnalyticsHeader({
  startDate,
  endDate,
  selectedRoom,
  uniqueRooms,
  setStartDate,
  setEndDate,
  setSelectedRoom,
  handleFilter,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-xl p-3 border border-purple-200/50 shadow-sm">
      <div className="flex gap-2 flex-1">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-600 block mb-1">From Date</label>
          <input
            type="date"
            className="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent [color-scheme:light] accent-purple-600"
            style={{ colorScheme: "light" }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-600 block mb-1">To Date</label>
          <input
            type="date"
            className="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent [color-scheme:light] accent-purple-600"
            style={{ colorScheme: "light" }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 sm:flex-1">
        <div className="flex-1">
          <label className="text-xs text-gray-600 block mb-1">
            Room Filter
          </label>
          <select
            className="w-full border border-purple-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            {uniqueRooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFilter}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold px-6 py-1.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg self-end"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export function KeyMetricsSection({ filteredMeetings, stats, users }) {
  const avgDuration = () => {
    if (!filteredMeetings.length) return "0h 0m";
    const total = filteredMeetings.reduce((acc, m) => {
      return (
        acc + (new Date(m.endTime || m.end) - new Date(m.startTime || m.start))
      );
    }, 0);
    const avgMin = total / filteredMeetings.length / 60000;
    const h = Math.floor(avgMin / 60);
    const m = Math.floor(avgMin % 60);
    return `${h}h ${m}m`;
  };

  const topRoom = Object.entries(stats.roomStats || {}).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Calendar size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Total Meetings</p>
        <p className="text-2xl font-bold">{filteredMeetings.length}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Building2 size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Useable Rooms</p>
        <p className="text-2xl font-bold">
          {Object.keys(stats.roomStats || {}).length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Users size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Active Users</p>
        <p className="text-2xl font-bold">
          {users.filter((u) => u.role === "User" || u.role === "user").length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Users size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Administrators</p>
        <p className="text-2xl font-bold">
          {users.filter((u) => u.role === "Admin" || u.role === "admin").length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-pink-600 to-pink-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Clock size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Avg Duration</p>
        <p className="text-xl font-bold">{avgDuration()}</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <Building2 size={20} className="opacity-80" />
        </div>
        <p className="text-xs opacity-90 mb-1">Most Popular</p>
        <p className="text-sm font-bold truncate">
          {topRoom ? `${topRoom[0]} (${topRoom[1]})` : "N/A"}
        </p>
      </div>
    </div>
  );
}

export function ChartsSection({
  stats,
  users,
  uniqueRooms,
  userChartMonth,
  setUserChartMonth,
  getFilteredUserStats,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timeline */}
      <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md border border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Meetings Timeline</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={Object.entries(stats.dailyStats || {}).map(
              ([date, count]) => ({ date, count })
            )}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ fill: "#7c3aed", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Room Utilization */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-purple-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Room Utilization</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={uniqueRooms
              .filter((r) => r !== "All")
              .map((r) => ({ room: r, count: stats.roomStats?.[r] || 0 }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="room" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Activity */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-purple-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">User Activity</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              className="border border-purple-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ colorScheme: "light" }}
              value={userChartMonth}
              onChange={(e) => setUserChartMonth(e.target.value)}
            />
            {userChartMonth && (
              <button
                onClick={() => setUserChartMonth("")}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={users
              .filter(
                (u) =>
                  u.role === "User" ||
                  u.role === "user" ||
                  u.role === "Admin" ||
                  u.role === "admin"
              )
              .map((u) => ({
                user: u.name,
                count: getFilteredUserStats()[u.name] || 0,
              }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="user" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MeetingsTable({ allMeetings, filteredMeetings, users }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [durationFilter, setDurationFilter] = useState("all"); // all, 3h, 4h, 5h
  const [userFilter, setUserFilter] = useState(""); // selected user name

  // Compute displayed meetings based on filters
  const displayedMeetings = React.useMemo(() => {
    let data = filteredMeetings;

    // User Filter (including "undefined")
    if (userFilter) {
      data = allMeetings.filter((m) => {
        const organizerName = m.organizer?.name || "undefined";
        return organizerName === userFilter;
      });
    }

    // Duration Filter
    if (durationFilter !== "all") {
      const hours = parseInt(durationFilter);
      const threshold = hours * 60 * 60 * 1000;
      data = data.filter((m) => {
        const duration =
          new Date(m.endTime || m.end) - new Date(m.startTime || m.start);
        return duration >= threshold;
      });
    }

    return data;
  }, [allMeetings, filteredMeetings, durationFilter, userFilter]);

  const formatDuration = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return { h, m, totalH: h + m / 60 };
  };

  const getDurationBadge = (ms) => {
    const { h, m, totalH } = formatDuration(ms);
    if (totalH >= 5)
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
          ⚠️ {h}h {m}m
        </span>
      );
    if (totalH >= 4)
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
          🔴 {h}h {m}m
        </span>
      );
    if (totalH >= 3)
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
          🟠 {h}h {m}m
        </span>
      );
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {h}h {m}m
      </span>
    );
  };

  const exportToCSV = () => {
    if (!displayedMeetings.length) return alert("No data to export!");
    const headers = ["Date", "Room", "Organizer", "Start", "End", "Duration"];
    const rows = displayedMeetings.map((m) => {
      const start = new Date(m.startTime || m.start);
      const end = new Date(m.endTime || m.end);
      const { h, m: mint } = formatDuration(end - start);
      return [
        format(start, "yyyy-MM-dd"),
        m.room || "Unassigned",
        m.organizer?.name || "Unknown",
        format(start, "HH:mm"),
        format(end, "HH:mm"),
        `${h}h ${mint}m`,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `Meetings_${userFilter || "All"}_${
        durationFilter !== "all" ? durationFilter + "h+" : "All"
      }.csv`
    );
  };

  const exportToPDF = () => {
    if (!displayedMeetings.length) return alert("No data to export!");
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(
      `Meeting Report ${userFilter ? `- ${userFilter}` : ""} ${
        durationFilter !== "all" ? `(${durationFilter}h+)` : ""
      }`,
      14,
      15
    );

    const tableData = displayedMeetings.map((m) => {
      const start = new Date(m.startTime || m.start);
      const end = new Date(m.endTime || m.end);
      const { h, m: mint } = formatDuration(end - start);
      return [
        format(start, "dd MMM yyyy"),
        m.room || "Unassigned",
        m.organizer?.name || "Unknown",
        format(start, "HH:mm"),
        format(end, "HH:mm"),
        `${h}h ${mint}m`,
      ];
    });

    autoTable(doc, {
      head: [["Date", "Room", "Organizer", "Start", "End", "Duration"]],
      body: tableData,
      startY: 25,
      theme: "grid",
      headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] },
    });
    doc.save(
      `Meetings_${userFilter || "All"}_${
        durationFilter !== "all" ? durationFilter + "h+" : ""
      }.pdf`
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-purple-100">
      {/* Advanced Filters Above Table */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">
            Meeting Records & Analytics
          </h2>
          <span className="text-sm text-purple-600 font-medium">
            ({displayedMeetings.length} meetings)
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Duration Filter */}
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="border border-purple-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="all">All Durations</option>
            <option value="3">≥ 3 Hours</option>
            <option value="4">≥ 4 Hours</option>
            <option value="5">≥ 5 Hours</option>
          </select>

          {/* User Filter */}
          {/* User Filter - Includes "undefined" as valid option */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value || "")}
            className="border border-purple-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="">All Organizers</option>
            {/* Always show "undefined" option first */}
            <option value="undefined">undefined (No Organizer)</option>

            {/* Safe mapping of real users */}
            {Array.isArray(users) &&
              users
                .filter((u) => u.name) // only users with a name
                .map((u) => (
                  <option key={u._id || u.id || u.email} value={u.name}>
                    {u.name} ({u.email?.split("@")[0] || "no-email"})
                  </option>
                ))}
          </select>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition"
            >
              <Download size={16} /> Export
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-transparent rounded-lg shadow-xl border-purple-200 z-20">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-purple-200 hover:bg-purple-100 transition"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-purple-200 hover:bg-purple-100 border-t transition"
                  >
                    Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-purple-100">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Date</th>
              <th className="py-3 px-4 text-left font-semibold">Room</th>
              <th className="py-3 px-4 text-left font-semibold">Organizer</th>
              <th className="py-3 px-4 text-left font-semibold">Time</th>
              <th className="py-3 px-4 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {displayedMeetings.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500">
                  {durationFilter === "all" && !userFilter
                    ? "No meetings found"
                    : "No meetings match your filters"}
                </td>
              </tr>
            ) : (
              displayedMeetings.map((m, i) => {
                const start = new Date(m.startTime || m.start);
                const end = new Date(m.endTime || m.end);
                const durationMs = end - start;
                return (
                  <tr key={i} className="hover:bg-purple-50 transition">
                    <td className="py-3 px-4 text-gray-700">
                      {format(start, "MMM dd, yyyy")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                        {m.room || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {m.organizer?.name || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(start, "HH:mm")} → {format(end, "HH:mm")}
                    </td>
                    <td className="py-3 px-4">
                      {getDurationBadge(durationMs)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
