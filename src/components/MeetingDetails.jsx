import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { canDelete, canEdit } from "../utils/permissions";

export default function MeetingDetails({ event, meetingRooms, onClose, onDelete, onEdit, role }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-purple-800/30 w-full max-w-[24rem] mx-4">
        <h2 className="text-xl font-bold mb-4 text-purple-900 flex items-center">
          <CalendarIcon className="w-5 h-5 text-purple-600 mr-2" /> Meeting Details
        </h2>
        <div className="space-y-3">
          <p><span className="font-semibold">Title:</span> {event.title}</p>
          <p><span className="font-semibold">Room:</span> {meetingRooms.find((r) => r.name === event.room)?.name}</p>
          <p><span className="font-semibold">Start:</span> {format(event.start, "PPpp")}</p>
          <p><span className="font-semibold">End:</span> {format(event.end, "PPpp")}</p>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-400/30 text-gray-900 rounded-lg font-medium hover:bg-gray-400/50 transition-all"
          >
            Close
          </button>
          {canEdit(role) && (
            <button
              onClick={() => onEdit({ ...event, title: event.title + " (Edited)" })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
            >
              Edit
            </button>
          )}
          {canDelete(role) && (
            <button
              onClick={() => onDelete(event.id)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
