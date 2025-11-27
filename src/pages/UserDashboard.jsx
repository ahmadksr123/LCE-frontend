import React from "react";
import CalendarView from "../components/CalendarView";

export default function Dashboard() {
  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* <h1 className="p-4 text-3xl font-bold mb-[-10px] text-purple-900">Dashboard</h1> */}
      <CalendarView />
    </div>
  );
}
