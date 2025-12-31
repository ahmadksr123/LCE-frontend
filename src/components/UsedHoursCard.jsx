// UsedHoursCard.jsx
import React, { useMemo } from "react";
import { Clock, Timer, CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function UsedHoursCard({
  nowTime,
  formatHours,
  myMonthUsedMs,
  myMeetingsThisMonthCount,
  myMeetingsCount,
  showOnlyMine,
  setShowOnlyMine,
  role,
}) {
  const { hh, mm } = useMemo(() => {
    const totalMin = Math.max(0, Math.round(myMonthUsedMs / 60000));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return { hh: String(h).padStart(2, "0"), mm: String(m).padStart(2, "0") };
  }, [myMonthUsedMs]);

  const isUser = String(role || "").toLowerCase() === "user";

  return (
    <div className="px-3 mt-1 sm:px-4 pb-4">
      <div className="rounded-2xl border border-purple-200/60 bg-white shadow-sm overflow-hidden">
        {/* Header strip */}
        <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-purple-700">
                Your Activity
              </p>
              <p className="mt-0.5 text-[12px] text-gray-500 leading-snug">
                Based on meetings you created
              </p>
            </div>

            {/* Icon bubble */}
            <div className="shrink-0 h-11 w-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-[0_6px_18px_rgba(124,58,237,0.18)]">
              <Clock size={22} />
            </div>
          </div>

          {/* Big time */}
          <div className="mt-1">
            <p className="text-[10px] font-bold tracking-[0.22em] text-purple-600">
              LIVE TIME
            </p>

            <div className="mt-1 flex items-end gap-2">
              <div className="font-mono font-black text-purple-700 leading-none text-[40px]">
                {format(nowTime, "HH:mm")}
              </div>
              <div className="font-mono font-extrabold text-purple-500 leading-none text-[22px] pb-1">
                :{format(nowTime, "ss")}
              </div>
            </div>

            <p className="mt-1 text-[12px] text-gray-500">
              {format(nowTime, "EEE, dd MMM yyyy")}
            </p>
          </div>

          {/* Toggle (only for role user) */}
          {isUser && typeof setShowOnlyMine === "function" && (
            <button
              type="button"
              onClick={() => setShowOnlyMine((v) => !v)}
              className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm font-semibold transition flex items-center justify-between
                ${
                  showOnlyMine
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Only my meetings
              </span>
              <span
                className={`h-5 w-9 rounded-full relative transition ${
                  showOnlyMine ? "bg-white/30" : "bg-purple-100"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full transition ${
                    showOnlyMine
                      ? "left-4 bg-white"
                      : "left-0.5 bg-purple-600"
                  }`}
                />
              </span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="p-2 grid grid-cols-2 gap-3">
          {/* This month hours */}
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Timer size={16} className="text-purple-600" />
              <p className="text-[12px] font-semibold">This month</p>
            </div>

            <div className=" leading-none">
              <div className="text-[28px] font-extrabold text-purple-700">
                {hh}
                <span className="text-purple-400">h</span>{" "}
                {mm}
                <span className="text-purple-400">m</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Hours used 
              </p>
            </div>
          </div>

          {/* Meetings */}
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-2">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays size={16} className="text-purple-600" />
              <p className="text-[12px] font-semibold">Meetings</p>
            </div>

            <div className="mt-2 leading-none">
              <div className="text-[30px] font-extrabold text-purple-700">
                {myMeetingsThisMonthCount}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                This month • {myMeetingsCount} total created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
