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
  // Admin also needs into host-only pages like EditSpace.jsx, since that's
  // reused as admin's full listing editor rather than duplicated.
  if (!user?.isHost && !user?.isAdmin) return <Navigate to="/customer/dashboard" replace />;
  return children;
}

export function CustomerRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  // Hosts can also browse and book spaces as a customer (they already reach
  // /property/:id and checkout unblocked) — so they need access to their own
  // customer dashboard/booking history too, not just the host dashboard.
  return children;
}

export function AdminRoute({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}
