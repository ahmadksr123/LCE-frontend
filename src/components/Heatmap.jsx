import React, { useEffect, useState } from "react";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  isSameDay,
} from "date-fns";
import { fetchMeetings } from "../api/calendarApi.js";

export default function Heatmap({ selectedDate, setSelectedDate, getDayCount }) {
  const [dayCounts, setDayCounts] = useState({});
  const [currentDate, setCurrentDate] = useState(selectedDate);

  // 🗓 Generate all days for current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // 🔄 Fetch meetings and build daily count map
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const data = await fetchMeetings();
        if (!data) throw new Error("Failed to fetch heatmap data");

        // Filter meetings only for the selected month
        const monthlyData = data.filter((meeting) => {
          const startDate = new Date(meeting.startTime || meeting.start);
          return (
            startDate.getFullYear() === year &&
            startDate.getMonth() + 1 === month
          );
        });

        // Count meetings per day
        const counts = {};
        monthlyData.forEach((meeting) => {
          const startDate = new Date(meeting.startTime || meeting.start);
          const key = format(startDate, "yyyy-MM-dd");
          counts[key] = (counts[key] || 0) + 1;
        });

        setDayCounts(counts);
      } catch (err) {
        console.error("Error loading heatmap:", err);
      }
    };

    fetchMonthlyData();
  }, [currentDate]);

  // 🧭 Generate dropdown options for 12 months around the current year
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentDate.getFullYear(), i);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy"),
    };
  });

  return (
    <div className="hidden md:flex flex-col w-80 border-r border-purple-800/30 p-4">
      <h3 className="text-lg font-semibold mb-4 text-purple-900">
        Monthly Heatmap
      </h3>

      {/* Month Selector */}
      <div className="mb-4">
        <select
          value={format(currentDate, "yyyy-MM")}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-");
            const newDate = new Date(year, month - 1);
            setCurrentDate(newDate);
            if (setSelectedDate) setSelectedDate(newDate);
          }}
          className="border border-gray-300 rounded p-2 text-sm w-full"
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {daysInMonth.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const count =
            dayCounts[key] !== undefined ? dayCounts[key] : getDayCount(day) || 0;

          const bg =
            count === 0
              ? "bg-gray-100"
              : count < 3
              ? "bg-green-300"
              : count < 6
              ? "bg-yellow-300"
              : "bg-red-400";

          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded ${bg} ${
                isSameDay(day, currentDate) ? "ring-2 ring-purple-600" : ""
              }`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs">
        <p className="font-medium mb-2 text-purple-900">Legend:</p>
        <div className="flex items-center gap-1 space-x-2 mb-1">
          <span className="w-4 h-4 bg-gray-100 rounded" /> 0 meetings
        </div>
        <div className="flex items-center gap-1 space-x-2 mb-1">
          <span className="w-4 h-4 bg-green-300 rounded" /> 1–2 meetings
        </div>
        <div className="flex items-center gap-1 space-x-2 mb-1">
          <span className="w-4 h-4 bg-yellow-300 rounded" /> 3–5 meetings
        </div>
        <div className="flex items-center gap-1 space-x-2">
          <span className="w-4 h-4 bg-red-400 rounded" /> 6+ meetings
        </div>
      </div>
    </div>
  );
}
