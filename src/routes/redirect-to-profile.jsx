import { Navigate } from "react-router-dom";

export default function RedirectToProfile() {
  return <Navigate to="/profile" replace />;
}
