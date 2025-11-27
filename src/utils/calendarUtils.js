import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { dateFnsLocalizer } from "react-big-calendar";

export const locales = { "en-US": enUS };
export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export const meetingRooms = [
  { id: "room A", name: "Room A", color: "#8e24aa" },
  { id: "room B", name: "Room B", color: "#3949ab" },
  { id: "room C", name: "Room C", color: "#00897b" },
  { id: "room D", name: "Room D", color: "#f4511e" },
  { id: "room E", name: "Room E", color: "#df74d5" },
  { id: "room F", name: "Room F", color: "#3949ab" },
  { id: "room G", name: "Room G", color: "#00897b" },
  { id: "room H", name: "Room H", color: "#f4511e" },
];
function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || user?._id;
  }

// ✅ Calendar Event Styling
export const eventStyleGetter = (event) => {
  const room = meetingRooms.find((r) => r.name === event.room);
  const isPast = event.end < new Date();
  const isUserMeeting = event.organizer._id === getCurrentUserId(); // Implement this function based on your auth logic

    if (isUserMeeting) {
        return {
            style: {
                backgroundColor: room ? room.color : "#9c27b0",
                color: "white",
                borderRadius: "6px",
                padding: "2px 6px",
                border: "2px solid red", // Highlight with a yellow border
                fontSize: "0.85rem",
                opacity: isPast ? 0.5 : 1,
            },
        };
    }


  return {
    style: {
      backgroundColor: room ? room.color : "#9c27b0",
      color: "white",
      borderRadius: "6px",
      padding: "2px 6px",
      border: "none",
      fontSize: "0.85rem",
      opacity: isPast ? 0.5 : 1,
    },
  };
};

// ✅ Day Count for Heatmap
export const getDayCount = (events, date) =>
  events.filter((e) => format(e.start, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")).length;
