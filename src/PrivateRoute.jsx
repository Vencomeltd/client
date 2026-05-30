import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function PrivateRoute({
  children,
  requireHost = false,
  requireAdmin = false,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireHost && !user.isHost) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
