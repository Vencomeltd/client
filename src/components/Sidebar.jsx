import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const Sidebar = ({ user, onLinkClick }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const sections = [
    { name: "Personal Information", path: "/settings/personal" },
    { name: "Privacy", path: "/settings/privacy" },
    { name: "Payments", path: "/settings/payments" },
  ];

  if (!user?.isHost) {
    sections.push({ name: "Payout", path: "/settings/payout" });
  }

  const handleLogout = async () => {
    try {
      await apiFetch({
        endpoint: "/auth/logout",
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    localStorage.removeItem("vencome_token");
    localStorage.removeItem("vencome_refresh");
    localStorage.removeItem("vencome_user");
    onLinkClick?.();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="w-64 h-screen border-r fixed top-16 md:top-0 left-0 p-4 sm:block bg-white">
      {sections.map((section) => (
        <Link
          key={section.path}
          to={section.path}
          onClick={onLinkClick}
          className={`block py-2 px-4 rounded-lg mb-2 ${
            pathname === section.path
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {section.name}
        </Link>
      ))}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full text-left py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 transition mt-4 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
