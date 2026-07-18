import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import getGreeting from "../utils/greeting";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  HelpCircle,
  MapPin,
  MessageSquare,
  Plus,
  PoundSterling,
  Star,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

const ACTIONS = [
  { icon: Plus, title: "List Your Space", description: "Start earning from your property", href: "/create-space" },
  { icon: MessageSquare, title: "Messages", description: "3 unread conversations", href: "/dashboard/messages" },
  { icon: CalendarDays, title: "Bookings", description: "Manage your booking requests", href: "/dashboard/bookings" },
  { icon: Star, title: "Leave a Review", description: "2 bookings awaiting review", href: "/dashboard/reviews" },
  { icon: HelpCircle, title: "Help & Support", description: "Get answers instantly", href: "/help-support" },
];

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const numericTarget = Number(target) || 0;
    const step = numericTarget / (duration / 16);
    const timer = window.setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        setCount(numericTarget);
        window.clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, [duration, target]);

  return count;
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles =
    normalized === "confirmed"
      ? "border-[#DCFCE7] bg-[#F0FDF4] text-[#166534]"
      : normalized === "cancelled" || normalized === "declined"
      ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
      : normalized === "completed"
      ? "border-[#E5E7EB] bg-[#F3F4F6] text-[#374151]"
      : "border-[#FDE68A] bg-[#FEF9C3] text-[#854D0E]";
  const label =
    normalized === "confirmed"
      ? "Confirmed"
      : normalized === "cancelled"
      ? "Cancelled"
      : normalized === "declined"
      ? "Declined"
      : normalized === "completed"
      ? "Completed"
      : "Pending";

  return (
    <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${styles}`}>
      {label}
    </span>
  );
}

const formatCurrency = (value) =>
  `£${new Intl.NumberFormat("en-GB").format(Number(value) || 0)}`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getListingLocation = (listing) => listing.location?.city || "";

const getCustomerName = (booking) =>
  booking.guest?.displayName ||
  booking.guest?.firstName ||
  booking.guest?.name ||
  [booking.guest?.firstName, booking.guest?.lastName].filter(Boolean).join(" ") ||
  "Guest";

function IncompleteDraftBanner({ token }) {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/drafts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDrafts(data.drafts || []);
        }
      } catch (err) {
        console.error("Failed to load drafts:", err);
      }
    };
    load();
  }, [token]);

  if (drafts.length === 0) return null;

  const draftTitle = drafts[0].title || "Untitled space";

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <AlertTriangle size={20} className="shrink-0 text-[#B45309]" />
        <div>
          <p className="text-[14px] font-bold text-[#92400E]">Finish your listing</p>
          <p className="text-[13px] text-[#B45309]">
            "{draftTitle}" is saved as a draft{drafts.length > 1 ? ` (and ${drafts.length - 1} more)` : ""} — complete it to make it live.
          </p>
        </div>
      </div>
      <Link
        to="/create-space"
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0A1628] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
      >
        Finish listing <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function OnboardingChecklist({ token }) {
  const [checklist, setChecklist] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/hosts/me/onboarding-checklist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChecklist(data);
        }
      } catch (err) {
        console.error("Failed to load onboarding checklist:", err);
      }
    };
    load();
  }, [token]);

  if (!checklist || checklist.allComplete || dismissed) return null;

  const progress = Math.round((checklist.completedCount / checklist.totalSteps) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-7 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-bold text-[#0A1628]">Finish setting up your host account</h3>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {checklist.completedCount} of {checklist.totalSteps} steps done
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[13px] font-medium text-[#6B7280] hover:text-[#0A1628]"
        >
          Hide for now
        </button>
      </div>

      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className="h-full rounded-full bg-[#305CDE] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {checklist.steps.map((step) => (
          <Link
            key={step.key}
            to={step.href}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
              step.completed
                ? "border-[#DCFCE7] bg-[#F0FDF4]"
                : "border-[#E5E7EB] bg-white hover:border-[#305CDE]"
            }`}
          >
            {step.completed ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#16A34A]" />
            ) : (
              <Circle size={18} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-[13px] font-semibold ${step.completed ? "text-[#166534]" : "text-[#0A1628]"}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-[12px] text-[#6B7280]">{step.description}</p>
            </div>
            {!step.completed ? <ArrowRight size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" /> : null}
          </Link>
        ))}
      </div>
    </motion.section>
  );
}

