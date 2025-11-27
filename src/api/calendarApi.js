import axios from "axios";

const API_URL = "http://localhost:5000/api/meetings";
// const API_URL = "https://lce-backend-bxn1.onrender.com/api/meetings";

// ✅ Fetch all meetings
export const fetchMeetings = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data.map((m) => ({
      id: m._id,
      title: m.title,
      start: new Date(m.startTime),
      end: new Date(m.endTime),
      room: m.room,
      organizer: m.organizer,
    }));
  } catch (err) {
    console.error("❌ Failed to fetch meetings:", err);
    return [];
  }
};

// ✅ Create a new meeting
export const createMeeting = async (event) => {
  try {
    const payload = {
      title: event.title,
      startTime: event.start,
      endTime: event.end,
      room: event.room,
    };
    const res = await axios.post(API_URL, payload);
    return {
      ...res.data,
      id: res.data._id,
      start: new Date(res.data.startTime),
      end: new Date(res.data.endTime),
      room: res.data.room,
    };
  } catch (err) {
    console.error("❌ Failed to create meeting:", err);
    alert(err.response?.data?.error || "Failed to create meeting");
    return null;
  }
};

// ✅ Update meeting
export const updateMeeting = async (id, updatedEvent) => {
  try {
    await axios.put(`${API_URL}/${id}`, updatedEvent);
    return updatedEvent;
  } catch (err) {
    console.error("❌ Failed to update meeting:", err);
    alert("Failed to update meeting time.");
    return null;
  }
};

// ✅ Delete meeting
export const deleteMeeting = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to delete meeting:", err);
    return false;
  }
};
