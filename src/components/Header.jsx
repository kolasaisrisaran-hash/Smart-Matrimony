import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import axios from "axios";

const getApiBase = () => {
  const host = window.location.hostname;
  return host === "localhost" ? "http://localhost:5000" : `http://${host}:5000`;
};

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const API_BASE = getApiBase();

  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const storedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const finalUser = user || storedUser;

  const isAdmin = finalUser?.email === "admin@gmail.com";

  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("logged_user");
    setPendingCount(0);
    navigate("/login");
  };

  useEffect(() => {
    let timer;

    const loadPending = async () => {
      try {
        if (!finalUser?._id) return;

        const res = await axios.get(
          `${API_BASE}/api/interests/inbox/${finalUser._id}`
        );

        const list = res.data || [];
        const pending = list.filter((it) => it.status === "pending").length;
        setPendingCount(pending);
      } catch {
        // ignore header errors
      }
    };

    if (finalUser?._id) {
      loadPending();
      timer = setInterval(loadPending, 10000);
    } else {
      setPendingCount(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [API_BASE, finalUser?._id]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/home" className="font-extrabold text-xl text-pink-600">
          💍 Smart Matrimony
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/home"
            className="px-3 py-2 rounded-lg text-gray-700 hover:bg-pink-50 transition"
          >
            Home
          </Link>

          {!isAuth && !storedUser ? (
            <>
              <Link
                to="/register"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-pink-50 transition"
              >
                Register
              </Link>

              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:scale-105 transition"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-pink-50 transition"
              >
                Dashboard
              </Link>

              <Link
                to="/matches"
                className="px-3 py-2 rounded-lg text-gray-700 hover:bg-pink-50 transition"
              >
                Matches
              </Link>

              <Link
                to="/interests"
                className="relative px-3 py-2 rounded-lg text-gray-700 hover:bg-pink-50 transition"
              >
                Interests
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 font-semibold hover:bg-pink-100 transition"
                >
                  Admin
                </Link>
              )}

              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-pink-50 border border-pink-100">
                <span className="text-sm font-semibold text-pink-700 truncate max-w-[120px]">
                  {finalUser?.name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-white border border-pink-300 text-pink-600 font-semibold hover:bg-pink-50 transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;