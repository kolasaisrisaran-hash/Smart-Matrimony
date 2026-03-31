import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuth = useSelector((state) => state.auth.isAuthenticated);

  const storedUser = JSON.parse(localStorage.getItem("logged_user") || "null");
  const hasStoredUser = Boolean(storedUser?._id);

  if (isAuth || hasStoredUser) {
    return children;
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoute;