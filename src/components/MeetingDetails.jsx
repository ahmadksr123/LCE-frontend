import React, { useMemo, useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  X,
  Pencil,
  Trash2,
  User,
  Building2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { canDelete, canEdit } from "../utils/permissions";

export default function MeetingDetails({
  event,
  meetingRooms,
  onClose,
  onDelete,
  onEdit,
  role,
}) {
  // ✅ prevent background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // ✅ close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // ✅ keep edit state in sync when user clicks a different event
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [editedEvent, setEditedEvent] = useState(() => ({
    ...event,
    title: event?.title || "",
    start: event?.start ? new Date(event.start) : new Date(),
    end: event?.end ? new Date(event.end) : new Date(),
  }));

  useEffect(() => {
    setIsEditing(false);
    setError("");
    setEditedEvent({
      ...event,
      title: event?.title || "",
      start: event?.start ? new Date(event.start) : new Date(),
      end: event?.end ? new Date(event.end) : new Date(),
    });
  }, [event]);

  const roomName =
    meetingRooms?.find((r) => r.name === event.room)?.name || event.room || "—";

  const startDate = useMemo(
    () => (event?.start ? new Date(event.start) : null),
    [event?.start]
  );
  const endDate = useMemo(
    () => (event?.end ? new Date(event.end) : null),
    [event?.end]
  );

  const durationMins =
    startDate && endDate
      ? Math.max(
          0,
          Math.round((endDate.getTime() - startDate.getTime()) / 60000)
        )
      : null;

  // ✅ organizer + organization (handles organization object or string)
  const organizerName =
    event?.organizer?.name ||
    event?.organizer?.fullName ||
    event?.organizerName ||
    "—";

  const organizationName =
    event?.organizer?.organization?.name || // organization object
    event?.organizer?.organizationName || // alt key
    (typeof event?.organizer?.organization === "string"
      ? event.organizer.organization
      : "") ||
    event?.organizationName ||
    "—";

  // ✅ meeting started?
  const hasStarted = useMemo(() => {
    if (!startDate) return false;
    return Date.now() >= startDate.getTime();
  }, [startDate]);

  // ✅ role based permission + time based lock
  // const canEditByRole = canEdit(role);
  // const canDeleteByRole = canDelete(role);

  const roleLower = String(role || "").toLowerCase();
  const isAdminLike = roleLower === "admin" || roleLower === "owner";

  // ✅ identify current user + meeting owner (organizer)
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.id || u?._id || null;
    } catch {
      return null;
    }
  }, []);

  const organizerId = useMemo(() => {
    const org = event?.organizer;
    if (!org) return null;
    if (typeof org === "string") return org;
    return org?._id || org?.id || null;
  }, [event]);

  const isOwnMeeting = Boolean(currentUserId && organizerId && currentUserId === organizerId);

  // ✅ time-to-start
  const timeToStartMs = useMemo(() => {
    if (!startDate) return null;
    return startDate.getTime() - Date.now();
  }, [startDate]);

  const FIVE_MIN_MS = 5 * 60 * 1000;

  // ✅ user rule:
  // - role="user" can edit/delete ONLY their own meeting
  // - only if meeting NOT started AND start is MORE THAN 5 minutes away
  const userAllowedWindow = timeToStartMs !== null && timeToStartMs > FIVE_MIN_MS;

  // ✅ final permissions:
  // - nobody can edit/delete after start (your rule stays)
  // - admin/owner: can edit/delete any meeting before start (including last 5 mins)
  // - user: can edit/delete ONLY own meeting, and only if > 5 mins remain
  const allowEdit =
    !hasStarted &&
    // canEditByRole &&
    (isAdminLike || (roleLower === "user" && isOwnMeeting && userAllowedWindow));

  const allowDelete =
    !hasStarted &&
    // canDeleteByRole &&
    (isAdminLike || (roleLower === "user" && isOwnMeeting && userAllowedWindow));
    // console.log("allowEdit, allowDelete:", allowEdit, allowDelete);
    // console.log("hasStarted, canDeleteByRole, isAdminLike, roleLower, isOwnMeeting, userAllowedWindow:", hasStarted, canEditByRole, isAdminLike, roleLower, isOwnMeeting, userAllowedWindow);

  // ✅ validation
  const validate = () => {
    setError("");
    const s = editedEvent?.start ? new Date(editedEvent.start) : null;
    const e = editedEvent?.end ? new Date(editedEvent.end) : null;

    if (!editedEvent.title?.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!s || !e) {
      setError("Start and End are required.");
      return false;
    }
    if (s >= e) {
      setError("End time must be after Start time.");
      return false;
    }
    if (s.getTime() <= Date.now()) {
      setError("You can't edit a meeting that has already started.");
      return false;
    }
    return true;
  };

  const handleSubmitEdit = () => {
    if (!validate()) return;

    const payload = {
      ...event,
      ...editedEvent,
      start: new Date(editedEvent.start),
      end: new Date(editedEvent.end),
      startTime: new Date(editedEvent.start),
      endTime: new Date(editedEvent.end),
      title: editedEvent.title?.trim()
    };

    onEdit(payload);
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-200/60 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-purple-200/60 bg-white/90 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-purple-700">
                {isEditing ? "Edit Meeting" : "Meeting Details"}
              </h2>
              <p className="text-xs text-gray-500">
                {hasStarted
                  ? "This meeting has started. Editing is locked."
                  : "Review schedule, organizer, and room info"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-purple-100 p-2 text-purple-700 hover:bg-purple-200 transition-all"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="space-y-4">
            {/* Title */}
            <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-3">
              <p className="text-xs font-semibold text-purple-700">TITLE</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.title}
                  onChange={(e) =>
                    setEditedEvent((p) => ({ ...p, title: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                  {event?.title || "—"}
                </p>
              )}
            </div>

            {/* Organizer / Organization */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-purple-700" />
                  <p className="text-xs font-semibold text-gray-600">ORGANIZER</p>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                  {organizerName}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-purple-700" />
                  <p className="text-xs font-semibold text-gray-600">
                    ORGANIZATION
                  </p>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                  {organizationName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <p className="text-xs font-semibold text-gray-600">ROOM</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {roomName}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <p className="text-xs font-semibold text-gray-600">DURATION</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {durationMins !== null ? `${durationMins} min` : "—"}
                </p>
              </div>

              {/* START */}
              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-600">START</p>
                {isEditing ? (
                  <DatePicker
                    selected={editedEvent.start ? new Date(editedEvent.start) : null}
                    onChange={(date) =>
                      setEditedEvent((p) => ({ ...p, start: date }))
                    }
                    showTimeSelect
                    timeIntervals={5}
                    dateFormat="Pp"
                    minDate={new Date()}
                    className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {startDate ? format(startDate, "PPpp") : "—"}
                  </p>
                )}
              </div>

              {/* END */}
              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-600">END</p>
                {isEditing ? (
                  <DatePicker
                    selected={editedEvent.end ? new Date(editedEvent.end) : null}
                    onChange={(date) =>
                      setEditedEvent((p) => ({ ...p, end: date }))
                    }
                    showTimeSelect
                    timeIntervals={5}
                    dateFormat="Pp"
                    minDate={
                      editedEvent.start
                        ? new Date(editedEvent.start)
                        : new Date()
                    }
                    className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
                  />
                ) : (
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {endDate ? format(endDate, "PPpp") : "—"}
                  </p>
                )}
              </div>

              {/* Optional description */}
              {event?.description && (
                <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-600">
                    DESCRIPTION
                  </p>
                  <p className="mt-1 text-sm text-gray-900 break-words">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-purple-200/60 bg-white px-4 py-4 sm:px-6">
          {!isEditing ? (
            <button
              onClick={onClose}
              className="rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-all"
            >
              Close
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setError("");
                setEditedEvent({
                  ...event,
                  title: event?.title || "",
                  start: event?.start ? new Date(event.start) : new Date(),
                  end: event?.end ? new Date(event.end) : new Date(),
                });
              }}
              className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          )}

          {/* ✅ EDIT / SAVE */}
          {allowEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}

          {allowEdit && isEditing && (
            <button
              onClick={handleSubmitEdit}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg"
            >
              <Pencil size={16} />
              Save Changes
            </button>
          )}

          {/* ✅ DELETE */}
          {allowDelete && !isEditing && (
            <button
              onClick={() => onDelete(event.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-all"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
