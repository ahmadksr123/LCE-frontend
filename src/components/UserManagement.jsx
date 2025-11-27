// src/components/UserManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Lock, User, Shield, Building2, Trash2 } from "lucide-react";
// import { uid } from "../utils/uid";

export default function UserManagement({ users, setUsers, onClose }) {
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    cardId: "",
    organization: "",
    role: "User",
    password: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(null); // userId or null
  const [passwordInput, setPasswordInput] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // { [userId]: boolean }

  // base axios instance (optional) and send the JWT token if stored in localStorage in header
  const api = axios.create({
    baseURL: "http://localhost:5000/api/signup", // matches your app.use("/api/signup", signupRouter)
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  // fetch users from backend and normalize shape
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/");
      console.log("Fetched users:", res);
      const data = res.data.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        cardId: u.cardID || u.cardId || "",
        organization: u.organization || "",
        role: u.role || "User",
        active:
          u.isActive !== undefined
            ? u.isActive
            : u.active !== undefined
            ? u.active
            : true,
        createdAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString()
          : "",
      }));
      // remove the user themselves from the list
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser?.id) {
        setUsers(data.filter((u) => u.id !== currentUser.id));
      } else {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add user -> use POST /api/signup/signup (your router currently uses router.post("/signup"...))
  const addUser = async () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.cardId ||
      !newUser.organization ||
      !newUser.password
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setActionLoading((s) => ({ ...s, add: true }));
      await api.post("/create", {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        cardID: newUser.cardId, // server expects cardID (capital D) in your code
        organization: newUser.organization,
        role: newUser.role,
        isActive: true,
      });

      // refresh list (server's signup route returns only message currently)
      await fetchUsers();
      setNewUser({
        name: "",
        email: "",
        cardId: "",
        organization: "",
        role: "User",
        password: "",
      });
    } catch (err) {
      console.error("Add user failed:", err);
      alert(err?.response?.data?.error || "Failed to add user");
    } finally {
      setActionLoading((s) => ({ ...s, add: false }));
    }
  };

  // Update role or other fields -> PUT /api/signup/:id
  const updateRole = async (id, newRole) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.put(`/${id}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update role");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Optimistic toggle Active/Deactivate -> PUT /api/signup/:id with isActive
  const toggleActive = async (id) => {
    const prevUsers = [...users];
    const target = users.find((u) => u.id === id);
    if (!target) return;

    const newActive = !target.active;
    // optimistic UI
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: newActive } : u))
    );
    setActionLoading((s) => ({ ...s, [id]: true }));

    try {
      await api.put(`/${id}`, { isActive: newActive });
      // server success - state already updated
    } catch (err) {
      // revert
      setUsers(prevUsers);
      console.error("Failed to toggle active:", err);
      alert("Failed to update user status");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Reset password (admin) -> new admin route PUT /api/signup/:id/reset-password (provided in backend section)
  const resetPassword = async (id) => {
    if (!passwordInput || passwordInput.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.put(`/${id}/reset-password`, { newPassword: passwordInput });
      setShowPasswordModal(null);
      setPasswordInput("");
      alert("Password reset successfully");
    } catch (err) {
      console.error("Reset password failed:", err);
      alert(err?.response?.data?.error || "Failed to reset password");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.delete(`/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/95 p-6 rounded-xl shadow-2xl border border-purple-800/30 w-full max-w-[48rem] mx-4">
        <h2 className="text-2xl font-bold mb-6 text-purple-900">
          Admin – User Management
        </h2>

        {/* ➕ Add User Form */}
        <div className="flex flex-col flex-wrap sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="flex-1 px-4 py-2 border rounded focus:ring focus:ring-purple-300"
          />
          <input
            type="email"
            placeholder="Gmail address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="flex-1 px-4 py-2 border rounded focus:ring focus:ring-purple-300"
          />
          <input
            type="text"
            placeholder="Card ID"
            value={newUser.cardId}
            onChange={(e) => setNewUser({ ...newUser, cardId: e.target.value })}
            className="px-4 py-2 border rounded focus:ring focus:ring-purple-300"
          />
          <input
            type="text"
            placeholder="Organization Name"
            value={newUser.organization}
            onChange={(e) =>
              setNewUser({ ...newUser, organization: e.target.value })
            }
            className="px-4 py-2 border rounded focus:ring focus:ring-purple-300"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="px-3 py-2 border rounded bg-purple-50 text-purple-800"
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className="px-4 py-2 border rounded focus:ring focus:ring-purple-300"
          />
          <button
            onClick={addUser}
            disabled={!!actionLoading.add}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
          >
            {actionLoading.add ? "Adding..." : "Add"}
          </button>
        </div>

        {/* 👥 User Cards */}
        <div className="overflow-y-auto max-h-[60vh] grid gap-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading users...</div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
              >
                {/* Left: User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {u.name?.charAt(0)?.toUpperCase() ||
                      u.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {u.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    <p className="text-sm text-gray-500">Card ID: {u.cardId}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Building2 size={14} /> {u.organization}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {u.role === "Admin" ? (
                        <Shield size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      {u.role}
                    </p>
                    <p
                      className={`text-xs ${
                        u.active ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {u.active ? "Active" : "Inactive"} • Joined {u.createdAt}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end sm:flex-nowrap">
                  {/* Change Role */}
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="px-2 py-1 text-sm border rounded bg-purple-50 text-purple-800"
                    disabled={!!actionLoading[u.id]}
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>

                  {/* Activate / Deactivate */}
                  <button
                    onClick={() => toggleActive(u.id)}
                    disabled={!!actionLoading[u.id]}
                    className={`px-3 py-1 text-sm rounded ${
                      u.active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {actionLoading[u.id]
                      ? "Updating..."
                      : u.active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={() => setShowPasswordModal(u.id)}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
                    disabled={!!actionLoading[u.id]}
                  >
                    <Lock size={14} /> Reset
                  </button>

                  {/* Delete (optional) */}
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                    disabled={!!actionLoading[u.id]}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🔒 Reset Password Modal */}
        {showPasswordModal && (
          <div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
            onClick={(e) =>
              e.target === e.currentTarget && setShowPasswordModal(null)
            }
          >
            <div className="bg-white p-6 rounded-xl shadow-lg w-[22rem] border border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-3">
                Set New Password
              </h3>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border rounded mb-4 focus:ring focus:ring-purple-300"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPasswordModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resetPassword(showPasswordModal)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {actionLoading[showPasswordModal] ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-400/30 text-gray-900 rounded-lg hover:bg-gray-400/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
