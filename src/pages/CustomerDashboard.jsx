import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Building2,
  CalendarDays,
  CalendarX,
  Clock,
  Heart,
  HelpCircle,
  MapPin,
  MessageSquare,
  Plus,
  PoundSterling,
  Search,
  Star,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import CustomerLayout from "../layouts/CustomerLayout";
import PropertyCard from "../components/PropertyCard";

const MOCK_USER = {
  name: "James Thornton",
  email: "james@thorntonproperties.co.uk",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
  verified: true,
  joinedYear: 2026,
  company: "Thornton Properties Ltd",
  phone: "+44 7700 000000",
};

const MOCK_BOOKINGS = [
  {
    id: 1,
    tab: "upcoming",
    space: "Canary Wharf Boardroom",
    location: "Canary Wharf, London",
    category: "Meeting Rooms",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80",
    checkIn: "Mon 19 May 2026",
    duration: "9:00am – 1:00pm",
    durationLabel: "4 hours",
    price: 480,
    status: "Confirmed",
    bookingRef: "VC-2026-001",
    host: "Marcus Williams",
    canCancel: true,
  },
  {
    id: 2,
    tab: "upcoming",
    space: "DIFC Creative Studio",
    location: "DIFC, Dubai",
    category: "Studio Space",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
    checkIn: "Fri 23 May 2026",
    duration: "9:00am – 6:00pm",
    durationLabel: "Full day",
    price: 250,
    status: "Pending Approval",
    bookingRef: "VC-2026-002",
    host: "Aisha Rahman",
    canCancel: true,
  },
  {
    id: 3,
    tab: "past",
    space: "The Shard Executive Suite",
    location: "London Bridge, London",
    category: "Office Space",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80",
    checkIn: "Wed 1 May 2026",
    duration: "10:00am – 4:00pm",
    durationLabel: "6 hours",
    price: 510,
    status: "Completed",
    bookingRef: "VC-2026-003",
    host: "James Thornton",
    canCancel: false,
    hasReview: false,
  },
  {
    id: 4,
    tab: "cancelled",
    space: "Birmingham Conference Centre",
    location: "Digbeth, Birmingham",
    category: "Meeting Rooms",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&q=80",
    checkIn: "Thu 10 Apr 2026",
    duration: "2:00pm – 5:00pm",
    durationLabel: "3 hours",
    price: 270,
    status: "Cancelled",
    bookingRef: "VC-2026-004",
    host: "David Park",
    canCancel: false,
    refundStatus: "Refunded £270",
  },
];

const MOCK_SAVED = [
  {
    id: 1,
    title: "The Shard Executive Suite",
    location: "London Bridge, London",
    category: "Office Space",
    price: 85,
    priceUnit: "hour",
    rating: 4.92,
    reviewCount: 47,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
  },
  {
    id: 2,
    title: "Shoreditch Event Space",
    location: "Shoreditch, London",
    category: "Event Venues",
    price: 450,
    priceUnit: "day",
    rating: 4.9,
    reviewCount: 58,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
  },
  {
    id: 3,
    title: "DIFC Creative Studio",
    location: "DIFC, Dubai",
    category: "Studio Space",
    price: 250,
    priceUnit: "day",
    rating: 4.97,
    reviewCount: 22,
    badge: "Verified",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
  },
  {
    id: 4,
    title: "Mayfair Private Members Office",
    location: "Mayfair, London",
    category: "Office Space",
    price: 5500,
    priceUnit: "month",
    rating: 4.95,
    reviewCount: 12,
    badge: "Featured",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  },
];

const SECTION_TITLES = {
  overview: "Overview",
  bookings: "My Bookings",
  saved: "Saved Spaces",
  messages: "Messages",
  reviews: "My Reviews",
  profile: "Profile",
  settings: "Settings",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number(amount) || 0
  );

