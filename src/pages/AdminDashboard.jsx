import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Key,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  PoundSterling,
  RefreshCw,
  Search,
  Settings,
  ShieldOff,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

const MOCK_METRICS = {
  totalUsers: 4821,
  totalUsersGrowth: "+12.4%",
  activeListings: 387,
  activeListingsGrowth: "+8.1%",
  gmv: 284650,
  gmvGrowth: "+23.7%",
  revenue: 28465,
  revenueGrowth: "+23.7%",
  pendingDisputes: 7,
  disputesGrowth: "-2",
  avgBookingValue: 412,
  avgBookingGrowth: "+5.2%",
};

const MOCK_CHART_DATA = [
  { month: "Nov", bookings: 142, revenue: 18400 },
  { month: "Dec", bookings: 198, revenue: 26100 },
  { month: "Jan", bookings: 167, revenue: 21800 },
  { month: "Feb", bookings: 203, revenue: 28400 },
  { month: "Mar", bookings: 241, revenue: 33200 },
  { month: "Apr", bookings: 289, revenue: 38700 },
  { month: "May", bookings: 312, revenue: 41200 },
];

const MOCK_CATEGORY_DATA = [
  { category: "Office Space", count: 124, percent: 32 },
  { category: "Meeting Rooms", count: 89, percent: 23 },
  { category: "Co-working", count: 67, percent: 17 },
  { category: "Event Venues", count: 54, percent: 14 },
  { category: "Studio Space", count: 31, percent: 8 },
  { category: "Other", count: 22, percent: 6 },
];

const MOCK_USERS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah.m@techcorp.co.uk",
    role: "customer",
    status: "active",
    verified: true,
    joined: "12 Jan 2026",
    bookings: 8,
    spent: 4820,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
    location: "London, UK",
  },
  {
    id: 2,
    name: "James Thornton",
    email: "james@thorntonproperties.co.uk",
    role: "host",
    status: "active",
    verified: true,
    joined: "3 Feb 2026",
    bookings: 0,
    listings: 4,
    revenue: 30685,
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&q=80",
    location: "London, UK",
  },
  {
    id: 3,
    name: "Ahmed Khalid",
    email: "ahmed.k@dubaiventures.ae",
    role: "customer",
    status: "active",
    verified: true,
    joined: "15 Feb 2026",
    bookings: 12,
    spent: 9240,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
    location: "Dubai, UAE",
  },
  {
    id: 4,
    name: "Priya Sharma",
    email: "priya.s@consulting.com",
    role: "customer",
    status: "suspended",
    verified: true,
    joined: "20 Mar 2026",
    bookings: 3,
    spent: 1200,
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80",
    location: "Manchester, UK",
  },
  {
    id: 5,
    name: "Marcus Williams",
    email: "m.williams@spaces.co.uk",
    role: "host",
    status: "active",
    verified: false,
    joined: "1 Apr 2026",
    bookings: 0,
    listings: 2,
    revenue: 8400,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80",
    location: "Birmingham, UK",
  },
  {
    id: 6,
    name: "Aisha Rahman",
    email: "aisha@difc-studios.ae",
    role: "host",
    status: "active",
    verified: true,
    joined: "5 Apr 2026",
    bookings: 0,
    listings: 3,
    revenue: 22100,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80",
    location: "Dubai, UAE",
  },
  {
    id: 7,
    name: "Tom Walker",
    email: "tom.w@startups.io",
    role: "customer",
    status: "active",
    verified: false,
    joined: "10 May 2026",
    bookings: 1,
    spent: 480,
    avatar:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=60&q=80",
    location: "London, UK",
  },
  {
    id: 8,
    name: "Sophie Chen",
    email: "sophie@eventspace.co.uk",
    role: "host",
    status: "pending",
    verified: false,
    joined: "12 May 2026",
    bookings: 0,
    listings: 1,
    revenue: 0,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80",
    location: "London, UK",
  },
];

const MOCK_LISTINGS_QUEUE = [
  {
    id: 1,
    title: "Mayfair Private Dining Room",
    host: "James Thornton",
    category: "Hospitality",
    location: "Mayfair, London",
    price: 450,
    priceUnit: "day",
    submittedAt: "2 hours ago",
    status: "pending_review",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
    flags: [],
  },
  {
    id: 2,
    title: "Brixton Warehouse Studio",
    host: "Marcus Williams",
    category: "Studio Space",
    location: "Brixton, London",
    price: 80,
    priceUnit: "hour",
    submittedAt: "5 hours ago",
    status: "pending_review",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200&q=80",
    flags: ["unverified_host"],
  },
  {
    id: 3,
    title: "Manchester Co-working Floor",
    host: "Sophie Chen",
    category: "Co-working",
    location: "Northern Quarter, Manchester",
    price: 25,
    priceUnit: "day",
    submittedAt: "1 day ago",
    status: "pending_review",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&q=80",
    flags: ["new_host"],
  },
  {
    id: 4,
    title: "Dubai Marina Event Terrace",
    host: "Aisha Rahman",
    category: "Event Venues",
    location: "Dubai Marina, Dubai",
    price: 2200,
    priceUnit: "day",
    submittedAt: "2 days ago",
    status: "pending_review",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&q=80",
    flags: [],
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-001",
    bookingRef: "VC-2026-001",
    customer: "Sarah Mitchell",
    host: "James Thornton",
    space: "The Shard Executive Suite",
    amount: 480,
    commission: 48,
    hostPayout: 432,
    status: "completed",
    escrowStatus: "released",
    date: "19 May 2026",
    currency: "GBP",
  },
  {
    id: "TXN-002",
    bookingRef: "VC-2026-002",
    customer: "Ahmed Khalid",
    host: "Aisha Rahman",
    space: "DIFC Creative Studio",
    amount: 250,
    commission: 25,
    hostPayout: 225,
    status: "completed",
    escrowStatus: "released",
    date: "15 May 2026",
    currency: "GBP",
  },
  {
    id: "TXN-003",
    bookingRef: "VC-2026-003",
    customer: "Priya Sharma",
    host: "James Thornton",
    space: "Canary Wharf Boardroom",
    amount: 960,
    commission: 96,
    hostPayout: 864,
    status: "escrow_held",
    escrowStatus: "held",
    date: "23 May 2026",
    currency: "GBP",
  },
  {
    id: "TXN-004",
    bookingRef: "VC-2026-004",
    customer: "Tom Walker",
    host: "Marcus Williams",
    space: "Mayfair Boardroom",
    amount: 480,
    commission: 48,
    hostPayout: 432,
    status: "refunded",
    escrowStatus: "returned",
    date: "10 May 2026",
    currency: "GBP",
  },
  {
    id: "TXN-005",
    bookingRef: "VC-2026-005",
    customer: "Ahmed Khalid",
    host: "James Thornton",
    space: "The Shard Executive Suite",
    amount: 1740,
    commission: 174,
    hostPayout: 1566,
    status: "completed",
    escrowStatus: "released",
    date: "4 Jun 2026",
    currency: "GBP",
  },
];

const MOCK_DISPUTES = [
  {
    id: "DSP-001",
    bookingRef: "VC-2026-006",
    customer: "Sarah Mitchell",
    host: "Marcus Williams",
    space: "Mayfair Boardroom",
    amount: 780,
    reason: "Space not as described — AV equipment was broken",
    openedAt: "3 days ago",
    status: "open",
    priority: "high",
  },
  {
    id: "DSP-002",
    bookingRef: "VC-2026-007",
    customer: "Tom Walker",
    host: "Aisha Rahman",
    space: "DIFC Creative Studio",
    amount: 250,
    reason: "Cancellation refund not received after 7 days",
    openedAt: "5 days ago",
    status: "under_review",
    priority: "medium",
  },
  {
    id: "DSP-003",
    bookingRef: "VC-2026-008",
    customer: "Priya Sharma",
    host: "James Thornton",
    space: "The Shard Executive Suite",
    amount: 510,
    reason: "Host cancelled booking 2 hours before check-in",
    openedAt: "1 week ago",
    status: "resolved",
    priority: "low",
  },
];

