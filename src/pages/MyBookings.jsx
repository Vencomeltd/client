import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CalendarDays,
  CalendarX,
  Clock,
  MapPin,
  MessageSquare,
  RotateCcw,
  Search,
  Star,
  User,
  XCircle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useDashboardBadge } from "../layouts/DashboardLayout";
import ReviewModal from "../components/ReviewModal";

const TABS = ["upcoming", "current", "past", "cancelled"];
const STATUS_FILTERS = ["All", "Confirmed", "Pending", "Completed", "Cancelled"];

const formatPrice = (value) =>
  `£${new Intl.NumberFormat("en-GB").format(value)}`;

function StatusBadge({ status }) {
  const styles = {
    Confirmed: "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]",
    "Pending Approval":
      "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]",
    Completed: "border-[rgba(10,22,40,0.15)] bg-[rgba(10,22,40,0.08)] text-[#0A1628]",
    Cancelled: "border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.08)] text-[#DC2626]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
        styles[status] || styles.Completed
      }`}
    >
      {status}
    </span>
  );
}

function SmallButton({ children, gold = false, danger = false, onClick }) {
  if (danger) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-[13px] font-medium text-[#DC2626] transition hover:underline"
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
        gold
          ? "bg-[#305CDE] text-white hover:bg-[#254FC7]"
          : "border-[1.5px] border-[#E5E7EB] bg-white text-[#111827] hover:border-[#0A1628]"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ tab }) {
  const config = {
    upcoming: {
      icon: CalendarX,
      title: "No upcoming bookings",
      subtitle: "You have no upcoming bookings. Find your next space below.",
    },
    current: {
      icon: CalendarX,
      title: "No current bookings",
      subtitle: "You do not have any active bookings right now.",
    },
    past: {
      icon: CalendarX,
      title: "No past bookings",
      subtitle: "You haven't completed any bookings yet.",
    },
    cancelled: {
      icon: XCircle,
      title: "No cancelled bookings",
      subtitle: "No cancelled bookings. Great news!",
    },
  }[tab];

  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F6F0] text-[#6B7280]">
        <Icon size={48} />
      </div>
      <h3 className="mt-5 text-[18px] font-bold text-[#0A1628]">{config.title}</h3>
      <p className="mt-2 text-[14px] text-[#6B7280]">{config.subtitle}</p>
      {tab === "upcoming" ? (
        <Link
          to="/search"
          className="mt-6 inline-flex rounded-[10px] bg-[#305CDE] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#254FC7]"
        >
          Explore Spaces
        </Link>
      ) : null}
    </div>
  );
}

export default function MyBookings() {
  const { clearPendingCount } = useDashboardBadge();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [prevTab, setPrevTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleMessageHost = async (booking) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/booking/${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open conversation");
      const base = booking.isHost ? "/dashboard/messages" : "/customer/messages";
      window.location.href = `${base}/${data.conversation._id}`;
    } catch (e) {
      alert("Couldn't open the conversation. Please try again.");
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    setCancellingId(booking.id);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAllBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "Cancelled", tab: "cancelled" } : b));
        const refund = data.refund;
        if (refund?.amount > 0) {
          alert(`Booking cancelled. A refund of £${refund.amount} will be processed (${refund.reason}).`);
        } else if (refund) {
          alert(`Booking cancelled. ${refund.reason}`);
        }
      } else {
        alert(data.error || "Failed to cancel booking");
      }
    } catch (e) {
      alert("Something went wrong. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      clearPendingCount();
      try {
        const currentUser = JSON.parse(localStorage.getItem("vencome_user") || "{}");
        const token = localStorage.getItem("vencome_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const raw = Array.isArray(data) ? data : data.bookings || [];

        // Map API booking to the shape the UI expects
        const mapped = raw.map((b) => {
          const checkInDate = new Date(b.checkIn);
          const checkOutDate = new Date(b.checkOut);
          const now = new Date();

          let tab = "upcoming";
          if (b.status === "cancelled" || b.status === "declined") tab = "cancelled";
          else if (checkOutDate < now) tab = "past";
          else if (checkInDate <= now && checkOutDate >= now) tab = "current";
          else tab = "upcoming";

          const statusMap = {
            pending: "Pending Approval",
            confirmed: "Confirmed",
            completed: "Completed",
            cancelled: "Cancelled",
            declined: "Cancelled",
          };

          return {
            id: b._id,
            tab,
            space: b.property?.title || "Property",
            location: b.property?.location?.city
              ? `${b.property.location.city}, ${b.property.location.country || ""}`
              : "",
            category: b.property?.category?.name || "",
            image:
              b.property?.coverImage ||
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
            checkIn: checkInDate.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            checkOut: checkOutDate.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            duration: `${checkInDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })} – ${checkOutDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            durationLabel: b.totalHours
              ? `${b.totalHours} hours`
              : b.totalNights
              ? `${b.totalNights} nights`
              : "Full day",
            price: b.totalPrice || 0,
            status: statusMap[b.status] || "Confirmed",
            bookingRef: b._id.toString().slice(-8).toUpperCase(),
            host: b.host?.displayName || b.host?.firstName || "Host",
            hostAvatar: b.host?.profileImage || "",
            isHost: b.host?._id === currentUser.id || b.host === currentUser.id,
            canCancel: tab === "upcoming" && (b.status === "confirmed" || b.status === "pending"),
            canModify: false,
            canMessage: true,
            hasReview: b.reviewed || false,
            refundStatus: b.refund?.amount ? `Refunded £${b.refund.amount}` : "",
            propertyId: b.property?._id || b.property || "",
            hostId: b.property?.host?._id || b.property?.host || "",
            conversationId: b.conversationId || "",
            rawBooking: b,
          };
        });

        setAllBookings(mapped);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const direction =
    TABS.indexOf(activeTab) > TABS.indexOf(prevTab) ? 1 : -1;

  const tabCounts = useMemo(
    () =>
      TABS.reduce((acc, tab) => {
        acc[tab] = allBookings.filter((b) => b.tab === tab).length;
        return acc;
      }, {}),
    [allBookings]
  );

  const visibleBookings = useMemo(() => {
    const filtered = allBookings
      .filter((b) => b.tab === activeTab)
      .filter((b) =>
        query
          ? [b.space, b.location, b.host, b.bookingRef]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      )
      .filter((b) => {
        if (statusFilter === "All") return true;
        if (statusFilter === "Pending") return b.status === "Pending Approval";
        return b.status === statusFilter;
      });

    return [...filtered].sort((a, b) => (sortBy === "newest" ? -1 : 1));
  }, [allBookings, activeTab, query, sortBy, statusFilter]);

  if (loading)
    return (
      <DashboardLayout title="My Bookings">
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
          Loading your bookings...
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout title="My Bookings">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-none lg:max-w-[320px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bookings..."
            className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[14px] text-[#111827] outline-none focus:border-[#0A1628]"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                  statusFilter === filter
                    ? "border-[#0A1628] bg-[#0A1628] text-white"
                    : "border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none"
          >
            <option value="newest">Sort by date</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#E5E7EB] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setPrevTab(activeTab);
              setActiveTab(tab);
            }}
            className={`mb-[-1px] border-b-2 px-5 py-3 text-[14px] transition ${
              activeTab === tab
                ? "border-[#305CDE] font-semibold text-[#0A1628]"
                : "border-transparent font-medium text-[#6B7280]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab] || 0})
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${statusFilter}-${sortBy}-${query}`}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.22 }}
          className="space-y-4"
        >
          {visibleBookings.length ? (
            visibleBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
              >
                <div className="flex flex-col md:flex-row">
                  <img
                    src={booking.image}
                    alt={booking.space}
                    className="h-[180px] w-full object-cover md:h-[140px] md:w-[160px] md:shrink-0"
                  />

                  <div className="flex-1 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="text-[13px] text-[#6B7280]">#{booking.bookingRef}</div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <h3 className="mt-1 text-[18px] font-bold text-[#0A1628]">
                      {booking.space}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                      <MapPin size={13} />
                      <span>{booking.location}</span>
                    </div>

                    <span className="mt-3 inline-flex rounded-md bg-[rgba(10,22,40,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[#0A1628]">
                      {booking.category}
                    </span>

                    <div className="my-3 border-t border-[#F3F4F6]" />

                    <div className="flex flex-col gap-2 text-[13px] text-[#374151] md:flex-row md:flex-wrap md:gap-5">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        <span>{booking.checkIn}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        <span>{booking.durationLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={13} />
                        <span>{booking.host}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[20px] font-extrabold text-[#0A1628]">
                        {formatPrice(booking.price)}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6B7280]">Total paid</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F8F6F0] px-5 py-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-[12px] text-[#6B7280]">Ref: {booking.bookingRef}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex min-w-[120px] flex-1 sm:flex-none">
                      <SmallButton onClick={() => handleViewDetails(booking)}>View Details</SmallButton>
                    </div>

                    {booking.canMessage ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                      <SmallButton onClick={() => handleMessageHost(booking)}>
                        <MessageSquare size={14} />
                        {booking.isHost ? "Message Guest" : "Message Host"}
                      </SmallButton>
                      </div>
                    ) : null}

                    {booking.status === "Confirmed" && booking.tab === "upcoming" ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <SmallButton danger onClick={() => handleCancel(booking)}>
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                        </SmallButton>
                      </div>
                    ) : null}

                    {booking.status === "Pending Approval" ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <SmallButton danger onClick={() => handleCancel(booking)}>
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel Request"}
                        </SmallButton>
                      </div>
                    ) : null}

                    {booking.tab === "past" && !booking.hasReview ? (
                      <>
                        <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <button
                          type="button"
                          onClick={() => setReviewBooking(booking)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#2E58EC",
                            color: "#fff",
                            border: "none",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          <Star size={14} />
                          Leave a Review
                        </button>
                        </div>
                        <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <SmallButton>
                          <RotateCcw size={14} />
                          Book Again
                        </SmallButton>
                        </div>
                      </>
                    ) : null}

                    {booking.tab === "past" && booking.hasReview ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                      <SmallButton gold>
                        <RotateCcw size={14} />
                        Book Again
                      </SmallButton>
                      </div>
                    ) : null}

                    {booking.tab === "cancelled" ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#16A34A]">
                        <Check size={12} />
                        {booking.refundStatus}
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </motion.div>
      </AnimatePresence>
      {selectedBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", maxWidth: "520px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0A1628" }}>Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B7280" }}>×</button>
            </div>
            <img src={selectedBooking.image} alt={selectedBooking.space} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Space</p>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", marginTop: "4px" }}>{selectedBooking.space}</p>
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Location</p>
                <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>{selectedBooking.location}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Check In</p>
                  <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>{selectedBooking.checkIn}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Check Out</p>
                  <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>{selectedBooking.checkOut}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Duration</p>
                  <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>{selectedBooking.durationLabel}</p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Status</p>
                  <p style={{ fontSize: "14px", marginTop: "4px" }}><StatusBadge status={selectedBooking.status} /></p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Host</p>
                <p style={{ fontSize: "14px", color: "#374151", marginTop: "4px" }}>{selectedBooking.host}</p>
              </div>
              <div style={{ background: "#F8F6F0", borderRadius: "12px", padding: "16px", marginTop: "4px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px" }}>Total Paid</p>
                <p style={{ fontSize: "24px", fontWeight: "800", color: "#0A1628", marginTop: "4px" }}>{formatPrice(selectedBooking.price)}</p>
              </div>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Ref: {selectedBooking.bookingRef}</p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setSelectedBooking(null)} style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#fff", color: "#0A1628", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Close</button>
              {selectedBooking.propertyId && (
                <button onClick={() => window.location.href = `/property/${selectedBooking.propertyId}`} style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "none", background: "#0A1628", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>View Property</button>
              )}
            </div>
          </div>
        </div>
      )}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => {
            setReviewBooking(null);
            setAllBookings((prev) =>
              prev.map((b) =>
                b.id === reviewBooking.id ? { ...b, hasReview: true } : b
              )
            );
          }}
        />
      )}
    </DashboardLayout>
  );
}
