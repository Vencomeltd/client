import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

export function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function HostRoute({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isHost) return <Navigate to="/customer/dashboard" replace />;
  return children;
}

export function CustomerRoute({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.isHost) return <Navigate to="/dashboard" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return children;
}