const MOCK_LISTINGS = [
  {
    id: 1,
    title: "The Shard Executive Suite",
    location: "London Bridge, London",
    category: "Office Space",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    status: "live",
    pricing: { hour: 85, day: 580, month: 7800 },
    stats: { views: 1240, enquiries: 47, bookings: 23, revenue: 18650 },
    rating: 4.92,
    reviewCount: 47,
    capacity: 24,
    createdAt: "12 Jan 2026",
    lastBooked: "1 May 2026",
    instantBook: true,
    featured: true,
    host: "James Thornton",
  },
  {
    id: 2,
    title: "Canary Wharf Hot Desk Pod",
    location: "Canary Wharf, London",
    category: "Co-working",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    status: "live",
    pricing: { hour: 18, day: 95, month: 1200 },
    stats: { views: 873, enquiries: 31, bookings: 61, revenue: 5795 },
    rating: 4.75,
    reviewCount: 61,
    capacity: 1,
    createdAt: "3 Feb 2026",
    lastBooked: "15 May 2026",
    instantBook: true,
    featured: false,
    host: "James Thornton",
  },
  {
    id: 3,
    title: "Mayfair Boardroom",
    location: "Mayfair, London",
    category: "Meeting Rooms",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
    status: "paused",
    pricing: { hour: 120, day: 780 },
    stats: { views: 340, enquiries: 12, bookings: 8, revenue: 6240 },
    rating: 4.88,
    reviewCount: 8,
    capacity: 16,
    createdAt: "20 Mar 2026",
    lastBooked: "28 Apr 2026",
    instantBook: false,
    featured: false,
    host: "James Thornton",
  },
  {
    id: 4,
    title: "Shoreditch Photography Studio",
    location: "Shoreditch, London",
    category: "Studio Space",
    image:
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80",
    status: "draft",
    pricing: { hour: 65, day: 380 },
    stats: { views: 0, enquiries: 0, bookings: 0, revenue: 0 },
    rating: null,
    reviewCount: 0,
    capacity: 8,
    createdAt: "10 May 2026",
    lastBooked: null,
    instantBook: false,
    featured: false,
    host: "Marcus Williams",
  },
];

const NAV_ITEMS = [
  {
    label: "Overview",
    section: "overview",
    group: "DASHBOARD",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    section: "users",
    group: "MANAGEMENT",
    icon: Users,
    badge: { value: "2", tone: "gold" },
  },
  {
    label: "Listings",
    section: "listings",
    group: "MANAGEMENT",
    icon: Building2,
    badge: { value: "4", tone: "gold" },
  },
  {
    label: "Bookings",
    section: "bookings",
    group: "MANAGEMENT",
    icon: CalendarDays,
  },
  {
    label: "Payments",
    section: "payments",
    group: "MANAGEMENT",
    icon: CreditCard,
  },
  {
    label: "Disputes",
    section: "disputes",
    group: "MANAGEMENT",
    icon: AlertTriangle,
    badge: { value: "7", tone: "red" },
  },
  {
    label: "Analytics",
    section: "analytics",
    group: "PLATFORM",
    icon: BarChart2,
  },
  {
    label: "Commission",
    section: "commission",
    group: "PLATFORM",
    icon: Tag,
  },
  {
    label: "Markets",
    section: "markets",
    group: "PLATFORM",
    icon: Globe,
  },
  {
    label: "Broadcast",
    section: "broadcast",
    group: "PLATFORM",
    icon: Megaphone,
  },
  {
    label: "Content & Blog",
    section: "content",
    group: "PLATFORM",
    icon: MessageSquare,
  },
  {
    label: "Settings",
    section: "settings",
    group: "PLATFORM",
    icon: Settings,
  },
];

const SECTION_TITLES = {
  overview: "Overview",
  users: "Users",
  listings: "Listings",
  bookings: "Bookings",
  payments: "Payments",
  disputes: "Disputes",
  analytics: "Analytics",
  commission: "Commission",
  markets: "Markets",
  broadcast: "Broadcast",
  content: "Content & Blog",
  settings: "Settings",
};

const MOBILE_ADMIN_NAV = ["overview", "users", "listings", "payments", "disputes"];

const MARKET_OVERRIDES = [
  { market: "United Kingdom", rate: 10, active: true },
  { market: "Saudi Arabia", rate: 8, active: true },
  { market: "UAE", rate: 8, active: true },
  { market: "United States", rate: 12, active: false },
  { market: "Europe", rate: 10, active: true },
];

const FEATURE_FLAGS = [
  {
    key: "instantBook",
    name: "Instant Book",
    description: "Allow hosts to enable instant booking",
    enabled: true,
  },
  {
    key: "aiChat",
    name: "AI Chat Assistant",
    description: "Phase 2 — conversational space finder",
    enabled: false,
  },
  {
    key: "dynamicPricing",
    name: "Dynamic Pricing AI",
    description: "Phase 2 — AI pricing suggestions for hosts",
    enabled: false,
  },
  {
    key: "calendarSync",
    name: "Calendar Sync",
    description: "Allow hosts to connect external calendars",
    enabled: true,
  },
  {
    key: "kyc",
    name: "KYC Verification",
    description: "Require identity verification for large bookings",
    enabled: true,
  },
  {
    key: "referrals",
    name: "Referral Programme",
    description: "Enable host and customer referral tracking",
    enabled: false,
  },
  {
    key: "hostSubscriptions",
    name: "Host Subscriptions",
    description: "Enable Professional and Enterprise host tiers",
    enabled: false,
  },
  {
    key: "multiCurrency",
    name: "Multi-currency",
    description: "Show prices in user's local currency",
    enabled: true,
  },
];

function formatCurrency(value) {
  return `£${new Intl.NumberFormat("en-GB").format(value)}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getUserDisplayName(user = {}) {
  return user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "User";
}

function getUserRole(user = {}) {
  return user.isHost ? "host" : "customer";
}

function getUserStatus(user = {}) {
  if (user.isBanned) return "suspended";
  if (user.isVerified) return "active";
  return "pending";
}

function getListingStatus(listing = {}) {
  return listing.isActive ? "active" : "inactive";
}

function getListingPriceLabel(listing = {}) {
  if (listing.pricing?.hourly) return `${formatCurrency(listing.pricing.hourly)} / hr`;
  if (listing.pricing?.daily) return `${formatCurrency(listing.pricing.daily)} / day`;
  return "POA";
}

function getListingHostName(listing = {}) {
  return (
    listing.host?.displayName ||
    [listing.host?.firstName, listing.host?.lastName].filter(Boolean).join(" ") ||
    "Unknown host"
  );
}

function getBookingStatusLabel(status = "") {
  const normalized = String(status).toLowerCase();
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "completed") return "Completed";
  return "Pending";
}

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

function ToggleSwitch({ enabled, onChange, size = "md" }) {
  const width = size === "sm" ? 36 : 44;
  const height = size === "sm" ? 20 : 24;
  const circleSize = size === "sm" ? 16 : 20;
  const translateX = size === "sm" ? 16 : 20;

  return (
    <motion.button
      type="button"
      onClick={() => onChange(!enabled)}
      className="relative shrink-0 rounded-full p-[2px]"
      style={{
        width,
        height,
        background: enabled ? "#0A1628" : "#E5E7EB",
      }}
      animate={{ backgroundColor: enabled ? "#0A1628" : "#E5E7EB" }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className="block rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
        style={{ width: circleSize, height: circleSize }}
        animate={{ x: enabled ? translateX : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

function Toast({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-[#0A1628] px-5 py-3 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
        >
          <CheckCircle size={16} color="#16A34A" />
          <span>{message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function StatusPill({ status, type = "generic" }) {
  if (type === "listing") {
    const classes =
      status === "active" || status === "live"
        ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "paused"
        ? "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
        : "border-[rgba(107,114,128,0.2)] bg-[rgba(107,114,128,0.1)] text-[#6B7280]";
    const label =
      status === "active" || status === "live"
        ? "Active"
        : status === "inactive" || status === "draft"
        ? "Inactive"
        : status;

    return (
      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${classes}`}>
        {label}
      </span>
    );
  }

  if (type === "userStatus") {
    const classes =
      status === "active"
        ? "bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "suspended"
        ? "bg-[rgba(220,38,38,0.08)] text-[#DC2626]"
        : "bg-[rgba(217,119,6,0.1)] text-[#D97706]";
    return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}>{status}</span>;
  }

  if (type === "dispute") {
    const classes =
      status === "resolved"
        ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "under_review"
        ? "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
        : "border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.08)] text-[#DC2626]";
    return (
      <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${classes}`}>
        {status === "under_review" ? "Under Review" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  if (type === "payment") {
    const classes =
      status === "completed"
        ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "escrow_held"
        ? "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
        : "border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.08)] text-[#DC2626]";

    const StatusIcon =
      status === "completed" ? CheckCircle : status === "escrow_held" ? Clock : RefreshCw;
    const label =
      status === "completed" ? "Completed" : status === "escrow_held" ? "In Escrow" : "Refunded";

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-semibold ${classes}`}>
        <StatusIcon size={12} />
        {label}
      </span>
    );
  }

  if (type === "booking") {
    const classes =
      status === "confirmed"
        ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "pending"
        ? "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
        : status === "cancelled"
        ? "border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.08)] text-[#DC2626]"
        : "border-[rgba(107,114,128,0.2)] bg-[rgba(107,114,128,0.1)] text-[#6B7280]";

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-semibold ${classes}`}>
        {getBookingStatusLabel(status)}
      </span>
    );
  }

  return null;
}

function GrowthBadge({ value, positive = true }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        positive
          ? "bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
          : "bg-[rgba(220,38,38,0.1)] text-[#DC2626]"
      }`}
    >
      {value}
    </span>
  );
}

