import { Outlet } from "react-router-dom";
import { HostRoute } from "../../components/ProtectedRoute";

export default function HostRouteLayout() {
  return (
    <HostRoute>
      <Outlet />
    </HostRoute>
  );
}
