import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth.user);
  const storedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const user = reduxUser || storedUser;

  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user?._id) return;

    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const fetchUnreadCount = async () => {
    try {
      if (!user?._id) return;

      const res = await axios.get(`${API_BASE}/api/messages/unread/${user._id}`);

      const total = (res.data || []).reduce(
        (sum, item) => sum + (item.count || 0),
        0
      );

      setTotalUnread(total);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  const profileFields = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "dob", label: "Date of Birth" },
      { key: "age", label: "Age" },
      { key: "height", label: "Height" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "motherTongue", label: "Mother Tongue" },
      { key: "religion", label: "Religion" },
      { key: "caste", label: "Caste" },
      { key: "education", label: "Education" },
      { key: "occupation", label: "Occupation" },
      { key: "income", label: "Income" },
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "city", label: "City" },
      { key: "phone", label: "Phone" },
      { key: "about", label: "About" },
      { key: "photo", label: "Photo" },
      { key: "email", label: "Email" },
    ],
    []
  );

  const filledFields = profileFields.filter((field) => {
    const value = user?.[field.key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  const completionPercent = user
    ? Math.round((filledFields.length / profileFields.length) * 100)
    : 0;

  const missingFields = profileFields
    .filter((field) => {
      const value = user?.[field.key];
      return value === undefined || value === null || String(value).trim() === "";
    })
    .map((field) => field.label)
    .slice(0, 4);

  const completionColor =
    completionPercent >= 80
      ? "from-pink-500 to-purple-500"
      : completionPercent >= 50
      ? "from-pink-400 to-rose-400"
      : "from-gray-400 to-gray-500";

  if (!user) {
    return (
      <div className="page-fade min-h-screen flex items-center justify-center bg-pink-100 px-4">
        <div className="card-glass p-6 w-full max-w-md text-center">
          <p className="text-lg font-semibold mb-4">
            Session expired. Please login again.
          </p>
          <button onClick={() => navigate("/login")} className="btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("logged_user");
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/register", { state: { mode: "edit", data: user } });
  };

  return (
    <div className="page-fade min-h-screen bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-glass p-8 lg:col-span-2">
          <h2 className="text-3xl font-extrabold text-center text-pink-600 mb-6">
            Welcome, {user.name || "User"} 💖
          </h2>

          {user.photo ? (
            <div className="flex justify-center mb-6">
              <img
                src={user.photo}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-pink-500 shadow-lg"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-pink-100 border-4 border-pink-300 flex items-center justify-center text-pink-600 text-3xl font-extrabold">
                {user.name?.[0] || "U"}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <Info label="Email" value={user.email} />
            <Info label="Phone" value={user.phone} />
            <Info label="City" value={user.city} />
            <Info label="Gender" value={user.gender} />
            <Info label="Age" value={user.age} />
            <Info label="Religion" value={user.religion} />
            <Info label="Occupation" value={user.occupation} />
            <Info label="Status" value={(user.status || "active").toUpperCase()} />
          </div>

          <div className="mt-8 space-y-3">
            <button onClick={() => navigate("/matches")} className="btn-primary w-full">
              💞 Open Matches
            </button>

            <button onClick={() => navigate("/interests")} className="btn-outline w-full">
              ❤️ Interests
            </button>

            <button onClick={() => navigate("/chat")} className="btn-outline w-full">
              {totalUnread > 0 ? `💬 Chats 🔴 ${totalUnread}` : "💬 Chats"}
            </button>

            <button onClick={handleEditProfile} className="btn-outline w-full">
              ✏️ Edit Profile
            </button>

            <button
              onClick={() => navigate("/change-password")}
              className="btn-outline w-full"
            >
              🔐 Change Password
            </button>

            <button onClick={handleLogout} className="btn-primary w-full">
              Logout
            </button>
          </div>
        </div>

        <div className="card-glass p-6 h-fit">
          <h3 className="text-xl font-extrabold text-pink-600 mb-4">
            Profile Completion
          </h3>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Completed
            </span>
            <span className="text-lg font-extrabold text-pink-600">
              {completionPercent}%
            </span>
          </div>

          <div className="w-full bg-white/70 rounded-full h-4 overflow-hidden border border-pink-100">
            <div
              className={`h-4 rounded-full bg-gradient-to-r ${completionColor} transition-all duration-500`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Complete your profile to improve trust and get better matches.
          </p>

          {missingFields.length > 0 && (
            <div className="mt-5 bg-white/70 border border-pink-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-pink-700 mb-2">
                Complete these fields:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleEditProfile}
            className="btn-outline w-full mt-5"
          >
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white/70 border border-pink-100 rounded-xl p-3">
    <p className="text-sm text-pink-700 font-semibold">{label}</p>
    <p className="text-gray-800">{value || "-"}</p>
  </div>
);

export default Dashboard;