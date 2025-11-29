import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // If admin is required but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If login is required but user is not logged in, redirect to home
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}