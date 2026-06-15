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

function SmallButton({ children, gold = false, danger = false }) {
  if (danger) {
    return (
      <button
        type="button"
        className="text-[13px] font-medium text-[#DC2626] transition hover:underline"
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
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
  const [activeTab, setActiveTab] = useState("upcoming");
  const [prevTab, setPrevTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
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
                      <SmallButton>View Details</SmallButton>
                    </div>

                    {booking.canMessage ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                      <SmallButton>
                        <MessageSquare size={14} />
                        {booking.isHost ? "Message Guest" : "Message Host"}
                      </SmallButton>
                      </div>
                    ) : null}

                    {booking.status === "Confirmed" && booking.tab === "upcoming" ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <SmallButton danger>Cancel Booking</SmallButton>
                      </div>
                    ) : null}

                    {booking.status === "Pending Approval" ? (
                      <div className="flex min-w-[120px] flex-1 sm:flex-none">
                        <SmallButton danger>Cancel Request</SmallButton>
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
