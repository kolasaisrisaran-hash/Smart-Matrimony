import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  // ✅ change this admin email if needed
  const isAdmin = user?.email === "admin@gmail.com";

  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;