import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

// ✅ IMPORTANT: use Vercel env or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const admin = JSON.parse(localStorage.getItem("logged_user") || "null");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  // ✅ if not admin -> redirect
  useEffect(() => {
    if (!admin?.email || admin.email !== "admin@gmail.com") {
      navigate("/login", { replace: true });
    }
  }, [admin, navigate]);

  const loadUsers = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await axios.get(`${API_BASE}/api/profiles`);
      setUsers(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load users ❌");
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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("logged_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-6xl mx-auto card-glass p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-pink-600">🛡️ Admin Dashboard</h2>
            <p className="text-gray-700">
              Admin: <b>{admin?.name || "Admin"}</b> ({admin?.email})
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadUsers(true)}
              className="btn-outline"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <button onClick={handleLogout} className="btn-primary">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white/70 border border-pink-100 rounded-2xl p-4 mb-5 flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-gray-800 font-bold">
            Total Users: {users.length}
            <div className="text-xs text-gray-600 font-normal">
              Search by name/email/phone/city/caste/religion
            </div>
          </div>

          <input
            className="input-soft md:ml-auto"
            placeholder="Search users..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-14 flex justify-center">
            <Loader text="Loading users..." />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-700">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <UserCard key={u._id} u={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UserCard = ({ u }) => {
  return (
    <div className="bg-white/70 border border-pink-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        {u.photo ? (
          <img
            src={u.photo}
            alt="user"
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-400"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-600 font-extrabold text-xl">
            {u.name?.[0] || "U"}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-extrabold text-gray-900 truncate">{u.name || "-"}</p>
          <p className="text-sm text-gray-700 truncate">{u.email || "-"}</p>
        </div>
      </div>

      <div className="text-sm text-gray-800 space-y-1">
        <p><b>Phone:</b> {u.phone || "-"}</p>
        <p><b>City:</b> {u.city || "-"}</p>
        <p><b>Gender:</b> {u.gender || "-"}</p>
        <p><b>Age:</b> {u.age || "-"}</p>
        <p><b>Religion:</b> {u.religion || "-"}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;