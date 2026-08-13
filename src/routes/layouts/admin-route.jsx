import { Outlet } from "react-router-dom";
import { AdminRoute } from "../../components/ProtectedRoute";

export default function AdminRouteLayout() {
  return (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  );
}
