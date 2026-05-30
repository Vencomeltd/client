import { useMemo, useState } from "react";
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

const ALL_BOOKINGS = [
  { id: 1, tab: "upcoming", space: "Canary Wharf Boardroom", location: "Canary Wharf, London", category: "Meeting Rooms", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80", checkIn: "Mon 19 May 2026", checkOut: "Mon 19 May 2026", duration: "9:00am – 1:00pm", durationLabel: "4 hours", price: 480, status: "Confirmed", bookingRef: "VC-2026-001", host: "Marcus Williams", hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80", canCancel: true, canModify: true, canMessage: true },
  { id: 2, tab: "upcoming", space: "DIFC Creative Studio", location: "DIFC, Dubai", category: "Studio Space", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80", checkIn: "Fri 23 May 2026", checkOut: "Fri 23 May 2026", duration: "9:00am – 6:00pm", durationLabel: "Full day", price: 250, status: "Pending Approval", bookingRef: "VC-2026-002", host: "Aisha Rahman", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80", canCancel: true, canModify: false, canMessage: true },
  { id: 6, tab: "current", space: "Soho Client Suite", location: "Soho, London", category: "Office Space", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80", checkIn: "Today", checkOut: "Today", duration: "9:00am – 5:00pm", durationLabel: "8 hours", price: 680, status: "Confirmed", bookingRef: "VC-2026-006", host: "Nina Brooks", hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80", canCancel: false, canModify: false, canMessage: true },
  { id: 3, tab: "past", space: "The Shard Executive Suite", location: "London Bridge, London", category: "Office Space", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80", checkIn: "Wed 1 May 2026", checkOut: "Wed 1 May 2026", duration: "10:00am – 4:00pm", durationLabel: "6 hours", price: 510, status: "Completed", bookingRef: "VC-2026-003", host: "James Thornton", hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80", canCancel: false, canModify: false, canMessage: true, hasReview: false },
  { id: 4, tab: "past", space: "Shoreditch Event Space", location: "Shoreditch, London", category: "Event Venues", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80", checkIn: "Sat 12 Apr 2026", checkOut: "Sat 12 Apr 2026", duration: "12:00pm – 10:00pm", durationLabel: "10 hours", price: 1800, status: "Completed", bookingRef: "VC-2026-004", host: "Sophie Chen", hostAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80", canCancel: false, canModify: false, canMessage: true, hasReview: true },
  { id: 5, tab: "cancelled", space: "Birmingham Conference Centre", location: "Digbeth, Birmingham", category: "Meeting Rooms", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&q=80", checkIn: "Thu 10 Apr 2026", checkOut: "Thu 10 Apr 2026", duration: "2:00pm – 5:00pm", durationLabel: "3 hours", price: 270, status: "Cancelled", bookingRef: "VC-2026-005", host: "David Park", hostAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&q=80", canCancel: false, canModify: false, canMessage: false, refundStatus: "Refunded £270" },
];

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
  const direction =
    TABS.indexOf(activeTab) > TABS.indexOf(prevTab) ? 1 : -1;

  const tabCounts = useMemo(
    () =>
      TABS.reduce((acc, tab) => {
        acc[tab] = ALL_BOOKINGS.filter((booking) => booking.tab === tab).length;
        return acc;
      }, {}),
    []
  );

  const visibleBookings = useMemo(() => {
    const filtered = ALL_BOOKINGS.filter((booking) => booking.tab === activeTab)
      .filter((booking) =>
        query
          ? [booking.space, booking.location, booking.host, booking.bookingRef]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      )
      .filter((booking) => {
        if (statusFilter === "All") return true;
        if (statusFilter === "Pending") return booking.status === "Pending Approval";
        return booking.status === statusFilter;
      });

    return [...filtered].sort((a, b) =>
      sortBy === "newest" ? b.id - a.id : a.id - b.id
    );
  }, [activeTab, query, sortBy, statusFilter]);

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
            <option value="newest">Sort by date ▾</option>
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
                        Message Host
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
                        <SmallButton gold>
                          <Star size={14} />
                          Leave a Review
                        </SmallButton>
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
    </DashboardLayout>
  );
}
