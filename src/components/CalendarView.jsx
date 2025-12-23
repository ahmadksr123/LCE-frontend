import React, { useState, useEffect } from "react";
import { Calendar, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format } from "date-fns";
import { Toaster } from 'react-hot-toast';

<Toaster position="top-right" />
import {
  Filter,
  Shield,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
  Calendar as CalendarIcon,
  BarChart3,
} from "lucide-react";
import { refreshToken, logout } from "../api/authApi.js";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import BookingForm from "./BookingForm";
import MeetingDetails from "./MeetingDetails";
import UserManagement from "./UserManagement";
import Heatmap from "./Heatmap";
import RoomFilter from "./RoomFilter";
import RoleSwitcher from "./RoleSwitcher";

import {
  localizer,
  meetingRooms,
  eventStyleGetter,
  getDayCount,
} from "../utils/calendarUtils.js";
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../api/calendarApi.js";
import {
  canCreate,
  canEdit,
  canDelete,
  canManageUsers,
} from "../utils/permissions";

const DnDCalendar = withDragAndDrop(Calendar);

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    room: null,
  });
  const [roomFilter, setRoomFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [role, setRole] = useState("Owner");
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
  (async () => {
    const raw = await fetchMeetings();

    // safe user
    let u = null;
    try { u = JSON.parse(localStorage.getItem("user") || "null"); } catch { u = null; }
    const role = (u?.role || "Owner").toString();
    const uid = (u?.id || u?._id || null)?.toString();

    setRole(role);

    // normalize meetings for react-big-calendar + your CRUD
    const meetings = (Array.isArray(raw) ? raw : [])
      .filter(Boolean)
      .map((m) => ({
        ...m,
        id: (m._id || m.id || "").toString(),
        start: new Date(m.startTime ?? m.start),
        end: new Date(m.endTime ?? m.end),
        organizerId: (
          typeof m.organizer === "string"
            ? m.organizer
            : m.organizer?._id || m.organizer?.id || m.organizerId || m.createdBy?._id || m.createdBy?.id
        )?.toString() ?? null,
      }))
      .filter((m) => m.id && !isNaN(m.start) && !isNaN(m.end)); // keep only valid events

    if (role.toLowerCase() !== "user") {
      setEvents(meetings);
      return;
    }

    const now = new Date();
    setEvents(
      meetings.filter((m) => m.end >= now || (uid && m.organizerId === uid))
    );
  })();
}, []);


  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await refreshToken();
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveBooking = async () => {
    if (!canCreate(role)) {
      alert("You don't have permission to create meetings.");
      return;
    }

    if (newEvent.title && newEvent.start && newEvent.end) {
      const created = await createMeeting(newEvent);
      if (created) {
        setEvents([...events, created]);
        setShowForm(false);
        setNewEvent({
          title: "",
          start: new Date(),
          end: new Date(),
          room: meetingRooms[0].id,
        });
      }
    }
  };

  const onEventDrop = async ({ event, start, end }) => {
    if (start < new Date()) return;
    if (!canEdit(role)) {
      alert("You don't have permission to edit meetings.");
      return;
    }

    const updated = await updateMeeting(event.id, {
      ...event,
      startTime: start,
      endTime: end,
    });
    if (updated) {
      setEvents(
        events.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
      );
    }
  };

  const onEventResize = async ({ event, start, end }) => {
    if (start < new Date()) return;
    return onEventDrop({ event, start, end });
  };

  const handleDelete = async (eventId) => {
    if (!canDelete(role)) {
      alert("You don't have permission to delete meetings.");
      return;
    }
    const deleted = await deleteMeeting(eventId);
    if (deleted) {
      setEvents(events.filter((ev) => ev.id !== eventId));
      setSelectedEvent(null);
    }
  };

  const handleEdit = async (updatedEvent) => {
    if (!canEdit(role)) {
      alert("You don't have permission to edit meetings.");
      return;
    }
    const updated = await updateMeeting(updatedEvent.id, updatedEvent);
    if (updated) {
      setEvents(
        events.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
      setSelectedEvent(null);
    }
  };

  const filteredEvents =
    roomFilter === "all" ? events : events.filter((e) => e.room === roomFilter);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-white/90 border-b border-purple-200/50 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
                title="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="text-purple-600 hidden sm:block" size={24} />
                <div>
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-purple-700">
                    {format(selectedDate, "MMM yyyy")}
                  </h2>
                  <p className="text-xs text-gray-500 hidden sm:block">Meeting Room Calendar</p>
                </div>
              </div>
            </div>

            {/* Right Section - Desktop Actions */}
            <div className="hidden lg:flex gap-2 items-center flex-wrap">
              <RoomFilter
                roomFilter={roomFilter}
                setRoomFilter={setRoomFilter}
                meetingRooms={meetingRooms}
              />
              {/* <RoleSwitcher role={role} setRole={setRole} /> */}
              {canManageUsers(role) && (
                <button
                  onClick={() => setShowUsers(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium text-sm flex items-center gap-1"
                >
                  <Users size={16} />
                  <span className="hidden xl:inline">Manage Users</span>
                </button>
              )}
              {canCreate(role) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium text-sm flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>Create</span>
                </button>
              )}
              <button
                onClick={() => {
                  const confirmLogout = window.confirm(
                    "Are you sure you want to logout?"
                  );
                  if (confirmLogout) {
                    logout();
                  }
                }}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all hover:scale-105"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Right Section - Mobile/Tablet Actions */}
            <div className="flex lg:hidden gap-2 items-center">
              {canCreate(role) && (
                <button
                  onClick={() => setShowForm(true)}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
                >
                  <Plus size={18} />
                </button>
              )}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Filters Row */}
          {/* <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-1">
            <RoomFilter
              roomFilter={roomFilter}
              setRoomFilter={setRoomFilter}
              meetingRooms={meetingRooms}
            />
            <RoleSwitcher role={role} setRole={setRole} />
          </div> */}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl">
            <div className="p-4 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-purple-700">Menu</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {canManageUsers(role) && (
                <button
                  onClick={() => {
                    setShowUsers(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium text-sm flex items-center gap-2"
                >
                  <Users size={18} />
                  Manage Users
                </button>
              )}
              {(role === "Owner" || role === "Admin") && (
                <button
                  onClick={() => {
                    window.location.href = "/analytics";
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md font-medium text-sm flex items-center gap-2"
                >
                  <BarChart3 size={18} />
                  View Analytics
                </button>
              )}
              <button
                onClick={() => {
                  const confirmLogout = window.confirm(
                    "Are you sure you want to logout?"
                  );
                  if (confirmLogout) {
                    logout();
                  }
                }}
                className="w-full bg-red-100 text-red-600 px-4 py-3 rounded-lg hover:bg-red-200 transition-all font-medium text-sm flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Collapsible on mobile/tablet */}
        <div className={`
          ${showSidebar ? 'block' : 'hidden'}
          lg:block
          fixed lg:relative
          inset-y-0 left-0
          z-30 lg:z-0
          w-64 sm:w-72 lg:w-80 md:w-80
          transform transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r border-purple-200/50
          bg-white
          shadow-xl lg:shadow-none
          overflow-y-auto
        `}>
          {/* Close button for mobile */}
          <div className="lg:hidden p-4 border-b border-purple-200 flex items-center justify-between">
            <h3 className="font-bold text-purple-700">Calendar Info</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              <X size={18} />
            </button>
          </div>

          <Heatmap
            selectedDate={selectedDate}
            getDayCount={(date) => getDayCount(events, date)}
          />

          {/* Analytics Button */}
          {(role === "Owner" || role === "Admin") && (
            <div className="w-full p-3 sm:p-4 lg:p-5 border-t border-purple-200/50">
              <button
                onClick={() => (window.location.href = "/analytics")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <BarChart3 size={20} />
                <span>View Analytics</span>
              </button>
          <div className="p-4 space-y-2 border-t border-purple-200/50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h4>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Total Meeting</p>
              <p className="text-2xl font-bold text-purple-700">{events.length}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Current View</p>
              <p className="text-lg font-bold text-green-700 capitalize">{view}</p>
            </div>
          </div>
            </div>
          )}

          {/* Quick Stats */}
        </div>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Calendar Area */}
        <div className="flex-1 p-2 sm:p-3 lg:p-4 overflow-hidden flex flex-col">
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-2 sm:p-3 lg:p-4 flex-1 overflow-hidden">
            <DnDCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              date={selectedDate}
              onNavigate={(date) => setSelectedDate(date)}
              views={[Views.DAY, Views.WEEK, Views.MONTH]}
              view={view}
              onView={(v) => setView(v)}
              style={{ height: "100%" }}
              onEventDrop={onEventDrop}
              resizable
              onEventResize={onEventResize}
              onSelectEvent={(event) => setSelectedEvent(event)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <BookingForm
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          setShowForm={setShowForm}
          handleSaveBooking={handleSaveBooking}
          meetingRooms={meetingRooms}
        />
      )}

      {selectedEvent && (
        <MeetingDetails
          event={selectedEvent}
          meetingRooms={meetingRooms}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
          role={role}
        />
      )}

      {showUsers && (
        <UserManagement
          users={users}
          setUsers={setUsers}
          onClose={() => setShowUsers(false)}
          role={role}
        />
      )}
    </div>
  );
}