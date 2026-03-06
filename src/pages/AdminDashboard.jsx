import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

// ✅ Works for localhost + vercel (VITE_API_URL set in Vercel)
const getApiBase = () => {
  return import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "http://localhost:5000";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const API_BASE = getApiBase();

  const admin = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const res = await axios.get(`${API_BASE}/api/profiles`);
      const list = res.data || [];
      setUsers(list);
    } catch (err) {
      alert("Failed to load users ❌");
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;

    return users.filter((u) => {
      const hay = `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.city || ""} ${
        u.caste || ""
      } ${u.religion || ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [users, q]);

  const deleteUser = async (id) => {
    const ok = confirm("Delete this user? ❌");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/api/profiles/${id}`);
      alert("User deleted ✅");
      loadUsers(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed ❌");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/api/profiles/${id}/status`, { status });
      alert(`User ${status} ✅`);
      loadUsers(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Status update failed ❌");
    }
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-6xl mx-auto card-glass p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-pink-600">🛡 Admin Dashboard</h2>
            <p className="text-gray-700">
              Admin: <b>{admin?.name || "Admin"}</b> ({admin?.email || "-"})
            </p>
          </div>

          <div className="flex gap-3">
            <button className="btn-outline" onClick={() => loadUsers(true)} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>

            <button
              className="btn-primary"
              onClick={() => {
                localStorage.removeItem("logged_user");
                localStorage.removeItem("matrimony_profile");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search + stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-3 bg-white/60 border border-pink-100 rounded-2xl p-4">
            <p className="text-gray-900 font-extrabold">Total Users: {users.length}</p>
            <p className="text-gray-600 text-sm">
              Search by name/email/phone/city/caste/religion
            </p>
          </div>

          <div className="md:col-span-9">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users..."
              className="input-soft"
            />
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader text="Loading users..." />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-700 font-semibold py-10">No users found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((u) => (
                <div key={u._id} className="bg-white/70 border border-pink-100 rounded-2xl p-5">
                  {/* Top */}
                  <div className="flex items-center gap-3">
                    {u.photo ? (
                      <img
                        src={u.photo}
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover border-2 border-pink-400"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-extrabold text-xl">
                        {u.name?.[0] || "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-lg font-extrabold text-gray-900 truncate">{u.name || "-"}</p>
                      <p className="text-gray-700 truncate">{u.email || "-"}</p>
                      <p className="text-sm">
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            (u.status || "active") === "blocked" ? "text-red-600" : "text-green-700"
                          }`}
                        >
                          {u.status || "active"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 text-sm text-gray-800 space-y-1">
                    <p><b>Phone:</b> {u.phone || "-"}</p>
                    <p><b>City:</b> {u.city || "-"}</p>
                    <p><b>Gender:</b> {u.gender || "-"}</p>
                    <p><b>Age:</b> {u.age || "-"}</p>
                    <p><b>Religion:</b> {u.religion || "-"}</p>
                  </div>

                  {/* ✅ ACTION BUTTONS (idhe missing earlier) */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      className="btn-outline"
                      onClick={() => navigate(`/admin/profile/${u._id}`)}
                    >
                      👤 View
                    </button>

                    <button
                      className="btn-outline"
                      onClick={() => navigate(`/admin/profile/${u._id}/edit`)}
                    >
                      ✏️ Edit
                    </button>

                    {(u.status || "active") === "blocked" ? (
                      <button
                        className="btn-primary"
                        onClick={() => updateStatus(u._id, "active")}
                      >
                        ✅ Unblock
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => updateStatus(u._id, "blocked")}
                      >
                        🚫 Block
                      </button>
                    )}

                    <button
                      className="btn-outline"
                      onClick={() => deleteUser(u._id)}
                      style={{ borderColor: "rgba(239,68,68,0.35)", color: "#dc2626" }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;