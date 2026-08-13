import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

// For public pages that rely on App.jsx's old outer <Navbar/> wrapping
// (i.e. not in the old hideNavbar list, and don't self-render their own
// Navbar) -- CategoryPage, HostProfile, HelpSupport. Keeps their behavior
// identical to today instead of losing the navbar under the new routing.
export default function PublicNavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
