import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/NewAuthContext";

/**
 * ProtectedRoute component
 * - Blocks access to routes unless a user is authenticated
 * - Optionally restricts access to specific roles via allowedRoles
 * - Redirects unauthenticated users to /user-login and preserves the "from" location
 * - Redirects authenticated users to their role-specific dashboard if they access a route for another role
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectUnauthenticatedTo = "/user-login" }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show a simple loading state while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login, preserving the attempted URL
  if (!user) {
    return <Navigate to={redirectUnauthenticatedTo} replace state={{ from: location }} />;
  }

  // Normalize role ('customer' -> 'user') for front-end routing
  const roleRaw = user?.role || user?.type;
  const role = roleRaw === "customer" ? "user" : roleRaw;

  const getLandingForRole = (r) => {
    switch (r) {
      case "user":
        return "/user-dashboard";
      case "technician":
        return "/technician-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/user-login";
    }
  };

  // If route is restricted to specific roles and user's role isn't allowed, redirect to their landing
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getLandingForRole(role)} replace />;
  }

  // Authorized: render the protected content
  return children;
};

export default ProtectedRoute;