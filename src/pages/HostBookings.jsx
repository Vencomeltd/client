import React, { useState, useEffect } from "react";
import { Check, ClipboardList, X } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import VencomeLoader from "../components/Loader";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("vencome_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/host`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch host bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingAction = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      if (response.ok) fetchBookings();
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "confirmed") return b.status === "confirmed";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled" || b.status === "declined";
    return true;
  });

  const getStatusStyle = (status) => {
    if (status === "pending") return { background: "#FEF9C3", color: "#854D0E" };
    if (status === "confirmed") return { background: "#F0FDF4", color: "#166534" };
    if (status === "cancelled" || status === "declined") return { background: "#FEF2F2", color: "#991B1B" };
    if (status === "completed") return { background: "#F3F4F6", color: "#374151" };
    return { background: "#F3F4F6", color: "#374151" };
  };

  const tabs = [
    { key: "all", label: `All (${bookings.length})` },
    { key: "pending", label: `Pending (${bookings.filter(b => b.status === "pending").length})` },
    { key: "confirmed", label: `Confirmed (${bookings.filter(b => b.status === "confirmed").length})` },
    { key: "completed", label: `Completed (${bookings.filter(b => b.status === "completed").length})` },
    { key: "cancelled", label: `Cancelled (${bookings.filter(b => b.status === "cancelled" || b.status === "declined").length})` },
  ];

  if (loading) return <VencomeLoader />;

  return (
    <DashboardLayout title="My Bookings">
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: activeTab === tab.key ? "none" : "1px solid #E5E7EB",
              background: activeTab === tab.key ? "#0A1628" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#0A1628",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
          <ClipboardList size={40} color="#9CA3AF" style={{ marginBottom: "12px" }} />
          <p style={{ fontWeight: "600", fontSize: "16px", color: "#111827", marginBottom: "8px" }}>
            No bookings yet
          </p>
          <p style={{ fontSize: "14px" }}>Bookings for your spaces will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
                {booking.property?.coverImage && (
                  <img
                    src={booking.property.coverImage}
                    alt={booking.property?.title}
                    style={{
                      width: "160px",
                      height: "140px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
                      {booking.property?.title || "Property"}
                    </h3>
                    <span
                      style={{
                        ...getStatusStyle(booking.status),
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>
                    Guest: {booking.guest?.displayName || booking.guest?.firstName || "Guest"}
                  </p>

                  <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>
                    {new Date(booking.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" -> "}
                    {new Date(booking.checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#0A1628", marginTop: "8px" }}>
                    £{booking.totalPrice?.toLocaleString()}
                  </p>

                  {booking.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                      <button
                        onClick={() => handleBookingAction(booking._id, "confirmed")}
                        style={{
                          flex: 1,
                          background: "#16A34A",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Check size={14} />
                          Approve
                        </span>
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking._id, "declined")}
                        style={{
                          flex: 1,
                          background: "#fff",
                          color: "#DC2626",
                          border: "1.5px solid #DC2626",
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <X size={14} />
                          Decline
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default HostBookings;