export default function Dashboard() {
  const token = localStorage.getItem("vencome_token");
  const user = JSON.parse(localStorage.getItem("vencome_user") || "{}");
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const displayName = user.displayName || user.firstName || "Host";

  const fetchHostDashboard = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [listingsRes, bookingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/properties/me`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/bookings/host`, { headers }),
      ]);

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        const allListings = listingsData.properties || [];
        setListings(allListings);
        setStats((prev) => ({
          ...prev,
          totalListings: allListings.length,
          activeListings: allListings.filter((listing) => listing.isActive).length,
        }));
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        const allBookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
        setBookings(allBookings);
        const revenue = allBookings
          .filter((booking) => String(booking.status || "").toLowerCase() === "completed")
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        setStats((prev) => ({
          ...prev,
          totalBookings: allBookings.length,
          pendingBookings: allBookings.filter(
            (booking) => String(booking.status || "").toLowerCase() === "pending"
          ).length,
          totalRevenue: revenue,
        }));
      }
    } catch (err) {
      console.error("Host dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHostDashboard();
  }, [fetchHostDashboard]);

  const handleBookingAction = async (bookingId, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking");
      }

      await fetchHostDashboard();
    } catch (error) {
      console.error("Failed to update booking status:", error);
    }
  };

  const totalListingsCount = useCountUp(stats.totalListings);
  const activeListingsCount = useCountUp(stats.activeListings);
  const totalBookingsCount = useCountUp(stats.totalBookings);
  const pendingBookingsCount = useCountUp(stats.pendingBookings);
  const totalRevenueCount = useCountUp(stats.totalRevenue);

  const liveStats = [
    { icon: Plus, label: "Total Listings", value: `${totalListingsCount}`, sub: "Spaces in portfolio" },
    { icon: Star, label: "Active Listings", value: `${activeListingsCount}`, sub: "Currently live" },
    { icon: CalendarDays, label: "Total Bookings", value: `${totalBookingsCount}`, sub: "Across all listings" },
    { icon: Clock, label: "Pending Requests", value: `${pendingBookingsCount}`, sub: "Awaiting action" },
    { icon: PoundSterling, label: "Total Revenue", value: formatCurrency(totalRevenueCount), sub: "Completed bookings" },
  ];

  return (
    <DashboardLayout title="Overview">
      <IncompleteDraftBanner token={token} />

      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-7 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0A1628_0%,#1a2f4e_100%)] px-4 py-5 sm:px-6 md:px-8 md:py-7"
      >
        <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-[200px] w-[200px] rounded-full bg-[rgba(48,92,222,0.1)]" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-white md:text-[22px]">{getGreeting()}, {displayName}</h2>
            <p className="mt-1.5 text-[14px] text-white/70">
              {loading
                ? "Loading your host dashboard..."
                : `You have ${stats.pendingBookings} pending booking request${stats.pendingBookings === 1 ? "" : "s"}.`}
            </p>
          </div>
          <Link
            to="/search"
            className="hidden rounded-lg border-[1.5px] border-[#305CDE] px-5 py-2.5 text-[14px] font-semibold text-[#305CDE] transition hover:bg-[rgba(48,92,222,0.1)] md:inline-flex"
          >
            Explore Spaces →
          </Link>
        </div>
      </motion.section>

      <OnboardingChecklist token={token} />

      <section className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {(loading ? Array.from({ length: 5 }, (_, index) => ({ id: index })) : liveStats).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label || stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 sm:px-5 sm:py-5"
            >
              {loading ? (
                <>
                  <div className="h-11 w-11 rounded-xl bg-[#F3F4F6]" />
                  <div className="mt-4 h-3 w-24 rounded-full bg-[#F3F4F6]" />
                  <div className="mt-2 h-8 w-20 rounded-lg bg-[#F3F4F6]" />
                  <div className="mt-2 h-3 w-28 rounded-full bg-[#F3F4F6]" />
                </>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
                    <Icon size={20} />
                  </div>
                  <p className="mt-4 text-[13px] text-[#6B7280]">{stat.label}</p>
                  <p className="mt-1 break-words text-[24px] font-extrabold text-[#0A1628] sm:text-[28px]">{stat.value}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{stat.sub}</p>
                </>
              )}
            </motion.div>
          );
        })}
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-[18px] font-bold text-[#0A1628]">Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="text-[14px] font-medium text-[#305CDE]">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }, (_, index) => (
              <div
                key={`booking-skeleton-${index}`}
                className="flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 md:flex-row md:items-center md:px-5"
              >
                <div className="h-14 w-14 rounded-[10px] bg-[#F3F4F6] md:h-[72px] md:w-[72px]" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-48 rounded-full bg-[#F3F4F6]" />
                  <div className="mt-2 h-3 w-40 rounded-full bg-[#F3F4F6]" />
                  <div className="mt-2 h-3 w-44 rounded-full bg-[#F3F4F6]" />
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="h-4 w-20 rounded-full bg-[#F3F4F6]" />
                  <div className="h-7 w-24 rounded-full bg-[#F3F4F6]" />
                </div>
              </div>
            ))
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }} className="rounded-[14px] border border-[#E5E7EB] bg-white">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <ClipboardList size={40} color="#9CA3AF" />
              </div>
              <p style={{ color: "#111827", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>
                No bookings yet
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                Bookings for your spaces will appear here
              </p>
            </div>
          ) : (
            bookings.slice(0, 5).map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 md:flex-row md:items-center md:px-5"
              >
                {booking.guest?.profileImage ? (
                  <img
                    src={booking.guest.profileImage}
                    alt={getCustomerName(booking)}
                    className="h-14 w-14 rounded-[10px] object-cover md:h-[72px] md:w-[72px]"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[#E5E7EB] text-[#6B7280] md:h-[72px] md:w-[72px]">
                    <CalendarDays size={22} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#0A1628]">
                    {booking.property?.title || "Property"}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                    <MapPin size={12} />
                    <span>{getCustomerName(booking)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#374151]">
                    <Clock size={12} />
                    <span className="whitespace-normal break-words">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <p className="text-[16px] font-bold text-[#0A1628]">{formatCurrency(booking.totalPrice)}</p>
                  <StatusBadge status={booking.status} />
                  {String(booking.status || "").toLowerCase() === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking._id, "confirmed")}
                        className="rounded-lg bg-[#0A1628] px-3 py-2 text-[12px] font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingAction(booking._id, "declined")}
                        className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-[12px] font-semibold text-[#0A1628]"
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-[18px] font-bold text-[#0A1628]">Recent Listings</h3>
          <Link to="/host/listings" className="text-[14px] font-medium text-[#305CDE]">
            View listings →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`listing-skeleton-${index}`} className="min-w-[220px] shrink-0 rounded-[14px] bg-[#F3F4F6] sm:min-w-[260px]" style={{ height: 320 }} />
            ))
          ) : listings.length === 0 ? (
            <div className="w-full rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-8 text-center">
              <p className="text-[15px] font-medium text-[#6B7280]">No listings yet</p>
              <Link
                to="/create-space"
                className="mt-4 inline-flex rounded-lg bg-[#305CDE] px-4 py-2.5 text-[14px] font-semibold text-white"
              >
                Add New Space
              </Link>
            </div>
          ) : (
            listings.slice(0, 4).map((listing) => (
              <div
                key={listing._id}
                className="min-w-[220px] shrink-0 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white sm:min-w-[260px]"
              >
                <Link to={`/property/${listing._id}`} className="block">
                  <div className="relative">
                    <img
                      src={listing.coverImage}
                      alt={listing.title}
                      className="h-[180px] w-full object-cover"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-[5px] text-[11px] font-bold uppercase tracking-[0.5px] ${
                        listing.isActive ? "bg-[#16A34A] text-white" : "bg-[#9CA3AF] text-white"
                      }`}
                    >
                      {listing.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                      <MapPin size={12} />
                      <span>{getListingLocation(listing)}</span>
                    </div>
                    <h4 className="mt-2 text-[15px] font-semibold text-[#111827]">{listing.title}</h4>
                    <p className="mt-3 text-[16px] font-bold text-[#111827]">
                      {listing.pricing?.hourly ? `£${listing.pricing.hourly}/hr` : "POA"}
                    </p>
                  </div>
                </Link>
                <div className="border-t border-[#E5E7EB] p-4">
                  <Link
                    to={`/edit-space/${listing._id}`}
                    className="inline-flex rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0A1628] transition hover:border-[#305CDE] hover:bg-[#F8F6F0]"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[18px] font-bold text-[#0A1628]">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(48,92,222,0.15)" }}
              >
                <Link
                  to={action.href}
                  className="block rounded-[14px] border border-[#E5E7EB] bg-white p-4 transition hover:border-[#305CDE] sm:p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]">
                    <Icon size={20} />
                  </div>
                  <p className="mt-3 text-[14px] font-bold text-[#0A1628]">{action.title}</p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{action.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
