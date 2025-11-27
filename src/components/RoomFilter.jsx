import React from "react";

export default function RoomFilter({ roomFilter, setRoomFilter, meetingRooms }) {
  return (
    <select
      value={roomFilter}
      onChange={(e) => setRoomFilter(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="all">All Rooms</option>
      {meetingRooms.map((room) => (
        <option key={room.id} value={room.name}>
          {room.name}
        </option>
      ))}
      {/* <option value="my-meetings">My Meetings</option> */}
    </select>
  );
}
