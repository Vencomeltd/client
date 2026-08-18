import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function PrivateRoute({
  children,
  requireHost = false,
  requireAdmin = false,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Navigate's internal effect re-fires whenever `state` changes by
  // reference (it's in that effect's dependency array), so a fresh object
  // literal here on every render kept re-triggering navigate() while the
  // redirect was in flight -- causing a render loop. Keep it stable across
  // re-renders unless the path actually changes.
  const redirectState = useMemo(() => ({ from: location.pathname }), [location.pathname]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={redirectState} replace />;
  }

  if (requireHost && !user.isHost) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
