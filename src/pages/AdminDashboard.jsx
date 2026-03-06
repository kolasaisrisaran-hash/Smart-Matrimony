import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const API_BASE = getApiBase();

  const user = useSelector((state) => state.auth.user);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profiles`);
      setProfiles(res.data || []);
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert("Failed to load users ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/api/profiles/${id}`);
      alert("User deleted ✅");
      setProfiles((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert(err?.response?.data?.message || "Delete failed ❌");
    }
  };

  const toggleStatus = async (p) => {
    const newStatus = (p.status || "active") === "active" ? "blocked" : "active";
    const ok = confirm(`Change status to "${newStatus}" ?`);
    if (!ok) return;

    try {
      const res = await axios.patch(`${API_BASE}/api/profiles/${p._id}/status`, {
        status: newStatus,
      });

      alert(res.data.message);
      setProfiles((prev) =>
        prev.map((x) => (x._id === p._id ? { ...x, status: newStatus } : x))
      );
    } catch (err) {
      console.log(err?.response?.data || err?.message);
      alert(err?.response?.data?.message || "Status update failed ❌");
    }
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;

    return profiles.filter((p) => {
      const hay = `${p.name || ""} ${p.email || ""} ${p.phone || ""} ${
        p.city || ""
      } ${p.caste || ""} ${p.religion || ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [profiles, q]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-pink-600">
              🛡️ Admin Dashboard
            </h2>
            <p className="text-gray-700">
              Admin: <b>{user?.name || "Admin"}</b> ({user?.email})
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={loadProfiles} className="btn-outline">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="btn-primary">
              Logout
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/70 border border-pink-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="text-gray-800 font-semibold">
              Total Users: {profiles.length}
            </p>
            <p className="text-gray-700 text-sm">
              Search by name/email/phone/city/caste/religion
            </p>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users..."
            className="input-soft md:w-80"
          />
        </div>

        {/* Users list */}
        {loading ? (
          <p className="text-center text-gray-700">Loading users...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-700">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const status = p.status || "active";
              const isBlocked = status === "blocked";

              // ✅ prevent deleting the currently logged-in admin user
              const isSelfAdmin = p.email === user?.email;

              return (
                <div
                  key={p._id}
                  className="bg-white/70 border border-pink-100 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {p.photo ? (
                        <img
                          src={p.photo}
                          alt="profile"
                          className="w-12 h-12 rounded-full object-cover border-2 border-pink-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600">
                          {p.name?.[0] || "U"}
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-gray-900">{p.name || "-"}</p>
                        <p className="text-sm text-gray-700">{p.email || "-"}</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isBlocked
                          ? "border-red-300 text-red-600 bg-red-50"
                          : "border-green-300 text-green-700 bg-green-50"
                      }`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-800 space-y-1">
                    <p><b>Phone:</b> {p.phone || "-"}</p>
                    <p><b>City:</b> {p.city || "-"}</p>
                    <p><b>Gender:</b> {p.gender || "-"}</p>
                    <p><b>Age:</b> {p.age ?? "-"}</p>
                    <p><b>Religion:</b> {p.religion || "-"}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`w-full px-4 py-2 rounded-full font-semibold transition border ${
                        isBlocked
                          ? "border-green-300 text-green-700 hover:bg-green-50"
                          : "border-red-300 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {isBlocked ? "Unblock" : "Block"}
                    </button>

                    <button
                      onClick={() => navigate(`/admin/profile/${p._id}`)}
                      className="btn-outline w-full"
                    >
                      View
                    </button>

                    <button
                      disabled={isSelfAdmin}
                      onClick={() => handleDelete(p._id)}
                      className={`w-full px-4 py-2 rounded-full border font-semibold transition ${
                        isSelfAdmin
                          ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "border-red-300 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      Delete
                    </button>
                  </div>

                  {isSelfAdmin && (
                    <p className="text-xs text-gray-600 mt-2">
                      ✅ You can’t delete your own admin account
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;