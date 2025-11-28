// src/components/UserManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import api from "../components/axiosInstance"; // Make sure this path is correct
import {
  Shield,
  User,
  Building2,
  Trash2,
  Lock,
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Filter,
} from "lucide-react";

export default function UserManagement({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    cardId: "",
    organization: "",
    role: "User",
    password: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // const api = axios.create({
  //   baseURL: "http://localhost:5000/api/signup",
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //   },
  // });
  // const api = apis.defaults.baseURL + "/api/signup";
  // console.log("API Base URL:", api);
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/signup/");
      
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const formatted = res.data
        .map((u) => ({
          id: u._id,
          name: u.name || "Unknown",
          email: u.email,
          cardId: u.cardID || u.cardId || "N/A",
          organization: u.organization || "Not set",
          role: u.role || "User",
          active: u.isActive ?? true,
          createdAt: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown",
        }))
        .filter((u) => u.id !== currentUser.id); // Exclude self

      setUsers(formatted);
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cardId.includes(searchTerm);

      const matchesRole = filterRole === "All" || user.role === filterRole;
      const matchesStatus =
        filterStatus === "All" ||
        (filterStatus === "Active" && user.active) ||
        (filterStatus === "Inactive" && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Add User
  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.cardId || !newUser.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (newUser.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setActionLoading((s) => ({ ...s, add: true }));
    try {
      await api.post("/api/signup/create", {
        name: newUser.name.trim(),
        email: newUser.email.toLowerCase().trim(),
        password: newUser.password,
        cardID: newUser.cardId,
        organization: newUser.organization,
        role: newUser.role,
        isActive: true,
      });

      toast.success("User added successfully");
      setNewUser({
        name: "",
        email: "",
        cardId: "",
        organization: "",
        role: "User",
        password: "",
      });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to add user");
    } finally {
      setActionLoading((s) => ({ ...s, add: false }));
    }
  };

  // Update Role
  const updateRole = async (id, newRole) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.put(`/api/signup/${id}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error("Failed to update role");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: newStatus } : u))
    );

    try {
      await api.put(`/api/signup/${id}`, { isActive: newStatus });
      toast.success(newStatus ? "User activated" : "User deactivated");
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: currentStatus } : u))
      );
      toast.error("Failed to update status");
    }
  };

  // Reset Password
  const resetPassword = async (id) => {
    if (!passwordInput || passwordInput.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.put(`/api/signup/${id}/reset-password`, { newPassword: passwordInput });
      toast.success("Password reset successfully");
      setShowPasswordModal(null);
      setPasswordInput("");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to reset password");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.delete(`/api/signup/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
      setConfirmDelete(null);
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setActionLoading((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-200 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <h2 className="text-2xl font-bold">User Management</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-transparent hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-5 border-b bg-gray-50 flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or card ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border rounded-xl bg-white"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border rounded-xl bg-white"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={() => setShowAddForm(true)}
                className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 font-medium shadow-lg shadow-purple-500/30 transition"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/70 border border-gray-200 rounded-xl p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-300 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-300 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No users found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
  {filteredUsers.map((u) => (
    <div
      key={u.id}
      className="group relative bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 
                 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden
                 hover:-translate-y-1"
    >
      {/* Subtle gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Main Content */}
      <div className="relative p-6">
        {/* Avatar + Status Badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 
                            flex items-center justify-center text-white text-2xl font-bold 
                            shadow-xl ring-4 ring-white/50">
              {u.name.charAt(0).toUpperCase()}
            </div>
            {/* Online/Offline indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white 
                          ${u.active ? "bg-emerald-500" : "bg-gray-400"}`}
            />
          </div>

          {/* Role badge */}
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase
                        ${
                          u.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
          >
            {u.role}
          </span>
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {u.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">{u.email}</p>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="truncate">{u.organization}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 bg-gray-300 rounded border-2 border-dashed border-gray-400" />
            <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {u.cardId}
            </code>
          </div>
        </div>

        {/* Joined date */}
        <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <span>Joined {u.createdAt}</span>
        </p>
      </div>

      {/* Action Bar - Minimal & Clean */}
      <div className="relative bg-gray-50/70 border-t border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Role Switch */}
          <select
            value={u.role}
            onChange={(e) => updateRole(u.id, e.target.value)}
            disabled={!!actionLoading[u.id]}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white 
                       focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                       outline-none cursor-pointer hover:bg-gray-50 transition"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Toggle Active */}
            <button
              onClick={() => toggleActive(u.id, u.active)}
              disabled={!!actionLoading[u.id]}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                         flex items-center gap-1.5
                         ${
                           u.active
                             ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                             : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                         }`}
            >
              {actionLoading[u.id] ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : u.active ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Deactivate
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Activate
                </>
              )}
            </button>

            {/* Reset Password */}
            <button
              onClick={() => setShowPasswordModal(u.id)}
              className="p-2 bg-transparent rounded-lg hover:bg-gray-200/70 transition"
              title="Reset Password"
            >
              <Lock className="w-4 h-4 text-gray-500" />
            </button>

            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(u.id)}
              className="p-2 bg-transparent rounded-lg hover:bg-red-50 transition group"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Add New User</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Full Name *"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="text"
                placeholder="Card ID *"
                value={newUser.cardId}
                onChange={(e) => setNewUser({ ...newUser, cardId: e.target.value })}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="text"
                placeholder="Organization"
                value={newUser.organization}
                onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="px-4 py-3 border rounded-xl bg-white"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="password"
                placeholder="Password (min 8 chars) *"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 bg-transparent py-3 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addUser}
                disabled={actionLoading.add}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2"
              >
                {actionLoading.add ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reset Password</h3>
            <input
              type="password"
              placeholder="New password (min 8 characters)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(null);
                  setPasswordInput("");
                }}
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => resetPassword(showPasswordModal)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Delete User?</h3>
            <p className="text-gray-600 mb-8">
              This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 border rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}