function StatusBadge({ status }) {
  const styles =
    status === "Confirmed"
      ? { bg: "rgba(22,163,74,0.1)", text: "#16A34A" }
      : status === "Pending Approval"
        ? { bg: "rgba(217,119,6,0.1)", text: "#D97706" }
        : status === "Completed"
          ? { bg: "rgba(10,22,40,0.08)", text: "#0A1628" }
          : { bg: "rgba(220,38,38,0.08)", text: "#DC2626" };

  return (
    <span
      style={{
        background: styles.bg,
        color: styles.text,
        borderRadius: 9999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function OverviewSection() {
  const upcoming = MOCK_BOOKINGS.filter((b) => b.tab === "upcoming");

  const stats = [
    {
      icon: CalendarDays,
      label: "Upcoming Bookings",
      value: "2",
      sub: "Next: Mon 19 May",
    },
    { icon: Heart, label: "Saved Spaces", value: "4", sub: "1 new match" },
    {
      icon: MessageSquare,
      label: "Unread Messages",
      value: "3",
      sub: "2 from hosts",
    },
    {
      icon: PoundSterling,
      label: "Total Spent",
      value: "£4,820",
      sub: "This year",
    },
  ];

  const quickActions = [
    {
      icon: Search,
      title: "Find a Space",
      desc: "Browse thousands of listings",
      to: "/search",
    },
    {
      icon: Plus,
      title: "List Your Space",
      desc: "Start earning from your property",
      to: "/create-space",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      desc: "3 unread conversations",
      to: "/customer/messages",
    },
    {
      icon: Heart,
      title: "Saved Spaces",
      desc: "4 spaces saved",
      to: "/customer/saved",
    },
    {
      icon: Star,
      title: "Leave a Review",
      desc: "1 booking awaiting review",
      to: "/customer/reviews",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      desc: "Get answers instantly",
      to: "/support",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(135deg, #0A1628 0%, #1a2f4e 100%)",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(46,88,236,0.15)",
          }}
        />
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <p className="break-words text-[22px] font-bold text-white">
              Good morning, James
            </p>
            <p className="mt-1 text-[14px] text-white/70">
              You have 2 upcoming bookings this week.
            </p>
          </div>
          <Link
            to="/search"
            style={{
              border: "1.5px solid #2E58EC",
              color: "#2E58EC",
              background: "transparent",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            className="hidden md:inline-flex"
          >
            Explore Spaces →
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[14px] border border-[#E5E7EB] bg-white p-5 md:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(46,88,236,0.08)] text-[#2E58EC]">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[28px] font-extrabold text-[#0A1628]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{item.sub}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#0A1628]">Upcoming Bookings</h2>
          <Link to="/customer/bookings" className="text-[13px] font-semibold text-[#C9A84C]">
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {upcoming.slice(0, 2).map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex gap-4 rounded-[14px] border border-[#E5E7EB] bg-white p-4 md:p-5"
            >
              <img
                src={booking.image}
                alt={booking.space}
                className="hidden h-[72px] w-[72px] rounded-[10px] object-cover md:block"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-[#0A1628]">
                  {booking.space}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {booking.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {booking.duration}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <p className="text-[16px] font-bold text-[#0A1628]">
                  {formatCurrency(booking.price)}
                </p>
                <StatusBadge status={booking.status} />
                <Link to="/customer/bookings" className="text-[13px] font-semibold text-[#C9A84C]">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#0A1628]">Saved Spaces</h2>
          <Link to="/customer/saved" className="text-[13px] font-semibold text-[#C9A84C]">
            View all →
          </Link>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_SAVED.map((space) => (
            <div key={space.id} className="min-w-[240px] shrink-0">
              <PropertyCard {...space} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-[18px] font-bold text-[#0A1628]">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(46,88,236,0.1)" }}
                className="rounded-[14px] border border-[#E5E7EB] bg-white p-5 transition"
              >
                <Link to={action.to} className="block">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(46,88,236,0.08)] text-[#2E58EC]">
                    <Icon size={20} />
                  </div>
                  <p className="mt-3 text-[14px] font-bold text-[#0A1628]">
                    {action.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{action.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function BookingEmptyState({ tab }) {
  const label =
    tab === "upcoming"
      ? "upcoming"
      : tab === "current"
        ? "current"
        : tab === "past"
          ? "past"
          : "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-20 text-center"
    >
      <CalendarX size={48} color="#E5E7EB" />
      <h2 className="mt-4 text-[18px] font-bold text-[#0A1628]">
        No {label} bookings
      </h2>
      <p className="mt-2 max-w-[360px] text-[14px] text-[#6B7280]">
        {tab === "upcoming"
          ? "You don’t have any bookings scheduled yet."
          : "Nothing to show here right now."}
      </p>
      {tab === "upcoming" ? (
        <Link
          to="/search"
          style={{
            marginTop: 24,
            padding: "12px 24px",
            borderRadius: 9999,
            background: "#2E58EC",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Explore Spaces
        </Link>
      ) : null}
    </motion.div>
  );
}

function BookingCard({ booking }) {
  const showReview = booking.tab === "past" && booking.status === "Completed" && !booking.hasReview;
  const showRefund = booking.tab === "cancelled" && booking.refundStatus;
  const pill = (
    <StatusBadge status={booking.status} />
  );

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E5E7EB] bg-white">
      <div className="flex flex-col md:flex-row">
        <img
          src={booking.image}
          alt={booking.space}
          className="h-[160px] w-full object-cover md:h-[140px] md:w-[160px]"
        />
        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[18px] font-bold text-[#0A1628]">{booking.space}</p>
              <div className="mt-2 flex flex-col gap-2 text-[13px] text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span className="truncate">{booking.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {booking.checkIn} · {booking.duration}
                </span>
              </div>
            </div>
            {pill}
          </div>

          <div className="mt-4">
            <p className="text-[20px] font-extrabold text-[#0A1628]">
              {formatCurrency(booking.price)}
            </p>
            <p className="mt-1 text-[12px] text-[#6B7280]">Total paid</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-[#F8F6F0] px-5 py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] text-[#6B7280]">Ref: {booking.bookingRef}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/customer/bookings" className="text-[13px] font-semibold text-[#C9A84C]">
            View Details
          </Link>
          {booking.tab === "upcoming" ? (
            <>
              <Link to="/customer/messages" className="text-[13px] font-semibold text-[#2E58EC]">
                Message Host
              </Link>
              {booking.canCancel ? (
                <button type="button" className="text-[13px] font-semibold text-[#DC2626]">
                  Cancel
                </button>
              ) : null}
            </>
          ) : null}
          {booking.tab === "past" ? (
            <>
              {showReview ? (
                <Link to="/customer/reviews" className="text-[13px] font-semibold text-[#C9A84C]">
                  Leave a Review
                </Link>
              ) : null}
              <Link to="/search" className="text-[13px] font-semibold text-[#2E58EC]">
                Book Again
              </Link>
            </>
          ) : null}
          {showRefund ? (
            <span className="text-[13px] font-semibold text-[#16A34A]">{booking.refundStatus}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BookingsSection() {
  const TABS = [
    { id: "upcoming", label: "Upcoming (2)" },
    { id: "current", label: "Current" },
    { id: "past", label: "Past (1)" },
    { id: "cancelled", label: "Cancelled (1)" },
  ];

  const [activeBookingTab, setActiveBookingTab] = useState("upcoming");
  const list = useMemo(
    () => MOCK_BOOKINGS.filter((b) => b.tab === activeBookingTab),
    [activeBookingTab]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="border-b border-[#E5E7EB]">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = activeBookingTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBookingTab(tab.id)}
                className={`whitespace-nowrap px-5 py-3 text-[14px] transition ${
                  active ? "border-b-2 border-[#2E58EC] font-semibold text-[#0A1628]" : "text-[#6B7280]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBookingTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {list.length === 0 ? (
              <BookingEmptyState tab={activeBookingTab} />
            ) : (
              <div className="space-y-4">
                {list.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <BookingCard booking={booking} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SavedSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[20px] font-bold text-[#0A1628]">Saved Spaces (4)</h2>
        <Link to="/search" className="text-[13px] font-semibold text-[#C9A84C]">
          Find more spaces →
        </Link>
      </div>

      {MOCK_SAVED.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <Heart size={48} color="#E5E7EB" />
          <h2 className="mt-4 text-[18px] font-bold text-[#0A1628]">No saved spaces yet</h2>
          <p className="mt-2 text-[14px] text-[#6B7280]">Start exploring and save spaces you love.</p>
          <Link
            to="/search"
            style={{
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 9999,
              background: "#2E58EC",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_SAVED.map((space) => (
            <PropertyCard key={space.id} {...space} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MessagesSection() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <MessageSquare size={48} color="#E5E7EB" />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>
        Messages
      </h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8, maxWidth: 360 }}>
        Your conversations with hosts will appear here. Real-time messaging coming in Phase 2.
      </p>
      <Link
        to="/search"
        style={{
          marginTop: 24,
          padding: "12px 24px",
          borderRadius: 9999,
          background: "#2E58EC",
          color: "white",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          minHeight: 44,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Browse Spaces
      </Link>
    </div>
  );
}

function ReviewsSection() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <Star size={48} color="#E5E7EB" />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>
        Reviews
      </h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8, maxWidth: 360 }}>
        Your reviews will appear here. Review management coming in Phase 2.
      </p>
      <Link
        to="/customer/bookings"
        style={{
          marginTop: 24,
          padding: "12px 24px",
          borderRadius: 9999,
          background: "#2E58EC",
          color: "white",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          minHeight: 44,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        View Bookings
      </Link>
    </div>
  );
}

function ProfileSection() {
  const [firstName, setFirstName] = useState("James");
  const [lastName, setLastName] = useState("Thornton");
  const [email, setEmail] = useState(MOCK_USER.email);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [company, setCompany] = useState(MOCK_USER.company);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-7 text-center">
        <img
          src={MOCK_USER.avatar}
          alt={MOCK_USER.name}
          className="mx-auto h-20 w-20 rounded-full object-cover"
        />
        <button type="button" className="mt-3 text-[13px] font-semibold text-[#2E58EC]">
          Edit Photo
        </button>
        <p className="mt-4 text-[20px] font-bold text-[#0A1628]">{MOCK_USER.name}</p>
        <p className="mt-1 text-[14px] text-[#6B7280]">{MOCK_USER.email}</p>
        {MOCK_USER.verified ? (
          <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.15)] px-3 py-1 text-[10px] font-bold text-[#C9A84C]">
            <Check size={12} />
            Verified
          </span>
        ) : null}
      </div>

      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-7">
        <h3 className="text-[16px] font-bold text-[#0A1628]">Personal Information</h3>
        <div className="mt-5 space-y-4">
          {[
            { label: "First Name", value: firstName, onChange: setFirstName },
            { label: "Last Name", value: lastName, onChange: setLastName },
            { label: "Email", value: email, onChange: setEmail },
            { label: "Phone", value: phone, onChange: setPhone },
            { label: "Company", value: company, onChange: setCompany },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-[13px] font-semibold text-[#0A1628]">
                {field.label}
              </label>
              <input
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="h-12 w-full rounded-[10px] border border-[#E5E7EB] px-4 text-[15px] text-[#111827] outline-none transition focus:border-[#2E58EC]"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-[10px] bg-[#2E58EC] text-[15px] font-bold text-white"
        >
          Save Changes
        </button>
      </div>
    </motion.div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!enabled)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: enabled ? "#0A1628" : "#E5E7EB",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: 2,
        flexShrink: 0,
      }}
      animate={{ background: enabled ? "#0A1628" : "#E5E7EB" }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );
}

function SettingsSection() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const rows = [
    {
      title: "Email Notifications",
      desc: "Booking confirmations and updates",
      value: emailNotifications,
      onChange: setEmailNotifications,
    },
    {
      title: "SMS Notifications",
      desc: "Critical alerts via text message",
      value: smsNotifications,
      onChange: setSmsNotifications,
    },
    {
      title: "Marketing Emails",
      desc: "Offers, tips and new spaces",
      value: marketingEmails,
      onChange: setMarketingEmails,
    },
    {
      title: "Two-Factor Auth",
      desc: "Extra security for your account",
      value: twoFactor,
      onChange: setTwoFactor,
    },
    {
      title: "Profile Visibility",
      desc: "Show profile to hosts",
      value: profileVisibility,
      onChange: setProfileVisibility,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[16px] border border-[#E5E7EB] bg-white p-7"
    >
      <h2 className="text-[18px] font-bold text-[#0A1628]">Account Settings</h2>
      <div className="mt-6 divide-y divide-[#F3F4F6]">
        {rows.map((row) => (
          <div key={row.title} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#0A1628]">{row.title}</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">{row.desc}</p>
            </div>
            <Toggle enabled={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#E5E7EB] pt-6">
        <button
          type="button"
          className="rounded-[10px] border border-[#DC2626] px-5 py-2.5 text-[14px] font-semibold text-[#DC2626]"
        >
          Delete Account
        </button>
      </div>
    </motion.div>
  );
}

export default function CustomerDashboard({ section = "overview" }) {
  const resolvedSection = SECTION_TITLES[section] ? section : "overview";

  return (
    <CustomerLayout title={SECTION_TITLES[resolvedSection]}>
      {resolvedSection === "overview" && <OverviewSection />}
      {resolvedSection === "bookings" && <BookingsSection />}
      {resolvedSection === "saved" && <SavedSection />}
      {resolvedSection === "messages" && <MessagesSection />}
      {resolvedSection === "reviews" && <ReviewsSection />}
      {resolvedSection === "profile" && <ProfileSection />}
      {resolvedSection === "settings" && <SettingsSection />}
    </CustomerLayout>
  );
}
