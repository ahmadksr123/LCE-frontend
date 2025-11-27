import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm({
  newEvent,
  setNewEvent,
  setShowForm,
  handleSaveBooking,
  meetingRooms,
  refreshMeetings,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [existingMeetings, setExistingMeetings] = useState([]);

  // ✅ Fetch existing meetings for conflict checking
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/meetings");
        setExistingMeetings(res.data || []);
      } catch (err) {
        console.error("Error fetching meetings for conflict check:", err);
      }
    };
    fetchMeetings();
  }, []);

  // ✅ Helper function to check overlap with 10-min buffer
  const checkRoomAvailability = () => {
    const room = newEvent.room || meetingRooms?.[0]?.name || "Room A";
    const start = new Date(newEvent.start);
    const end = new Date(newEvent.end);

    if (!start || !end || start >= end) {
      setError("Invalid meeting time range.");
      return false;
    }

    // add 10-minute buffer
    const buffer = 10 * 60 * 1000;

    // check conflicts
    for (let meeting of existingMeetings) {
      if (meeting.room !== room) continue;

      const existingStart = new Date(meeting.startTime);
      const existingEnd = new Date(meeting.endTime);

      // define buffer window
      const adjustedStart = new Date(existingStart.getTime() - buffer);
      const adjustedEnd = new Date(existingEnd.getTime() + buffer);

      // overlap check (considering buffer)
      const overlap = start < adjustedEnd && end > adjustedStart;
      if (overlap) {
        const msg = `❌ Room "${room}" is occupied from ${existingStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} to ${existingEnd.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}. Please choose another time (10-min gap required).`;
        setError(msg);
        return false;
      }
    }
    return true;
  };

  const handleCreateMeeting = async () => {
    try {
      setError("");

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const organizerId = storedUser?.id || storedUser?._id;
      if (!organizerId) {
        setError("Organizer not found. Please login again.");
        return;
      }

      // ✅ Check conflicts before creating meeting
      const available = checkRoomAvailability();
      if (!available) return;

      const payload = {
        title: newEvent.title,
        organizer: organizerId,
        participants: newEvent.participants || [],
        startTime: newEvent.start,
        endTime: newEvent.end,
        room: newEvent.room || meetingRooms?.[0]?.name || "Room A",
        description: newEvent.description || "",
      };

      const res = await axios.post("http://localhost:5000/api/meetings", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (refreshMeetings) refreshMeetings();
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      console.error("❌ Create meeting error:", err);
      setError(err.response?.data?.message || "Failed to create meeting.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 px-2 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
    >
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl border border-purple-800/30 w-full max-w-md sm:max-w-lg">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-purple-900 border-b border-purple-800/30 pb-3 flex items-center">
          <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2" /> 
          New Meeting
        </h2>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              placeholder="Organization / Meeting Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Meeting description..."
              value={newEvent.description || ""}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
            />
          </div>

          {/* DatePickers */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700">
                Meeting Start
              </label>
              <DatePicker
                selected={newEvent.start ? new Date(newEvent.start) : null}
                onChange={(date) => setNewEvent({ ...newEvent, start: date })}
                showTimeSelect
                dateFormat="Pp"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700">
                Meeting End
              </label>
              <DatePicker
                selected={newEvent.end ? new Date(newEvent.end) : null}
                onChange={(date) => setNewEvent({ ...newEvent, end: date })}
                showTimeSelect
                dateFormat="Pp"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Room Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Select Room
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex justify-between items-center w-full px-3 py-2 sm:px-4 sm:py-3 bg-white text-black border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span>{newEvent.room || meetingRooms?.[0]?.name || "Room A"}</span>
              <ChevronDown className="w-4 h-4 text-purple-600" />
            </button>
            {dropdownOpen && meetingRooms?.length > 0 && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {meetingRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setNewEvent({ ...newEvent, room: room.name });
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
                  >
                    {room.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 mt-4 whitespace-pre-line text-sm border border-red-200 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={() => setShowForm(false)}
            className="px-5 py-2 bg-gray-400/30 text-gray-900 rounded-lg font-medium hover:bg-gray-400/50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateMeeting}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
          >
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
