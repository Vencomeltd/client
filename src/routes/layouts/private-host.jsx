import { Outlet } from "react-router-dom";
import PrivateRoute from "../../PrivateRoute";

export default function PrivateHostLayout() {
  return (
    <PrivateRoute requireHost>
      <Outlet />
    </PrivateRoute>
  );
}
