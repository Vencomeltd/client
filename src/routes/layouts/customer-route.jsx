import { Outlet } from "react-router-dom";
import { CustomerRoute } from "../../components/ProtectedRoute";

export default function CustomerRouteLayout() {
  return (
    <CustomerRoute>
      <Outlet />
    </CustomerRoute>
  );
}
