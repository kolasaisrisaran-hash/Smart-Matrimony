import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxUser = useSelector((state) => state.auth.user);
  const storedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const user = reduxUser || storedUser;

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
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/register", { state: { mode: "edit", data: user } });
  };

  return (
    <div className="page-fade min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200 px-4 py-10">
      <div className="card-glass p-8 w-full max-w-xl">
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
          <Info label="Status" value={(user.status || "active").toUpperCase()} />
        </div>

        <div className="mt-8 space-y-3">
          {/* ✅ Matches */}
          <button onClick={() => navigate("/matches")} className="btn-primary w-full">
            💞 Open Matches
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