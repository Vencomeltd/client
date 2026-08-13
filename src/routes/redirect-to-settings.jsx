import { Navigate } from "react-router-dom";

export default function RedirectToSettings() {
  return <Navigate to="/settings" replace />;
}