function AdminLayout({ children, activeSection, onSectionChange, searchQuery, setSearchQuery }) {
  const grouped = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8F6F0]">
      <aside className="fixed top-0 left-0 hidden h-screen w-[240px] shrink-0 flex-col bg-[#0A1628] lg:flex overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center gap-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/10 text-[#305CDE]">
              <Building2 size={18} />
            </span>
            <span className="text-[16px] font-bold">VenCome</span>
          </div>

          <span className="mt-3 inline-flex rounded-md border border-[rgba(48,92,222,0.3)] bg-[rgba(48,92,222,0.15)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#305CDE]">
            Admin Panel
          </span>

          <div className="my-4 border-t border-white/10" />

          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(48,92,222,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={18} color="#305CDE" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">Admin</p>
              <p className="text-[11px] text-white/50">Super Admin</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 pb-6">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 text-[10px] font-bold tracking-[0.15em] text-white/30">
                {group}
              </div>
              <div className="mt-2 space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.section;
                  return (
                    <motion.button
                      whileHover={{ x: 3 }}
                      key={item.section}
                      type="button"
                      onClick={() => onSectionChange(item.section)}
                      className={`mx-2 flex w-[calc(100%-16px)] items-center gap-3 rounded-[10px] px-[17px] py-[11px] text-left transition ${
                        isActive
                          ? "border-l-[3px] border-[#305CDE] bg-white/10 pl-[14px] text-white"
                          : "text-white/55 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1 text-[14px] font-medium">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                            item.badge.tone === "red" ? "bg-[#EF4444]" : "bg-[#305CDE]"
                          }`}
                        >
                          {item.badge.value}
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4">
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] text-white/50 transition hover:bg-white/8 hover:text-white"
            >
              <ExternalLink size={16} />
              <span>View Live Site</span>
            </button>
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] text-white/50 transition hover:bg-white/8 hover:text-white"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#F8F6F0] lg:ml-[240px]">
        <header className="flex min-h-[60px] flex-col gap-3 border-b border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-0">
          <h1 className="text-[16px] font-bold text-[#0A1628] sm:text-[17px]">
            {SECTION_TITLES[activeSection]}
          </h1>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-[13px] text-[#111827] outline-none focus:border-[#0A1628] sm:w-[240px]"
              />
            </div>

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280]"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#EF4444]" />
            </button>

            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(10,22,40,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="#0A1628" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-7 sm:pb-7">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-[100] flex h-[60px] bg-[#0A1628] lg:hidden">
        {MOBILE_ADMIN_NAV.map((sectionKey) => {
          const item = NAV_ITEMS.find((entry) => entry.section === sectionKey);
          const Icon = item.icon;
          const isActive = activeSection === sectionKey;

          return (
            <motion.button
              key={sectionKey}
              type="button"
              onClick={() => onSectionChange(sectionKey)}
              whileTap={{ scale: 0.97 }}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 text-center"
            >
              {isActive ? (
                <motion.div
                  layoutId="admin-nav-indicator"
                  className="absolute top-1.5 h-1.5 w-1.5 rounded-full bg-[#305CDE]"
                />
              ) : null}
              <Icon size={16} className={isActive ? "text-[#305CDE]" : "text-white/50"} />
              <span className={`text-[10px] ${isActive ? "text-white" : "text-white/50"}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

function BarChart({ data }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue));
  const maxBookings = Math.max(...data.map((item) => item.bookings));

  return (
    <div className="flex h-[160px] min-w-[520px] items-end gap-3 px-2 md:h-[200px]">
      {data.map((item, index) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full items-end gap-[3px]">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(item.revenue / maxRevenue) * 160}px` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
              className="min-h-1 flex-1 rounded-t-[4px] bg-[#0A1628]"
            />
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(item.bookings / maxBookings) * 160}px` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 + 0.1, ease: "easeOut" }}
              className="min-h-1 flex-1 rounded-t-[4px] bg-[#305CDE]"
            />
          </div>
          <span className="text-[11px] text-[#6B7280]">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ data }) {
  const colors = ["#0A1628", "#305CDE", "#1a2f4e", "#254FC7", "#374151", "#6B7280"];

  return (
    <div className="flex flex-col gap-3.5">
      {data.map((item, index) => (
        <div key={item.category}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#111827]">{item.category}</span>
            <span className="text-[12px] text-[#6B7280]">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-[#F3F4F6]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${item.percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              className="h-full rounded"
              style={{ backgroundColor: colors[index] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, growth, iconClasses, positive, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 md:px-6 md:py-5"
      style={{ willChange: "transform" }}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClasses}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6B7280]">
            {label}
          </p>
          <p className="mt-1 text-[28px] font-extrabold text-[#0A1628]">{value}</p>
          {growth ? (
            <div className="mt-2">
              <GrowthBadge value={growth} positive={positive} />
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function UserMenu({ user, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="absolute right-4 top-12 z-20 min-w-[180px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <UserMenuItem icon={Eye} label="View Profile" onClick={onClose} />
      {!user.isVerified ? <UserMenuItem icon={UserCheck} label="Verify User" onClick={onClose} /> : null}
      <UserMenuItem
        icon={ShieldOff}
        label={user.isBanned ? "Unsuspend" : "Suspend"}
        danger={!user.isBanned}
        onClick={onClose}
      />
      <UserMenuItem icon={Key} label="Reset Password" onClick={onClose} />
      <UserMenuItem icon={Trash2} label="Delete User" danger onClick={onClose} />
    </motion.div>
  );
}

function UserMenuItem({ icon: Icon, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13px] transition hover:bg-[#F8F6F0] ${
        danger ? "text-[#DC2626]" : "text-[#111827]"
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function OverviewSection({ onSectionChange, moderationQueue, setReviewOpenId, stats, loading }) {
  const totalRevenue = MOCK_CHART_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = MOCK_CHART_DATA.reduce((sum, item) => sum + item.bookings, 0);
  const avgMonthRevenue = Math.round(totalRevenue / MOCK_CHART_DATA.length);
  const activeDisputes = MOCK_DISPUTES.filter((item) => item.status !== "resolved");
  const totalUsersCount = useCountUp(stats.totalUsers);
  const totalListingsCount = useCountUp(stats.totalListings);
  const pendingListingsCount = useCountUp(stats.pendingListings);
  const activeUsersCount = useCountUp(stats.activeUsers);

  const metrics = [
    {
      icon: Users,
      label: "Total Users",
      value: formatNumber(totalUsersCount),
      growth: "",
      iconClasses: "bg-[rgba(10,22,40,0.06)] text-[#0A1628]",
      positive: true,
    },
    {
      icon: Building2,
      label: "Total Listings",
      value: formatNumber(totalListingsCount),
      growth: "",
      iconClasses: "bg-[rgba(48,92,222,0.1)] text-[#305CDE]",
      positive: true,
    },
    {
      icon: AlertTriangle,
      label: "Pending Listings",
      value: formatNumber(pendingListingsCount),
      growth: "",
      iconClasses: "bg-[rgba(239,68,68,0.1)] text-[#DC2626]",
      positive: true,
    },
    {
      icon: UserCheck,
      label: "Active Users",
      value: formatNumber(activeUsersCount),
      growth: "",
      iconClasses: "bg-[rgba(48,92,222,0.1)] text-[#305CDE]",
      positive: true,
    },
  ];

  return (
    <>
      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div
                key={`metric-skeleton-${index}`}
                className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-4 md:px-6 md:py-5"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-[#F3F4F6]" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-24 rounded-full bg-[#F3F4F6]" />
                    <div className="mt-2 h-8 w-28 rounded-lg bg-[#F3F4F6]" />
                    <div className="mt-3 h-5 w-16 rounded-full bg-[#F3F4F6]" />
                  </div>
                </div>
              </div>
            ))
          : metrics.map((metric, index) => <MetricCard key={metric.label} index={index} {...metric} />)}
      </div>

      <div className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-[16px] font-bold text-[#0A1628]">Bookings & Revenue</h3>
            <div className="flex items-center gap-2">
              {["7D", "1M", "3M", "6M", "1Y"].map((range, index) => (
                <button
                  key={range}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                    index === 4
                      ? "bg-[#0A1628] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <BarChart data={MOCK_CHART_DATA} />

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-[#6B7280]">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#0A1628]" />
              Revenue
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-[#305CDE]" />
              Bookings
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-[#374151]">
            <span>Total Revenue: {formatCurrency(totalRevenue)}</span>
            <span>Total Bookings: {formatNumber(totalBookings)}</span>
            <span>Avg per Month: {formatCurrency(avgMonthRevenue)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-5 text-[16px] font-bold text-[#0A1628]">Listings by Category</h3>
          <HorizontalBars data={MOCK_CATEGORY_DATA} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#0A1628]">Pending Review</h3>
            <button
              type="button"
              onClick={() => onSectionChange("listings")}
              className="inline-flex items-center gap-1 text-[13px] text-[#305CDE] hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {moderationQueue.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-3 border-b border-[#F3F4F6] py-3 last:border-b-0"
            >
              <img src={listing.image} alt={listing.title} className="h-10 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#0A1628]">{listing.title}</p>
                <p className="text-[12px] text-[#6B7280]">{listing.host}</p>
                <p className="text-[11px] text-[#9CA3AF]">{listing.submittedAt}</p>
                {listing.flags.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {listing.flags.map((flag) => (
                      <span
                        key={flag}
                        className="rounded-md border border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] px-1.5 py-0.5 text-[10px] font-semibold text-[#D97706]"
                      >
                        {flag === "unverified_host" ? "Unverified Host" : "New Host"}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewOpenId(listing.id);
                  onSectionChange("listings");
                }}
                className="rounded-lg bg-[#305CDE] px-3 py-1.5 text-[12px] font-semibold text-white"
              >
                Review
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#0A1628]">Active Disputes</h3>
            <button
              type="button"
              onClick={() => onSectionChange("disputes")}
              className="inline-flex items-center gap-1 text-[13px] text-[#305CDE] hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {activeDisputes.map((dispute) => (
            <div
              key={dispute.id}
              className="flex items-start gap-3 border-b border-[#F3F4F6] py-3 last:border-b-0"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  dispute.priority === "high"
                    ? "bg-[#EF4444]"
                    : dispute.priority === "medium"
                    ? "bg-[#D97706]"
                    : "bg-[#16A34A]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-[#6B7280]">{dispute.id}</p>
                <p className="truncate text-[13px] font-semibold text-[#0A1628]">{dispute.space}</p>
                <p className="truncate text-[12px] text-[#6B7280]">{dispute.reason}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#374151]">
                  {formatCurrency(dispute.amount)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <StatusPill status={dispute.status} type="dispute" />
                <button
                  type="button"
                  className="mt-2 block text-[13px] text-[#305CDE] hover:underline"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function UsersSection({
  users,
  totalUsers,
  loading,
  userQuery,
  setUserQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  activeUserTab,
  setActiveUserTab,
  openUserMenuId,
  setOpenUserMenuId,
}) {
  const tabs = [
    { key: "all", label: `All (${users.length})` },
    { key: "customers", label: `Customers (${users.filter((item) => getUserRole(item) === "customer").length})` },
    { key: "hosts", label: `Hosts (${users.filter((item) => getUserRole(item) === "host").length})` },
    { key: "unverified", label: `Unverified (${users.filter((item) => !item.isVerified).length})` },
    { key: "suspended", label: `Suspended (${users.filter((item) => item.isBanned).length})` },
    { key: "pending", label: `Pending (${users.filter((item) => !item.isVerified && !item.isBanned).length})` },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Users</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">{formatNumber(totalUsers)} registered users</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Search users..."
              className="h-10 w-[280px] rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[#0A1628]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
          >
            <option>All Roles</option>
            <option>Customer</option>
            <option>Host</option>
            <option>Agent</option>
            <option>Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveUserTab(tab.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
              activeUserTab === tab.key
                ? "bg-[#0A1628] text-white"
                : "border border-[#E5E7EB] bg-white text-[#111827]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F6F0]">
                {["User", "Role", "Status", "Email", "Joined", "Verification", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={`user-skeleton-${index}`} className="border-b border-[#F3F4F6]">
                    {Array.from({ length: 7 }, (_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3.5">
                        <div className="h-4 w-full rounded-full bg-[#F3F4F6]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[14px] text-[#6B7280]">
                    No data yet
                  </td>
                </tr>
              ) : (
                users.slice(0, 10).map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-[#F3F4F6] transition hover:bg-[#FAFAFA]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={user.profileImage} alt={getUserDisplayName(user)} className="h-9 w-9 rounded-full object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[13px] font-semibold text-[#0A1628]">{getUserDisplayName(user)}</p>
                          {user.isVerified ? <UserCheck size={12} className="text-[#305CDE]" /> : null}
                          {user.isBanned ? (
                            <span className="rounded-full bg-[rgba(220,38,38,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[#DC2626]">
                              Banned
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-[12px] text-[#6B7280]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        getUserRole(user) === "customer"
                          ? "bg-[rgba(10,22,40,0.06)] text-[#0A1628]"
                          : getUserRole(user) === "host"
                          ? "bg-[rgba(48,92,222,0.12)] text-[#254FC7]"
                          : "bg-[rgba(239,68,68,0.1)] text-[#DC2626]"
                      }`}
                    >
                      {getUserRole(user) === "host" ? "Host" : "Customer"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={getUserStatus(user)} type="userStatus" />
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#374151]">{user.email}</td>
                  <td className="px-4 py-3.5 text-[13px] text-[#6B7280]">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#374151]">{user.isVerified ? "Verified" : "Unverified"}</td>
                  <td className="relative px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenUserMenuId((current) => (current === user._id ? null : user._id))}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#0A1628] hover:text-white"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <AnimatePresence>
                      {openUserMenuId === user._id ? (
                        <UserMenu user={user} onClose={() => setOpenUserMenuId(null)} />
                      ) : null}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`user-mobile-skeleton-${index}`} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="h-4 w-32 rounded-full bg-[#F3F4F6]" />
                <div className="mt-3 h-3 w-40 rounded-full bg-[#F3F4F6]" />
                <div className="mt-3 h-8 w-full rounded-lg bg-[#F3F4F6]" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center text-[14px] text-[#6B7280]">
              No data yet
            </div>
          ) : (
            users.slice(0, 10).map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={user.profileImage} alt={getUserDisplayName(user)} className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#0A1628]">{getUserDisplayName(user)}</p>
                    <p className="truncate text-[12px] text-[#6B7280]">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] rounded-full border border-[#E5E7EB] text-[#6B7280]"
                >
                  <MoreHorizontal size={16} className="mx-auto" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    getUserRole(user) === "customer"
                      ? "bg-[rgba(10,22,40,0.06)] text-[#0A1628]"
                      : getUserRole(user) === "host"
                      ? "bg-[rgba(48,92,222,0.12)] text-[#254FC7]"
                      : "bg-[rgba(239,68,68,0.1)] text-[#DC2626]"
                  }`}
                >
                  {getUserRole(user) === "host" ? "Host" : "Customer"}
                </span>
                <StatusPill status={getUserStatus(user)} type="userStatus" />
                {user.isBanned ? (
                  <span className="rounded-full bg-[rgba(220,38,38,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[#DC2626]">
                    Banned
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-[12px] text-[#374151]">{user.isVerified ? "Verified" : "Unverified"}</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">{formatDate(user.createdAt)}</p>
              <button
                type="button"
                className="mt-4 min-h-[44px] rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#111827]"
              >
                View Actions
              </button>
            </motion.div>
          ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-[#6B7280]">
            Showing {users.length ? `1–${Math.min(users.length, 10)}` : "0"} of {formatNumber(totalUsers)} users
          </p>
          <div className="flex items-center gap-2">
            {["1", "2", "3"].map((page, index) => (
              <button
                key={page}
                type="button"
                className={`h-10 w-10 rounded-lg text-[14px] ${
                  index === 0 ? "bg-[#0A1628] text-white" : "border border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ListingsSection({
  listings,
  loading,
  moderationQueue,
  setModerationQueue,
  listingQueueFilter,
  setListingQueueFilter,
  reviewOpenId,
  setReviewOpenId,
  rejectionState,
  setRejectionState,
  onToast,
}) {
  const filteredQueue = moderationQueue.filter((listing) => {
    if (listingQueueFilter === "flagged") return listing.flags.length > 0;
    if (listingQueueFilter === "new_host") return listing.flags.includes("new_host");
    return true;
  });

  const removeQueueItem = (id) => {
    setModerationQueue((current) => current.filter((item) => item.id !== id));
    setReviewOpenId(null);
    setRejectionState({ id: null, reason: "" });
  };

  return (
    <>
      <div className="mb-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] px-5 py-5 md:flex-row md:items-center md:justify-between">
          <h3 className="text-[15px] font-bold text-[#0A1628]">Pending Review ({filteredQueue.length})</h3>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "flagged", label: "Flagged" },
              { key: "new_host", label: "New Host" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setListingQueueFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                  listingQueueFilter === tab.key
                    ? "bg-[#0A1628] text-white"
                    : "border border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filteredQueue.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ x: -100, opacity: 0 }}
              className="border-b border-[#F3F4F6] px-5 py-4 last:border-b-0"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <img src={listing.image} alt={listing.title} className="h-16 w-20 rounded-[10px] object-cover" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[15px] font-bold text-[#0A1628]">{listing.title}</h4>
                    <span className="rounded-full bg-[rgba(10,22,40,0.06)] px-2.5 py-1 text-[11px] font-semibold text-[#0A1628]">
                      {listing.category}
                    </span>
                  </div>

                  <p className="mt-1 text-[13px] text-[#6B7280]">{listing.location}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#374151]">
                    <span>
                      By <span className="font-semibold">{listing.host}</span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        listing.flags.includes("unverified_host") || listing.flags.includes("new_host")
                          ? "bg-[rgba(217,119,6,0.1)] text-[#D97706]"
                          : "bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
                      }`}
                    >
                      {listing.flags.includes("unverified_host") || listing.flags.includes("new_host")
                        ? "Unverified"
                        : "Verified"}
                    </span>
                    <span className="text-[#6B7280]">submitted {listing.submittedAt}</span>
                  </div>

                  <p className="mt-2 text-[14px] font-semibold text-[#305CDE]">
                    {formatCurrency(listing.price)} / {listing.priceUnit}
                  </p>

                  {listing.flags.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {listing.flags.map((flag) => (
                        <span
                          key={flag}
                          className="rounded-md border border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] px-2 py-1 text-[10px] font-semibold text-[#D97706]"
                        >
                          {flag === "unverified_host" ? "Unverified Host" : "New Host"}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827]"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeQueueItem(listing.id);
                      onToast("Listing approved and published");
                    }}
                    className="rounded-lg border border-[rgba(22,163,74,0.3)] bg-[rgba(22,163,74,0.1)] px-4 py-2 text-[13px] font-semibold text-[#16A34A] transition hover:bg-[#16A34A] hover:text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionState({ id: listing.id, reason: "" })}
                    className="rounded-lg border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.08)] px-4 py-2 text-[13px] font-semibold text-[#DC2626] transition hover:bg-[#DC2626] hover:text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {rejectionState.id === listing.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F8F6F0] p-4">
                      <label className="mb-2 block text-[12px] font-semibold text-[#0A1628]">
                        Rejection reason (optional)
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={rejectionState.reason}
                          onChange={(event) =>
                            setRejectionState({ id: listing.id, reason: event.target.value })
                          }
                          className="h-10 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            removeQueueItem(listing.id);
                            onToast("Listing rejected and removed from queue");
                          }}
                          className="rounded-lg bg-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white"
                        >
                          Confirm Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectionState({ id: null, reason: "" })}
                          className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] text-[#6B7280]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-5">
          <h3 className="text-[15px] font-bold text-[#0A1628]">All Listings</h3>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F6F0]">
                {["Listing", "City", "Host", "Status", "Created", "Price", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={`listing-skeleton-${index}`} className="border-b border-[#F3F4F6]">
                    {Array.from({ length: 7 }, (_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3.5">
                        <div className="h-4 w-full rounded-full bg-[#F3F4F6]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[14px] text-[#6B7280]">
                    No data yet
                  </td>
                </tr>
              ) : (
                listings.slice(0, 10).map((listing, index) => (
                <motion.tr
                  key={listing._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-[#F3F4F6] transition hover:bg-[#FAFAFA]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={listing.coverImage} alt={listing.title} className="h-12 w-16 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0A1628]">{listing.title}</p>
                        <p className="truncate text-[12px] text-[#6B7280]">{listing.location?.city || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#374151]">{listing.location?.city || ""}</td>
                  <td className="px-4 py-3.5 text-[13px] text-[#374151]">{getListingHostName(listing)}</td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={getListingStatus(listing)} type="listing" />
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#6B7280]">{formatDate(listing.createdAt)}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#305CDE]">{getListingPriceLabel(listing)}</td>
                  <td className="px-4 py-3.5">
                    <a
                      href={`/property/${listing._id}`}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#111827]"
                    >
                      View
                    </a>
                  </td>
                </motion.tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`listing-mobile-skeleton-${index}`} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                <div className="h-4 w-36 rounded-full bg-[#F3F4F6]" />
                <div className="mt-3 h-3 w-28 rounded-full bg-[#F3F4F6]" />
                <div className="mt-3 h-8 w-full rounded-lg bg-[#F3F4F6]" />
              </div>
            ))
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-center text-[14px] text-[#6B7280]">
              No data yet
            </div>
          ) : (
            listings.slice(0, 10).map((listing, index) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mt-1 break-words text-[13px] font-semibold text-[#0A1628]">{listing.title}</p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">{listing.location?.city || ""}</p>
                  </div>
                  <StatusPill status={getListingStatus(listing)} type="listing" />
                </div>
                <p className="mt-3 text-[12px] text-[#374151]">{getListingHostName(listing)}</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">{formatDate(listing.createdAt)}</p>
                <div className="mt-4">
                  <a
                    href={`/property/${listing._id}`}
                    className="inline-flex rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#111827]"
                  >
                    View
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function BookingsSection({ bookings, loading }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  const getUserName = (user) =>
    user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "—";

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Bookings</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">All bookings across the platform</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                statusFilter === s
                  ? "bg-[#0A1628] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#111827]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F6F0]">
                {["Ref", "Property", "Customer", "Host", "Check In", "Check Out", "Total", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6]">
                    {Array.from({ length: 8 }, (_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 w-full rounded-full bg-[#F3F4F6]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-[14px] text-[#6B7280]">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 20).map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[#F3F4F6] transition hover:bg-[#FAFAFA]"
                  >
                    <td className="px-4 py-3.5 font-mono text-[12px] text-[#6B7280]">
                      {booking._id?.toString().slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="max-w-[180px] truncate text-[13px] font-semibold text-[#0A1628]">
                        {booking.property?.title || "—"}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">{booking.property?.location?.city || ""}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-[#374151]">{getUserName(booking.customer)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[#374151]">{getUserName(booking.host)}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[#6B7280]">{formatDate(booking.checkIn)}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[#6B7280]">{formatDate(booking.checkOut)}</td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#0A1628]">
                      {formatCurrency(booking.totalPrice || 0)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={booking.status} type="booking" />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PaymentsSection({
  paymentsFilter,
  setPaymentsFilter,
  paymentsRange,
  setPaymentsRange,
  onToast,
}) {
  const filteredTransactions = MOCK_TRANSACTIONS.filter((transaction) => {
    if (paymentsFilter === "all") return true;
    if (paymentsFilter === "completed") return transaction.status === "completed";
    if (paymentsFilter === "escrow_held") return transaction.status === "escrow_held";
    return transaction.status === "refunded";
  });

  const gmv = MOCK_TRANSACTIONS.reduce((sum, item) => sum + item.amount, 0);
  const revenue = MOCK_TRANSACTIONS.reduce((sum, item) => sum + item.commission, 0);

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Payments & Escrow</h2>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={paymentsRange}
            onChange={(event) => setPaymentsRange(event.target.value)}
            className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>All time</option>
          </select>

          <button
            type="button"
            onClick={() => onToast("CSV export started")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-medium text-[#111827]"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: PoundSterling,
            label: "Total GMV",
            value: "£284,650",
            classes: "bg-[rgba(10,22,40,0.06)] text-[#0A1628]",
          },
          {
            icon: TrendingUp,
            label: "Platform Revenue",
            value: "£28,465",
            classes: "bg-[rgba(22,163,74,0.1)] text-[#16A34A]",
          },
          {
            icon: Clock,
            label: "In Escrow",
            value: "£14,200",
            classes: "bg-[rgba(217,119,6,0.1)] text-[#D97706]",
          },
          {
            icon: RefreshCw,
            label: "Awaiting Payout",
            value: "£8,640",
            classes: "bg-[rgba(48,92,222,0.1)] text-[#305CDE]",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.classes}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">{item.label}</p>
                  <p className="mt-1 text-[24px] font-extrabold text-[#0A1628]">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "completed", label: "Completed" },
              { key: "escrow_held", label: "In Escrow" },
              { key: "refunded", label: "Refunded" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPaymentsFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium ${
                  paymentsFilter === tab.key
                    ? "bg-[#0A1628] text-white"
                    : "border border-[#E5E7EB] bg-white text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F6F0]">
                {[
                  "Transaction ID",
                  "Booking",
                  "Customer to Host",
                  "Amount",
                  "Commission",
                  "Host Payout",
                  "Status",
                  "Date",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-[#F3F4F6] transition hover:bg-[#FAFAFA]"
                >
                  <td className="px-4 py-3.5 font-mono text-[12px] text-[#6B7280]">{transaction.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] font-semibold text-[#374151]">{transaction.bookingRef}</p>
                    <p className="max-w-[220px] truncate text-[12px] text-[#6B7280]">{transaction.space}</p>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#374151]">
                    <span className="inline-flex items-center gap-2">
                      <span>{transaction.customer}</span>
                      <ArrowRight size={13} />
                      <span>{transaction.host}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[14px] font-bold text-[#0A1628]">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#305CDE]">
                    {formatCurrency(transaction.commission)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#16A34A]">
                    {formatCurrency(transaction.hostPayout)}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={transaction.status} type="payment" />
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#6B7280]">{transaction.date}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className="text-[13px] font-medium text-[#305CDE]">
                        View
                      </button>
                      {transaction.status === "escrow_held" ? (
                        <button
                          type="button"
                          onClick={() => onToast("Funds released to host")}
                          className="rounded-lg bg-[#0A1628] px-3 py-2 text-[12px] font-semibold text-white"
                        >
                          Release Funds
                        </button>
                      ) : null}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DisputesSection({
  disputes,
  setDisputes,
  disputesFilter,
  setDisputesFilter,
  confirmResolution,
  setConfirmResolution,
  resolvedFlashId,
  onToast,
}) {
  const filteredDisputes = disputes.filter((dispute) => {
    if (disputesFilter === "all") return true;
    return dispute.status === disputesFilter;
  });

  const resolveDispute = (id) => {
    setDisputes((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "resolved" } : item))
    );
  };

  const tabs = [
    { key: "all", label: `All (${disputes.length})` },
    { key: "open", label: `Open (${disputes.filter((item) => item.status === "open").length})` },
    {
      key: "under_review",
      label: `Under Review (${disputes.filter((item) => item.status === "under_review").length})`,
    },
    {
      key: "resolved",
      label: `Resolved (${disputes.filter((item) => item.status === "resolved").length})`,
    },
  ];

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Dispute Resolution</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">7 active disputes requiring attention</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setDisputesFilter(tab.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              disputesFilter === tab.key
                ? "bg-[#0A1628] text-white"
                : "border border-[#E5E7EB] bg-white text-[#111827]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredDisputes.map((dispute) => {
          const actionable = dispute.status === "open" || dispute.status === "under_review";
          return (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                boxShadow:
                  resolvedFlashId === dispute.id
                    ? "0 0 0 2px rgba(22,163,74,0.45)"
                    : "0 0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border border-[#E5E7EB] bg-white p-5 ${
                dispute.priority === "high"
                  ? "border-l-4 border-l-[#EF4444]"
                  : dispute.priority === "medium"
                  ? "border-l-4 border-l-[#D97706]"
                  : "border-l-4 border-l-[#16A34A]"
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-[#6B7280]">{dispute.id}</p>
                    <h3 className="mt-1 text-[16px] font-bold text-[#0A1628]">{dispute.space}</h3>
                    <p className="text-[13px] text-[#6B7280]">{dispute.bookingRef}</p>
                  </div>
                  <StatusPill status={dispute.status} type="dispute" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[rgba(10,22,40,0.06)] px-3 py-2 text-[13px] text-[#111827]">
                    <User size={14} />
                    {dispute.customer}
                  </span>
                  <ArrowRight size={14} className="text-[#6B7280]" />
                  <span className="inline-flex items-center gap-2 rounded-lg bg-[rgba(10,22,40,0.06)] px-3 py-2 text-[13px] text-[#111827]">
                    <Building2 size={14} />
                    {dispute.host}
                  </span>
                </div>

                <div>
                  <p className="text-[15px] font-bold text-[#0A1628]">
                    {formatCurrency(dispute.amount)} in dispute
                  </p>
                  <p className="mt-1 text-[13px] italic leading-6 text-[#374151]">{dispute.reason}</p>
                </div>

                <p className="inline-flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <Clock size={13} />
                  Opened {dispute.openedAt}
                </p>

                <AnimatePresence mode="wait">
                  {confirmResolution.id === dispute.id ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-xl bg-[#F8F6F0] p-4"
                    >
                      <p className="text-[13px] text-[#111827]">
                        Release {formatCurrency(dispute.amount)} to {confirmResolution.party}? This cannot be undone.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            resolveDispute(dispute.id);
                            setConfirmResolution({ id: null, party: null, tone: null });
                            onToast(`Funds released to ${confirmResolution.party.toLowerCase()} and dispute resolved`);
                          }}
                          className={`rounded-lg px-4 py-2 text-[13px] font-semibold text-white ${
                            confirmResolution.tone === "gold" ? "bg-[#305CDE]" : "bg-[#DC2626]"
                          }`}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmResolution({ id: null, party: null, tone: null })}
                          className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] text-[#6B7280]"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex flex-wrap gap-2"
                    >
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827]"
                      >
                        <ExternalLink size={14} />
                        <span className="hidden sm:inline">View Full Dispute</span>
                        <span className="sm:hidden">View</span>
                      </button>
                      <button
                        type="button"
                        className="hidden min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827] sm:inline-flex"
                      >
                        <MessageSquare size={14} />
                        Contact Customer
                      </button>
                      <button
                        type="button"
                        className="hidden min-h-[44px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827] sm:inline-flex"
                      >
                        <MessageSquare size={14} />
                        Contact Host
                      </button>
                      {actionable ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmResolution({
                                id: dispute.id,
                                party: "Customer",
                                tone: "red",
                              })
                            }
                            className="min-h-[44px] rounded-lg bg-[#305CDE] px-3.5 py-2 text-[13px] font-semibold text-white"
                          >
                            <span className="hidden sm:inline">Release to Customer</span>
                            <span className="sm:hidden">Release</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmResolution({
                                id: dispute.id,
                                party: "Host",
                                tone: "gold",
                              })
                            }
                            className="hidden min-h-[44px] rounded-lg bg-[#0A1628] px-3.5 py-2 text-[13px] font-semibold text-white sm:inline-flex sm:items-center"
                          >
                            Release to Host
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resolveDispute(dispute.id);
                              onToast("Dispute marked as resolved");
                            }}
                            className="hidden min-h-[44px] rounded-lg bg-[rgba(22,163,74,0.1)] px-3.5 py-2 text-[13px] font-semibold text-[#16A34A] sm:inline-flex sm:items-center"
                          >
                            Mark Resolved
                          </button>
                        </>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function CommissionSection({ globalCommission, setGlobalCommission, marketOverrides, setMarketOverrides, onToast }) {
  return (
    <div className="max-w-[640px] rounded-[20px] border border-[#E5E7EB] bg-white p-4 md:p-8">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Commission Rate Settings</h2>
      <p className="mt-2 text-[14px] text-[#6B7280]">
        Adjust the platform commission rate globally or by market segment. Changes apply to new bookings only.
      </p>

      <div className="mt-6">
        <label className="text-[13px] font-semibold text-[#0A1628]">Global Commission Rate</label>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            value={globalCommission}
            onChange={(event) => setGlobalCommission(event.target.value)}
            className="h-14 w-[100px] rounded-xl border-2 border-[#E5E7EB] text-center text-[28px] font-extrabold text-[#0A1628] outline-none focus:border-[#0A1628]"
          />
          <span className="text-[20px] text-[#6B7280]">%</span>
        </div>
        <p className="mt-2 text-[12px] text-[#6B7280]">
          Currently applied to all markets unless overridden below
        </p>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-xl border border-[#E5E7EB] md:block">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] gap-4 bg-[#F8F6F0] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
          <span>Market</span>
          <span>Override Rate</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {marketOverrides.map((row) => {
          const changed = row.rate !== row.originalRate || row.active !== row.originalActive;
          return (
            <div
              key={row.market}
              className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] items-center gap-4 border-t border-[#F3F4F6] px-4 py-3"
            >
              <span className="text-[14px] font-semibold text-[#0A1628]">{row.market}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(event) =>
                    setMarketOverrides((current) =>
                      current.map((item) =>
                        item.market === row.market ? { ...item, rate: Number(event.target.value) } : item
                      )
                    )
                  }
                  className="h-9 w-[60px] rounded-lg border border-[#E5E7EB] px-2 text-[13px] text-[#111827] outline-none focus:border-[#0A1628]"
                />
                <span className="text-[13px] text-[#6B7280]">%</span>
              </div>
              <ToggleSwitch
                enabled={row.active}
                onChange={(value) =>
                  setMarketOverrides((current) =>
                    current.map((item) => (item.market === row.market ? { ...item, active: value } : item))
                  )
                }
                size="sm"
              />
              <div>
                {changed ? (
                  <button
                    type="button"
                    onClick={() =>
                      setMarketOverrides((current) =>
                        current.map((item) =>
                          item.market === row.market
                            ? { ...item, originalRate: item.rate, originalActive: item.active }
                            : item
                        )
                      )
                    }
                    className="rounded-lg bg-[#305CDE] px-3 py-1.5 text-[12px] font-semibold text-white"
                  >
                    Save
                  </button>
                ) : (
                  <span className="text-[12px] text-[#9CA3AF]">Edit</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-3 md:hidden">
        {marketOverrides.map((row) => {
          const changed = row.rate !== row.originalRate || row.active !== row.originalActive;
          return (
            <div key={row.market} className="rounded-xl border border-[#E5E7EB] p-4">
              <p className="text-[14px] font-semibold text-[#0A1628]">{row.market}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={row.rate}
                    onChange={(event) =>
                      setMarketOverrides((current) =>
                        current.map((item) =>
                          item.market === row.market ? { ...item, rate: Number(event.target.value) } : item
                        )
                      )
                    }
                    className="h-9 w-[60px] rounded-lg border border-[#E5E7EB] px-2 text-[13px] text-[#111827] outline-none focus:border-[#0A1628]"
                  />
                  <span className="text-[13px] text-[#6B7280]">%</span>
                </div>
                <ToggleSwitch
                  enabled={row.active}
                  onChange={(value) =>
                    setMarketOverrides((current) =>
                      current.map((item) => (item.market === row.market ? { ...item, active: value } : item))
                    )
                  }
                  size="sm"
                />
              </div>
              {changed ? (
                <button
                  type="button"
                  onClick={() =>
                    setMarketOverrides((current) =>
                      current.map((item) =>
                        item.market === row.market
                          ? { ...item, originalRate: item.rate, originalActive: item.active }
                          : item
                      )
                    )
                  }
                  className="mt-3 rounded-lg bg-[#305CDE] px-3 py-2 text-[12px] font-semibold text-white"
                >
                  Save
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => onToast("Commission settings saved")}
          className="rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
}

function SettingsRow({ label, children, note }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#F3F4F6] py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[14px] font-semibold text-[#0A1628]">{label}</p>
        {note ? <p className="mt-1 text-[12px] text-[#6B7280]">{note}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsSection({
  settingsTab,
  setSettingsTab,
  generalSettings,
  setGeneralSettings,
  featureFlags,
  setFeatureFlags,
}) {
  const tabs = ["General", "Security", "Notifications", "Feature Flags"];

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSettingsTab(tab)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              settingsTab === tab
                ? "bg-[#0A1628] text-white"
                : "border border-[#E5E7EB] bg-white text-[#111827]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {settingsTab === "General" ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <SettingsRow label="Platform Name">
            <input
              value={generalSettings.platformName}
              onChange={(event) =>
                setGeneralSettings((current) => ({ ...current, platformName: event.target.value }))
              }
              className="h-10 w-[220px] rounded-lg border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
            />
          </SettingsRow>
          <SettingsRow label="Support Email">
            <input
              value={generalSettings.supportEmail}
              onChange={(event) =>
                setGeneralSettings((current) => ({ ...current, supportEmail: event.target.value }))
              }
              className="h-10 w-[260px] rounded-lg border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
            />
          </SettingsRow>
          <SettingsRow label="Default Currency">
            <select
              value={generalSettings.currency}
              onChange={(event) =>
                setGeneralSettings((current) => ({ ...current, currency: event.target.value }))
              }
              className="h-10 rounded-lg border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
            >
              <option>GBP</option>
              <option>USD</option>
              <option>EUR</option>
              <option>AED</option>
              <option>SAR</option>
            </select>
          </SettingsRow>
          <SettingsRow
            label="Maintenance Mode"
            note={generalSettings.maintenance ? "Platform will be unavailable to users" : undefined}
          >
            <ToggleSwitch
              enabled={generalSettings.maintenance}
              onChange={(value) => setGeneralSettings((current) => ({ ...current, maintenance: value }))}
            />
          </SettingsRow>
          <SettingsRow
            label="New User Registrations"
            note={!generalSettings.registrations ? "Registration is disabled" : undefined}
          >
            <ToggleSwitch
              enabled={generalSettings.registrations}
              onChange={(value) => setGeneralSettings((current) => ({ ...current, registrations: value }))}
            />
          </SettingsRow>
          <SettingsRow label="Host Applications">
            <ToggleSwitch
              enabled={generalSettings.hostApplications}
              onChange={(value) =>
                setGeneralSettings((current) => ({ ...current, hostApplications: value }))
              }
            />
          </SettingsRow>
        </div>
      ) : null}

      {settingsTab === "Feature Flags" ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          {featureFlags.map((flag) => (
            <div
              key={flag.key}
              className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] py-3.5 last:border-b-0"
            >
              <div>
                <p className="text-[14px] font-semibold text-[#0A1628]">{flag.name}</p>
                <p className="mt-1 text-[12px] text-[#6B7280]">{flag.description}</p>
              </div>
              <ToggleSwitch
                enabled={flag.enabled}
                onChange={(value) =>
                  setFeatureFlags((current) =>
                    current.map((item) => (item.key === flag.key ? { ...item, enabled: value } : item))
                  )
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      {settingsTab === "Security" ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <SettingsRow label="Admin 2FA" note="Require two-factor authentication for admin access">
            <ToggleSwitch enabled onChange={() => {}} />
          </SettingsRow>
          <SettingsRow label="Session Timeout">
            <select className="h-10 rounded-lg border border-[#E5E7EB] px-3 text-[13px] outline-none">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
            </select>
          </SettingsRow>
        </div>
      ) : null}

      {settingsTab === "Notifications" ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <SettingsRow label="Critical Alerts">
            <ToggleSwitch enabled onChange={() => {}} />
          </SettingsRow>
          <SettingsRow label="Daily Summary Emails">
            <ToggleSwitch enabled onChange={() => {}} />
          </SettingsRow>
          <SettingsRow label="Dispute Escalations">
            <ToggleSwitch enabled onChange={() => {}} />
          </SettingsRow>
        </div>
      ) : null}
    </>
  );
}

function PlaceholderSection({ title }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-8 py-16 text-center">
      <h2 className="text-[20px] font-extrabold text-[#0A1628]">{title}</h2>
      <p className="mt-2 text-[13px] text-[#6B7280]">
        This area is reserved for a later admin phase.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const token = localStorage.getItem("vencome_token");
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingListings: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  const [moderationQueue, setModerationQueue] = useState([]);
  const [listingQueueFilter, setListingQueueFilter] = useState("all");
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [rejectionState, setRejectionState] = useState({ id: null, reason: "" });

  const [userQuery, setUserQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeUserTab, setActiveUserTab] = useState("all");
  const [openUserMenuId, setOpenUserMenuId] = useState(null);

  const [paymentsFilter, setPaymentsFilter] = useState("all");
  const [paymentsRange, setPaymentsRange] = useState("Last 30 days");

  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [disputesFilter, setDisputesFilter] = useState("all");
  const [confirmResolution, setConfirmResolution] = useState({
    id: null,
    party: null,
    tone: null,
  });
  const [resolvedFlashId, setResolvedFlashId] = useState(null);

  const [globalCommission, setGlobalCommission] = useState("10");
  const [marketOverrides, setMarketOverrides] = useState(
    MARKET_OVERRIDES.map((item) => ({
      ...item,
      originalRate: item.rate,
      originalActive: item.active,
    }))
  );

  const [settingsTab, setSettingsTab] = useState("General");
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "VenCome",
    supportEmail: "support@vencome.com",
    currency: "GBP",
    maintenance: false,
    registrations: true,
    hostApplications: true,
  });
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!resolvedFlashId) return undefined;
    const timer = window.setTimeout(() => setResolvedFlashId(null), 800);
    return () => window.clearTimeout(timer);
  }, [resolvedFlashId]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, listingsRes, bookingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/admin/users`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/properties?limit=100`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/admin/bookings?limit=50`, { headers }),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const allUsers = usersData.users || [];
          setUsers(allUsers);
          setStats((prev) => ({
            ...prev,
            totalUsers: usersData.total || allUsers.length,
            activeUsers: allUsers.filter((user) => !user.isBanned).length,
          }));
        }

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          const allListings = listingsData.properties || [];
          setListings(allListings);
          setStats((prev) => ({
            ...prev,
            totalListings: listingsData.total || allListings.length,
            pendingListings: allListings.filter((listing) => !listing.isActive).length,
          }));
          setModerationQueue(
            allListings
              .filter((listing) => !listing.isActive)
              .slice(0, 10)
              .map((listing) => ({
                id: listing._id,
                title: listing.title,
                host: getListingHostName(listing),
                category: listing.category?.name || "",
                location: listing.location?.city || "",
                price: listing.pricing?.hourly || listing.pricing?.daily || 0,
                priceUnit: listing.pricing?.hourly ? "hour" : "day",
                submittedAt: formatDate(listing.createdAt),
                status: "pending_review",
                image: listing.coverImage,
                flags: [],
              }))
          );
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          const allBookings = bookingsData.bookings || [];
          setBookings(allBookings);
          setStats((prev) => ({
            ...prev,
            totalBookings: bookingsData.total || allBookings.length,
            totalRevenue: allBookings
              .filter((b) => b.status === "confirmed" || b.status === "completed")
              .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
          }));
        }

      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const showToast = (message) => {
    setToastMessage(message);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        `${getUserDisplayName(user)} ${user.email}`.toLowerCase().includes(userQuery.toLowerCase());

      const matchesRole =
        roleFilter === "All Roles" || getUserRole(user) === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "All Status" || getUserStatus(user) === statusFilter.toLowerCase();

      const matchesTab =
        activeUserTab === "all" ||
        (activeUserTab === "customers" && getUserRole(user) === "customer") ||
        (activeUserTab === "hosts" && getUserRole(user) === "host") ||
        (activeUserTab === "unverified" && !user.isVerified) ||
        (activeUserTab === "suspended" && user.isBanned) ||
        (activeUserTab === "pending" && !user.isVerified && !user.isBanned);

      return matchesQuery && matchesRole && matchesStatus && matchesTab;
    });
  }, [activeUserTab, roleFilter, statusFilter, userQuery, users]);

  let sectionContent = null;

  if (activeSection === "overview") {
    sectionContent = (
      <OverviewSection
        onSectionChange={setActiveSection}
        moderationQueue={moderationQueue}
        setReviewOpenId={setReviewOpenId}
        stats={stats}
        loading={loading}
      />
    );
  } else if (activeSection === "users") {
    sectionContent = (
      <UsersSection
        users={filteredUsers}
        totalUsers={stats.totalUsers}
        loading={loading}
        userQuery={userQuery}
        setUserQuery={setUserQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        activeUserTab={activeUserTab}
        setActiveUserTab={setActiveUserTab}
        openUserMenuId={openUserMenuId}
        setOpenUserMenuId={setOpenUserMenuId}
      />
    );
  } else if (activeSection === "listings") {
    sectionContent = (
      <ListingsSection
        listings={listings}
        loading={loading}
        moderationQueue={moderationQueue}
        setModerationQueue={setModerationQueue}
        listingQueueFilter={listingQueueFilter}
        setListingQueueFilter={setListingQueueFilter}
        reviewOpenId={reviewOpenId}
        setReviewOpenId={setReviewOpenId}
        rejectionState={rejectionState}
        setRejectionState={setRejectionState}
        onToast={showToast}
      />
    );
  } else if (activeSection === "bookings") {
    sectionContent = <BookingsSection bookings={bookings} loading={loading} />;
  } else if (activeSection === "payments") {
    sectionContent = (
      <PaymentsSection
        paymentsFilter={paymentsFilter}
        setPaymentsFilter={setPaymentsFilter}
        paymentsRange={paymentsRange}
        setPaymentsRange={setPaymentsRange}
        onToast={showToast}
      />
    );
  } else if (activeSection === "disputes") {
    sectionContent = (
      <DisputesSection
        disputes={disputes}
        setDisputes={(next) => {
          setDisputes(next);
          const resolved = typeof next === "function" ? null : null;
          void resolved;
        }}
        disputesFilter={disputesFilter}
        setDisputesFilter={setDisputesFilter}
        confirmResolution={confirmResolution}
        setConfirmResolution={setConfirmResolution}
        resolvedFlashId={resolvedFlashId}
        onToast={(message) => {
          if (confirmResolution.id) setResolvedFlashId(confirmResolution.id);
          showToast(message);
        }}
      />
    );
  } else if (activeSection === "commission") {
    sectionContent = (
      <CommissionSection
        globalCommission={globalCommission}
        setGlobalCommission={setGlobalCommission}
        marketOverrides={marketOverrides}
        setMarketOverrides={setMarketOverrides}
        onToast={showToast}
      />
    );
  } else if (activeSection === "settings") {
    sectionContent = (
      <SettingsSection
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        generalSettings={generalSettings}
        setGeneralSettings={setGeneralSettings}
        featureFlags={featureFlags}
        setFeatureFlags={setFeatureFlags}
      />
    );
  } else {
    sectionContent = <PlaceholderSection title={SECTION_TITLES[activeSection]} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <AdminLayout
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setOpenUserMenuId(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {sectionContent}
          </motion.div>
        </AnimatePresence>
      </AdminLayout>

      <Toast message={toastMessage} />
    </motion.div>
  );
}
