import React from "react";

export default function RoleSwitcher({ role, setRole }) {
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option value="Owner">Owner</option>
      <option value="Admin">Admin</option>
      <option value="User">User</option>
    </select>
  );
}
