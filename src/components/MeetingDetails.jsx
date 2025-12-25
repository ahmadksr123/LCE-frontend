import React, { useEffect } from "react";
import { Calendar as CalendarIcon, X, Pencil, Trash2, User, Building2 } from "lucide-react";
import { format } from "date-fns";
import { canDelete, canEdit } from "../utils/permissions";

export default function MeetingDetails({
  event,
  meetingRooms,
  onClose,
  onDelete,
  onEdit,
  role,
  userName,
  organization,
}) {
  // ✅ prevent background scroll while modal is open (matches BookingForm behavior)
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

  const roomName =
    meetingRooms?.find((r) => r.name === event.room)?.name || event.room || "—";

  const startDate = event?.start ? new Date(event.start) : null;
  const endDate = event?.end ? new Date(event.end) : null;

  const durationMins =
    startDate && endDate
      ? Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
      : null;

  // ✅ Organizer name and organization from the funation passing as a prob
  const organizerName = userName || event.organizer?.userName || "—";
  const organizationName =
    organization || event.organizer?.organization || "—";

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
                Meeting Details
              </h2>
              <p className="text-xs text-gray-500">
                Review schedule, organizer, and room info
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
              <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                {event?.title || "—"}
              </p>
            </div>

            {/* ✅ Organizer / Organization */}
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
                  <p className="text-xs font-semibold text-gray-600">ORGANIZATION</p>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                  {organizationName}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <p className="text-xs font-semibold text-gray-600">ROOM</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{roomName}</p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3">
                <p className="text-xs font-semibold text-gray-600">DURATION</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {durationMins !== null ? `${durationMins} min` : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-600">START</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {startDate ? format(startDate, "PPpp") : "—"}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                <p className="text-xs font-semibold text-gray-600">END</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {endDate ? format(endDate, "PPpp") : "—"}
                </p>
              </div>

              {/* ✅ Optional: description if available */}
              {event?.description && (
                <div className="rounded-xl border border-purple-100 bg-white px-3 py-3 sm:col-span-2">
                  <p className="text-xs font-semibold text-gray-600">DESCRIPTION</p>
                  <p className="mt-1 text-sm text-gray-900 break-words">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-purple-200/60 bg-white px-4 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-purple-100 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-all"
          >
            Close
          </button>

          {canEdit(role) && (
            <button
              onClick={() => onEdit({ ...event, title: event.title + " (Edited)" })}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}

          {canDelete(role) && (
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
