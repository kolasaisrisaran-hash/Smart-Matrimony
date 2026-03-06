import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ADMIN_EMAILS = [
  "admin@gmail.com",
  "admin@gmail.com",
  "admin@gmail.com",
  "admin@gmail.com",
  // ✅ mee real admin email ikkadiki add cheyyi:
  // "admin@gmail.com",
];

const AdminRoute = ({ children }) => {
  const reduxUser = useSelector((state) => state.auth.user);

  // ✅ fallback: refresh ayithe redux empty avvochu
  const localUser = JSON.parse(localStorage.getItem("logged_user") || "null");

  const user = reduxUser || localUser;

  const email = (user?.email || "").toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(email);

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;