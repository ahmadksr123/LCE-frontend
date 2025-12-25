import React, { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, X, AlertTriangle } from "lucide-react";
import DatePicker from "react-datepicker";
import axios from "axios";
import api from "../components/axiosInstance"; // Make sure this path is correct
import "react-datepicker/dist/react-datepicker.css";

export default function BookingForm({
  newEvent,
  setNewEvent,
  setShowForm,
  // handleSaveBooking,
  meetingRooms,
  refreshMeetings,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");
  const [existingMeetings, setExistingMeetings] = useState([]);

  // ✅ Fetch existing meetings for conflict checking
  // useEffect(() => {
  //   const fetchMeetings = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:5000/api/meetings");
  //       // const res = await axios.get("https://lce-backend-bxn1.onrender.com/api/meetings");
  //       setExistingMeetings(res.data || []);
  //     } catch (err) {
  //       console.error("Error fetching meetings for conflict check:", err);
  //     }
  //   };
  //   fetchMeetings();
  // }, []);

  const dropdownRef = useRef(null);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get("/api/meetings");
        setExistingMeetings(res.data || []);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setExistingMeetings([]); // Fallback
        // toast.error("Could not load meetings");
      }
    };
    fetchMeetings();
  }, []);

  // ✅ Prevent background scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // ✅ Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowForm(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setShowForm]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!dropdownOpen) return;
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [dropdownOpen]);

  // ✅ Ensure dropdown is visible (scroll modal body to it) when opened
  useEffect(() => {
    if (!dropdownOpen) return;
    requestAnimationFrame(() => {
      dropdownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, [dropdownOpen]);

  // ✅ Helper function to check overlap with 10-min buffer
  const checkRoomAvailability = () => {
    const room = newEvent.room || meetingRooms?.[0]?.name || "Room A";
    const start = new Date(newEvent.start);
    const end = new Date(newEvent.end);

    if (!newEvent.start || !newEvent.end || isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      setError("Invalid meeting time range.");
      return false;
    }

    // add 10-minute buffer
    const buffer = 10 * 60 * 1000;

    for (let meeting of existingMeetings) {
      if (meeting.room !== room) continue;

      const existingStart = new Date(meeting.startTime);
      const existingEnd = new Date(meeting.endTime);

      const adjustedStart = new Date(existingStart.getTime() - buffer);
      const adjustedEnd = new Date(existingEnd.getTime() + buffer);

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

      if (!newEvent.title?.trim()) {
        setError("Meeting title is required.");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const organizerId = storedUser?.id || storedUser?._id;
      if (!organizerId) {
        setError("Organizer not found. Please login again.");
        return;
      }

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

      // const res = await axios.post("http://localhost:5000/api/meetings", payload, {
      // // const res = await axios.post("https://lce-backend-bxn1.onrender.com/api/meetings", payload, {
      //   headers: { "Content-Type": "application/json" },
      // });
      const res = await api.post("/api/meetings", payload, {
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
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl border border-purple-200/60 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-purple-200/60 bg-white/90 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-purple-700">New Meeting</h2>
              <p className="text-xs text-purple-500">Pick time and room</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg bg-purple-100 p-2 text-purple-700 hover:bg-purple-200 transition-all"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div
          ref={modalBodyRef}
          className="max-h-[75vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
        >
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
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-purple-900 placeholder-purple-400 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
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
                rows={3}
                className="w-full resize-none rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-purple-900 placeholder-purple-400 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
              />
            </div>

            {/* DatePickers */}
            {/* <div className=""> */}
              <div className="grid grid-cols-1 gap-4">
  <div className="w-full">
    <label className="block text-sm font-medium w-full text-purple-700 mb-2">
      Meeting Start
    </label>
    <DatePicker
      selected={newEvent.start ? new Date(newEvent.start) : null}
      onChange={(date) => setNewEvent({ ...newEvent, start: date })}
      showTimeSelect
      dateFormat="Pp"
      wrapperClassName="w-full"
      className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-purple-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
    />
  </div>

  <div className="w-full">
    <label className="block text-sm font-medium w-full text-purple-700 mb-2">
      Meeting End
    </label>
    <DatePicker
      selected={newEvent.end ? new Date(newEvent.end) : null}
      onChange={(date) => setNewEvent({ ...newEvent, end: date })}
      showTimeSelect
      dateFormat="Pp"
      wrapperClassName="w-full"
      className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-purple-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
    />
  </div>
</div>

            {/* </div> */}
            {/* Quick duration + warning */}
            {newEvent.start && newEvent.end && (
              <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-xs text-purple-700 flex items-center justify-between gap-3">
                <span>
                  Duration:{" "}
                  <b>
                    {Math.max(
                      0,
                      Math.round(
                        (new Date(newEvent.end).getTime() - new Date(newEvent.start).getTime()) /
                          60000
                      )
                    )}{" "}
                    min
                  </b>
                </span>
                {new Date(newEvent.end) <= new Date(newEvent.start) && (
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <AlertTriangle size={14} /> Invalid range
                  </span>
                )}
              </div>
            )}

            {/* Room Dropdown (simple, scroll-down, scrollable list) */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Select Room
              </label>

              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-purple-900 shadow-sm outline-none transition outline-none hover:bg-purple-50 focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
              >
                <span className="truncate">
                  {newEvent.room || meetingRooms?.[0]?.name || "Room A"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-purple-700 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="mt-2 w-full overflow-hidden rounded-xl border border-purple-200 bg-white shadow-lg">
                  {/* ✅ scrollable options */}
                  <div className="max-h-56 overflow-y-auto py-1">
                    {(meetingRooms || []).map((room) => {
                      const active =
                        (newEvent.room || meetingRooms?.[0]?.name || "Room A") === room.name;

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => {
                            setNewEvent({ ...newEvent, room: room.name });
                            setDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2 text-sm transition bg-white ${
                            active ? "bg-purple-50" : "hover:bg-purple-50"
                          }`}
                        >
                          <span className="truncate text-purple-700">{room.name}</span>
                          {active && (
                            <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 whitespace-pre-line">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-purple-200/60 bg-white px-4 py-4 sm:px-6">
          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleCreateMeeting}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
          >
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
