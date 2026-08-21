import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "../components/Modal";
import { initSocket } from "../utils/socket";
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
  FileText,
  Globe,
  Key,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  PoundSterling,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldOff,
  ShieldQuestion,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
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

const PAYMENTS_RANGE_DAYS = {
  "Last 7 days": 7,
  "Last 30 days": 30,
  "Last 3 months": 90,
  "All time": 3650,
};

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
  },
  {
    label: "Listings",
    section: "listings",
    group: "MANAGEMENT",
    icon: Building2,
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
  },
  {
    label: "Support",
    section: "support",
    group: "MANAGEMENT",
    icon: LifeBuoy,
  },
  {
    label: "Invoices",
    section: "invoices",
    group: "MANAGEMENT",
    icon: FileText,
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
    label: "Categories",
    section: "categories",
    group: "PLATFORM",
    icon: LayoutGrid,
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
    label: "Team",
    section: "team",
    group: "PLATFORM",
    icon: Shield,
  },
  {
    label: "Settings",
    section: "settings",
    group: "PLATFORM",
    icon: Settings,
  },
];

const ADMIN_ROLE_LABELS = {
  full_admin: "Full Admin",
  finance: "Finance",
  support: "Support",
  content: "Content",
};

const ADMIN_ROLES = [
  { value: "full_admin", label: "Full Admin — everything" },
  { value: "finance", label: "Finance — Payments, Invoices, Commission" },
  { value: "support", label: "Support — Users, Listings, Bookings, Disputes" },
  { value: "content", label: "Content — Markets, Categories, Broadcast, Blog" },
];

// Sections each non-full_admin tier can see — mirrors the server-side
// requireAdminRole gates in vencome-server/routes/admin.js. full_admin (or an
// unknown/loading role) sees everything; team + settings stay full_admin-only.
const ROLE_SECTIONS = {
  finance: ["overview", "analytics", "payments", "invoices", "commission"],
  support: ["overview", "analytics", "users", "listings", "bookings", "disputes", "support"],
  content: ["overview", "analytics", "markets", "categories", "broadcast", "content"],
};

function canAccessSection(adminRole, section) {
  if (!adminRole || adminRole === "full_admin") return true;
  return (ROLE_SECTIONS[adminRole] || []).includes(section);
}

const SECTION_TITLES = {
  overview: "Overview",
  users: "Users",
  listings: "Listings",
  bookings: "Bookings",
  payments: "Payments",
  disputes: "Disputes",
  support: "Support",
  invoices: "Invoices",
  analytics: "Analytics",
  commission: "Commission",
  markets: "Markets",
  categories: "Categories",
  broadcast: "Broadcast",
  content: "Content & Blog",
  team: "Team",
  settings: "Settings",
};

const MOBILE_ADMIN_NAV = ["overview", "users", "listings", "payments", "disputes"];

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
  // Signup only ever collects an email (see LoginPage.jsx) -- name fields
  // stay empty until a host separately fills in their profile, so a real,
  // legitimate host with real listings showed as "Unknown host" here just
  // for not having done that yet. Fall back to their email (always
  // present for any genuinely linked host) before giving up entirely --
  // this is also literally what Adriana asked for in chat ("where can I
  // find the host of a listing? Their email?").
  return (
    listing.host?.displayName ||
    [listing.host?.firstName, listing.host?.lastName].filter(Boolean).join(" ") ||
    listing.host?.email ||
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

// Reusable in-app replacement for window.confirm(). Each component that
// needs a confirm dialog calls useConfirm() locally (state can't be shared
// across the many independent section components in this file) and renders
// the returned ConfirmDialog element anywhere in its JSX tree.
function ConfirmModal({ isOpen, title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 12 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            background: "white",
            color: "#374151",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: danger ? "#DC2626" : "#2E58EC",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({ message, resolve, ...options });
    });
  }, []);

  const resolveWith = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const ConfirmDialog = (
    <ConfirmModal
      isOpen={!!state}
      title={state?.title || "Are you sure?"}
      message={state?.message || ""}
      confirmLabel={state?.confirmLabel || "Confirm"}
      danger={state?.danger !== false}
      onConfirm={() => resolveWith(true)}
      onCancel={() => resolveWith(false)}
    />
  );

  return { confirm, ConfirmDialog };
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

  if (type === "ticket") {
    const classes =
      status === "resolved"
        ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
        : status === "closed"
        ? "border-[rgba(107,114,128,0.2)] bg-[rgba(107,114,128,0.1)] text-[#6B7280]"
        : status === "in_progress"
        ? "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
        : status === "waiting_on_user"
        ? "border-[rgba(124,58,237,0.2)] bg-[rgba(124,58,237,0.1)] text-[#7C3AED]"
        : "border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.1)] text-[#305CDE]";
    const label = status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return (
      <span className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${classes}`}>
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

function AdminLayout({ children, activeSection, onSectionChange, searchQuery, setSearchQuery, adminRole, adminName }) {
  const grouped = NAV_ITEMS
    .filter((item) => canAccessSection(adminRole, item.section))
    .reduce((acc, item) => {
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
              <p className="text-[13px] font-semibold text-white">{adminName || "Admin"}</p>
              <p className="text-[11px] text-white/50">{ADMIN_ROLE_LABELS[adminRole] || "Full Admin"}</p>
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
              onClick={() => {
                localStorage.removeItem("vencome_token");
                localStorage.removeItem("vencome_refresh");
                localStorage.removeItem("vencome_user");
                localStorage.removeItem("vencome_login_time");
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                window.location.href = "/admin/login";
              }}
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
              aria-label="Notifications"
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
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const maxBookings = Math.max(...data.map((item) => item.bookings), 1);
  const height = 180;
  const width = 520;
  const padding = { top: 16, right: 16, bottom: 28, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const points = data.length;

  const revenuePoints = data.map((item, i) => {
    const x = padding.left + (i / Math.max(points - 1, 1)) * innerW;
    const y = padding.top + innerH - (item.revenue / maxRevenue) * innerH;
    return `${x},${y}`;
  }).join(" ");

  const bookingPoints = data.map((item, i) => {
    const x = padding.left + (i / Math.max(points - 1, 1)) * innerW;
    const y = padding.top + innerH - (item.bookings / maxBookings) * innerH;
    return `${x},${y}`;
  }).join(" ");

  const revenueAreaPoints = [
    `${padding.left},${padding.top + innerH}`,
    ...data.map((item, i) => {
      const x = padding.left + (i / Math.max(points - 1, 1)) * innerW;
      const y = padding.top + innerH - (item.revenue / maxRevenue) * innerH;
      return `${x},${y}`;
    }),
    `${padding.left + innerW},${padding.top + innerH}`,
  ].join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={width} height={height} style={{ minWidth: width }}>
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = padding.top + innerH - tick * innerH;
          return (
            <g key={tick}>
              <line x1={padding.left} x2={padding.left + innerW} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />
              <text x={padding.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#9CA3AF">
                {tick === 0 ? "0" : `£${Math.round((tick * maxRevenue) / 1000)}k`}
              </text>
            </g>
          );
        })}
        <polygon points={revenueAreaPoints} fill="rgba(10,22,40,0.05)" />
        <polyline points={revenuePoints} fill="none" stroke="#0A1628" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={bookingPoints} fill="none" stroke="#305CDE" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" />
        {data.map((item, i) => {
          const x = padding.left + (i / Math.max(points - 1, 1)) * innerW;
          const ry = padding.top + innerH - (item.revenue / maxRevenue) * innerH;
          const by = padding.top + innerH - (item.bookings / maxBookings) * innerH;
          return (
            <g key={item.month}>
              <circle cx={x} cy={ry} r={3} fill="#0A1628" />
              <circle cx={x} cy={by} r={3} fill="#305CDE" />
              <text x={x} y={padding.top + innerH + 16} textAnchor="middle" fontSize={10} fill="#9CA3AF">
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
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

function UserMenu({ user, onClose, onVerify, onSuspend, onResetPassword, onDelete, onImpersonate, onRequestAccess, onEdit }) {
  // Support-access status now lives in its own request/response lifecycle
  // (see routes/admin.js support-access/status), not a flag on the user —
  // fetched lazily here, only when the admin actually opens this menu.
  const [accessStatus, setAccessStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}/support-access/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setAccessStatus(data.status);
      } catch (err) {
        if (!cancelled) setAccessStatus("none");
      }
    })();
    return () => { cancelled = true; };
  }, [user._id]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="absolute right-4 top-12 z-20 min-w-[180px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      {user.isHost ? (
        <UserMenuItem
          icon={Eye}
          label="View Profile"
          onClick={() => { window.open(`/host/${user._id}`, "_blank"); onClose(); }}
        />
      ) : null}
      {accessStatus === "active" ? (
        <UserMenuItem
          icon={LogIn}
          label="Log in as user"
          onClick={() => { onImpersonate(user); onClose(); }}
        />
      ) : accessStatus === "pending" ? (
        <UserMenuItem icon={Clock} label="Request pending…" disabled />
      ) : accessStatus ? (
        <UserMenuItem
          icon={ShieldQuestion}
          label="Request Access"
          onClick={() => { onRequestAccess(user); onClose(); }}
        />
      ) : null}
      <UserMenuItem
        icon={ShieldOff}
        label={user.isBanned ? "Unsuspend" : "Suspend"}
        danger={!user.isBanned}
        onClick={() => { onSuspend(user._id, !user.isBanned); onClose(); }}
      />
      <UserMenuItem
        icon={Key}
        label="Reset Password"
        onClick={() => { onResetPassword(user._id); onClose(); }}
      />
      <UserMenuItem
        icon={Pencil}
        label="Edit Details"
        onClick={() => { onEdit(user); onClose(); }}
      />
      {user.isHost ? (
        <UserMenuItem
          icon={UserCheck}
          label={user.venComeVerified ? "Revoke Verified" : "Grant VenCome Verified"}
          onClick={() => { onVerify(user._id, user.venComeVerified ? "revoke" : "grant"); onClose(); }}
        />
      ) : null}
      <UserMenuItem
        icon={Trash2}
        label="Delete User"
        danger
        onClick={() => { onDelete(user); onClose(); }}
      />
    </motion.div>
  );
}

function UserMenuItem({ icon: Icon, label, danger = false, disabled = false, onClick }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13px] transition ${
        disabled ? "cursor-default text-[#9CA3AF]" : "hover:bg-[#F8F6F0] " + (danger ? "text-[#DC2626]" : "text-[#111827]")
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

function OverviewSection({ onSectionChange, moderationQueue, setReviewOpenId, stats, loading, chartData = [], categoryData = [], liveDisputes = [] }) {
  const [chartRange, setChartRange] = useState("1Y");
  const filterChartData = (data, range) => {
    if (!data.length) return data;
    const now = new Date();
    const cutoffs = { "7D": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };
    const days = cutoffs[range] || 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter((item) => {
      if (!item.date) return true;
      return new Date(item.date) >= cutoff;
    });
  };
  const activeChartData = filterChartData(chartData.length > 0 ? chartData : MOCK_CHART_DATA, chartRange);
  const activeCategoryData = categoryData.length > 0 ? categoryData.map(c => ({ ...c, percent: Math.round((c.count / Math.max(1, categoryData.reduce((s, x) => s + x.count, 0))) * 100) })) : MOCK_CATEGORY_DATA;
  const totalRevenue = activeChartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = activeChartData.reduce((sum, item) => sum + item.bookings, 0);
  const avgMonthRevenue = Math.round(totalRevenue / Math.max(1, activeChartData.length));
  const activeDisputes = liveDisputes;
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
              {["7D", "1M", "3M", "6M", "1Y"].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                    chartRange === range
                      ? "bg-[#0A1628] text-white"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <BarChart data={activeChartData} />

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
          <HorizontalBars data={activeCategoryData} />
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

          {activeDisputes.length === 0 ? (
            <div className="py-8 text-center text-[14px] text-[#6B7280]">No active disputes</div>
          ) : activeDisputes.map((dispute) => {
            const isReal = !!dispute._id;
            const id = isReal ? dispute._id?.toString().slice(-6).toUpperCase() : dispute.id;
            const title = isReal ? (dispute.subject || dispute.reason || "Report") : dispute.space;
            const reason = isReal ? dispute.description || dispute.reason || "" : dispute.reason;
            const status = isReal ? (dispute.status || "open") : dispute.status;
            return (
              <div
                key={dispute._id || dispute.id}
                className="flex items-start gap-3 border-b border-[#F3F4F6] py-3 last:border-b-0"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EF4444]" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-[#6B7280]">#{id}</p>
                  <p className="truncate text-[13px] font-semibold text-[#0A1628]">{title}</p>
                  <p className="truncate text-[12px] text-[#6B7280]">{reason}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusPill status={status} type="dispute" />
                  <button
                    type="button"
                    onClick={() => onSectionChange("disputes")}
                    className="mt-2 block text-[13px] text-[#305CDE] hover:underline"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function CreateHostModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", phoneNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email) {
      setError("Email is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(form);
      setForm({ email: "", firstName: "", lastName: "", phoneNumber: "" });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Create Host Account</h3>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Creates a verified host account with no OTP step needed, for onboarding hosts who want VenCome
        staff to build their listing for them.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={set("email")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="First name — optional"
          value={form.firstName}
          onChange={set("firstName")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="Last name — optional"
          value={form.lastName}
          onChange={set("lastName")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="tel"
          placeholder="Phone number — optional"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
      </div>
      {error ? (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Creating..." : "Create Host Account"}
        </button>
      </div>
    </Modal>
  );
}

function EditUserModal({ isOpen, user, onClose, onSubmit }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", displayName: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        email: user.email || "",
      });
      setError("");
    }
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(user._id, form);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Edit Account Details</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          onChange={set("firstName")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={set("lastName")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="text"
          placeholder="Display name"
          value={form.displayName}
          onChange={set("displayName")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={set("email")}
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
        />
      </div>
      {error ? (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

function EditListingModal({ isOpen, listing, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", subcategory: "", address: "", city: "", country: "", neighborhood: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || "",
        subcategory: listing.subcategory || "",
        address: listing.location?.address || "",
        city: listing.location?.city || "",
        country: listing.location?.country || "",
        neighborhood: listing.location?.neighborhood || "",
      });
      setError("");
    }
  }, [listing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(listing._id, form);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = { border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 4, display: "block" };

  return (
    <Modal isOpen={isOpen} onClose={() => !submitting && onClose()}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 4 }}>Edit Listing</h3>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Fixing a typo or backfilling neighborhood/subcategory so this listing can appear on
        service+location pages doesn't require the host to make the change themselves.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input type="text" value={form.title} onChange={set("title")} style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={labelStyle}>Subcategory</label>
          <input type="text" value={form.subcategory} onChange={set("subcategory")} placeholder="e.g. Nail Studio, Hair Chair" style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={labelStyle}>Address</label>
          <input type="text" value={form.address} onChange={set("address")} style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>City</label>
            <input type="text" value={form.city} onChange={set("city")} style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <input type="text" value={form.country} onChange={set("country")} style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Neighborhood / Area</label>
          <input type="text" value={form.neighborhood} onChange={set("neighborhood")} placeholder="e.g. Islington, Paddington" style={{ ...fieldStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>
      {error ? (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
          {error}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Modal>
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
  onVerifyUser,
  onSuspendUser,
  onResetPasswordUser,
  onDeleteUser,
  onImpersonateUser,
  onRequestAccessUser,
  onOpenCreateHost,
  onEditUser,
  usersPage,
  usersTotalPages,
  onUsersPageChange,
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
          <button
            type="button"
            onClick={onOpenCreateHost}
            className="h-10 rounded-lg bg-[#0A1628] px-4 text-[13px] font-semibold text-white hover:bg-[#0A1628]/90"
          >
            + Create Host Account
          </button>

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
                      aria-label="More actions"
                      onClick={() => setOpenUserMenuId((current) => (current === user._id ? null : user._id))}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#0A1628] hover:text-white"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <AnimatePresence>
                      {openUserMenuId === user._id ? (
                        <UserMenu
                          user={user}
                          onClose={() => setOpenUserMenuId(null)}
                          onVerify={onVerifyUser}
                          onSuspend={onSuspendUser}
                          onResetPassword={onResetPasswordUser}
                          onDelete={onDeleteUser}
                          onImpersonate={onImpersonateUser}
                          onRequestAccess={onRequestAccessUser}
                          onEdit={onEditUser}
                        />
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
                  aria-label="More actions"
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
            Page {usersPage} of {usersTotalPages} — {formatNumber(totalUsers)} users total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={usersPage <= 1}
              onClick={() => onUsersPageChange(usersPage - 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={usersPage >= usersTotalPages}
              onClick={() => onUsersPageChange(usersPage + 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
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
  listingsPage,
  listingsTotalPages,
  onListingsPageChange,
}) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);

  const handleSubmitEditListing = async (id, form) => {
    await patchProperty(id, form);
    setSelectedListing((prev) => (prev && prev._id === id ? { ...prev, ...form, location: { ...prev.location, ...form } } : prev));
    setEditingListing(null);
    onToast("Listing updated");
  };

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

  const patchProperty = async (id, body) => {
    const token = localStorage.getItem("vencome_token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Request failed");
  };

  const handleApprove = async (id) => {
    try {
      await patchProperty(id, { isActive: true });
      removeQueueItem(id);
      onToast("Listing approved and published");
    } catch {
      onToast("Couldn't approve listing");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await patchProperty(id, { isActive: false, rejectionReason: reason });
      removeQueueItem(id);
      onToast("Listing rejected and removed from queue");
    } catch {
      onToast("Couldn't reject listing");
    }
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
                    onClick={() => window.open(`/property/${listing.id}`, "_blank")}
                    className="inline-flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827]"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(listing.id)}
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
                          onClick={() => handleReject(listing.id, rejectionState.reason)}
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
                listings.map((listing, index) => (
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
                    <button
                      type="button"
                      onClick={() => setSelectedListing(listing)}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#111827] cursor-pointer"
                    >
                      View
                    </button>
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
                  <button
                    type="button"
                    onClick={() => setSelectedListing(listing)}
                    className="inline-flex rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-medium text-[#111827] cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-[#6B7280]">
            Page {listingsPage} of {listingsTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={listingsPage <= 1}
              onClick={() => onListingsPageChange(listingsPage - 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={listingsPage >= listingsTotalPages}
              onClick={() => onListingsPageChange(listingsPage + 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {selectedListing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", margin: 0 }}>Listing Details</h2>
              <button aria-label="Close" onClick={() => setSelectedListing(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6B7280" }}>×</button>
            </div>
            {selectedListing.coverImage && (
              <img src={selectedListing.coverImage} alt={selectedListing.title} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: 20 }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Title</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedListing.title}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Category</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedListing.category?.name || selectedListing.category || "—"}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Location</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{[selectedListing.location?.address, selectedListing.location?.city, selectedListing.location?.country].filter(Boolean).join(", ") || "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Status</p>
                  <p style={{ fontSize: 14, color: selectedListing.isActive ? "#16A34A" : "#DC2626", fontWeight: 700, margin: 0 }}>{selectedListing.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Hourly</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedListing.pricing?.hourly > 0 ? `£${selectedListing.pricing.hourly}` : "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Daily</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedListing.pricing?.daily > 0 ? `£${selectedListing.pricing.daily}` : "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Monthly</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedListing.pricing?.monthly > 0 ? `£${selectedListing.pricing.monthly}` : "—"}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Host</p>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedListing.host?.displayName || selectedListing.host?.firstName || (typeof selectedListing.host === "string" ? selectedListing.host : selectedListing.host?.email) || "—"}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Created</p>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedListing.createdAt ? new Date(selectedListing.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
              </div>
              {selectedListing.description && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Description</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>{selectedListing.description?.slice(0, 300)}{selectedListing.description?.length > 300 ? "..." : ""}</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setSelectedListing(null)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#0A1628", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
              <button onClick={() => setEditingListing(selectedListing)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#0A1628", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Edit</button>
              <a href={`/property/${selectedListing.slug || selectedListing._id}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#0A1628", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>View Public Page</a>
            </div>
          </div>
        </div>
      )}

      <EditListingModal
        isOpen={!!editingListing}
        listing={editingListing}
        onClose={() => setEditingListing(null)}
        onSubmit={handleSubmitEditListing}
      />
    </>
  );
}

function InvoicesSection({ onToast }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadInvoices = async (search = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("q", search);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invoices?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => loadInvoices(query), 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleDownload = async (invoice) => {
    setBusyId(invoice.bookingId);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invoices/${invoice.bookingId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VenCome-Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      onToast("Failed to download invoice");
    } finally {
      setBusyId(null);
    }
  };

  const handleResend = async (invoice) => {
    setBusyId(invoice.bookingId);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/invoices/${invoice.bookingId}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      onToast(`Invoice resent to ${invoice.guestName}`);
    } catch {
      onToast("Failed to resend invoice");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Invoices</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">View, download, and resend booking invoices</p>
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search invoice #, guest, host, space..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-[280px] rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] outline-none focus:border-[#0A1628]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[14px] text-[#6B7280]">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-12 text-center text-[14px] text-[#6B7280]">
          No invoices found
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <div className="hidden grid-cols-[1fr_1.2fr_1.2fr_1.4fr_0.8fr_0.7fr_1.2fr] gap-3 bg-[#F8F6F0] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280] md:grid">
            <span>Invoice #</span>
            <span>Guest</span>
            <span>Host</span>
            <span>Space</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {invoices.map((invoice) => (
            <div
              key={invoice.bookingId}
              className="grid grid-cols-2 gap-3 border-t border-[#F3F4F6] px-5 py-4 text-[13px] md:grid-cols-[1fr_1.2fr_1.2fr_1.4fr_0.8fr_0.7fr_1.2fr] md:items-center"
            >
              <span className="font-semibold text-[#0A1628]">{invoice.invoiceNumber}</span>
              <span className="truncate text-[#111827]">{invoice.guestName}</span>
              <span className="truncate text-[#111827]">{invoice.hostName}</span>
              <span className="truncate text-[#6B7280]">{invoice.propertyTitle}</span>
              <span className="font-semibold text-[#0A1628]">{formatCurrency(invoice.amount)}</span>
              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${
                  invoice.status === "paid"
                    ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
                    : "border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.08)] text-[#DC2626]"
                }`}
              >
                {invoice.status === "paid" ? "Paid" : "Refunded"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(invoice)}
                  disabled={busyId === invoice.bookingId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#111827] disabled:opacity-50"
                >
                  <Download size={12} />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleResend(invoice)}
                  disabled={busyId === invoice.bookingId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#111827] disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  Resend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TeamSection({ onToast }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteRole, setInviteRole] = useState("full_admin");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [savingRoleId, setSavingRoleId] = useState(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadTeam = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team || []);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const startEditTitle = (member) => {
    setEditingId(member._id);
    setTitleDraft(member.adminTitle || "");
  };

  const saveTitle = async (member) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/team/${member._id}/title`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminTitle: titleDraft }),
      });
      if (!res.ok) throw new Error();
      setTeam((current) => current.map((m) => (m._id === member._id ? { ...m, adminTitle: titleDraft } : m)));
      setEditingId(null);
      onToast("Title updated");
    } catch {
      onToast("Failed to update title");
    }
  };

  const changeRole = async (member, adminRole) => {
    setSavingRoleId(member._id);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/team/${member._id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminRole }),
      });
      if (!res.ok) throw new Error();
      setTeam((current) => current.map((m) => (m._id === member._id ? { ...m, adminRole } : m)));
      onToast("Role updated");
    } catch {
      onToast("Failed to update role");
    } finally {
      setSavingRoleId(null);
    }
  };

  const revokeAccess = async (member) => {
    if (!(await confirm(`Revoke admin access for ${member.displayName || member.email}?`))) return;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${member._id}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAdmin: false }),
      });
      if (!res.ok) throw new Error();
      setTeam((current) => current.filter((m) => m._id !== member._id));
      onToast("Admin access revoked");
    } catch {
      onToast("Failed to revoke access");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }
    setInviting(true);
    setInviteError("");
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/team/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim(), adminTitle: inviteTitle.trim(), adminRole: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(data.error || "Failed to add team member");
        setInviting(false);
        return;
      }
      onToast(`${inviteEmail} added to the team`);
      setShowInvite(false);
      setInviteEmail("");
      setInviteTitle("");
      setInviteRole("full_admin");
      await loadTeam();
    } catch {
      setInviteError("Failed to add team member");
    } finally {
      setInviting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Team</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">People with admin access to the VenCome platform</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowInvite(true); setInviteError(""); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A1628] px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          <UserPlus size={15} />
          Add Team Member
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[14px] text-[#6B7280]">Loading team...</div>
      ) : team.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-12 text-center text-[14px] text-[#6B7280]">
          No admin users found
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {team.map((member) => {
            const name = member.displayName || `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email;
            return (
              <div key={member._id} style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <img
                    src={member.profileImage || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=200"}
                    alt={name}
                    style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <select
                    value={member.adminRole || "full_admin"}
                    onChange={(e) => changeRole(member, e.target.value)}
                    disabled={savingRoleId === member._id}
                    style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: "#374151", width: "100%" }}
                  >
                    {ADMIN_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                {editingId === member._id ? (
                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      placeholder="e.g. Founder, Tech Lead"
                      style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 13 }}
                    />
                    <button
                      type="button"
                      onClick={() => saveTitle(member)}
                      style={{ border: "none", background: "#0A1628", color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditTitle(member)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, border: "none", background: "rgba(48,92,222,0.08)", color: "#305CDE", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    <Pencil size={11} />
                    {member.adminTitle || "Set title"}
                  </button>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                    Joined {formatDate(member.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => revokeAccess(member)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#DC2626]"
                  >
                    <ShieldOff size={12} />
                    Revoke
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ConfirmDialog}

      <Modal isOpen={showInvite} onClose={() => !inviting && setShowInvite(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Add Team Member</h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
          They must already have a VenCome account. Their role controls which admin sections they can see.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          />
          <input
            type="text"
            placeholder="Title (e.g. Founder, Tech Lead) — optional"
            value={inviteTitle}
            onChange={(e) => setInviteTitle(e.target.value)}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
        {inviteError ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
            {inviteError}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setShowInvite(false)}
            disabled={inviting}
            style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: inviting ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={inviting}
            style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: inviting ? "not-allowed" : "pointer", opacity: inviting ? 0.7 : 1 }}
          >
            {inviting ? "Adding..." : "Add Team Member"}
          </button>
        </div>
      </Modal>
    </>
  );
}

const EMPTY_CATEGORY_FORM = { name: "", description: "", image: "", status: "published" };
const EMPTY_SUBCATEGORY_FORM = { name: "", description: "", image: "" };

function CategoriesSection({ onToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [subForm, setSubForm] = useState(EMPTY_SUBCATEGORY_FORM);
  const [editingSubId, setEditingSubId] = useState(null);
  const [savingSub, setSavingSub] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_CATEGORY_FORM);
    setFormError("");
    setSubForm(EMPTY_SUBCATEGORY_FORM);
    setEditingSubId(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      status: category.status || "published",
      subcategories: category.subcategories || [],
    });
    setFormError("");
    setSubForm(EMPTY_SUBCATEGORY_FORM);
    setEditingSubId(null);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  const startEditSub = (sub) => {
    setEditingSubId(sub._id || sub._localId);
    setSubForm({ name: sub.name, description: sub.description || "", image: sub.image || "" });
  };

  // While creating a new category (no _id yet), subcategories are staged
  // locally on form.subcategories and sent along with the create request.
  // Once a category exists (edit mode), each add/edit/delete hits its own
  // endpoint immediately since the parent doc is already persisted.
  const handleSaveSub = async () => {
    if (!subForm.name.trim() || !subForm.description.trim()) {
      onToast("Subcategory name and description are required");
      return;
    }
    const payload = { name: subForm.name.trim(), description: subForm.description.trim(), image: subForm.image.trim() || undefined };

    if (!editingId) {
      setForm((f) => ({
        ...f,
        subcategories: editingSubId
          ? (f.subcategories || []).map((s) => ((s._localId || s._id) === editingSubId ? { ...s, ...payload } : s))
          : [...(f.subcategories || []), { ...payload, _localId: `local-${Date.now()}-${Math.random()}` }],
      }));
      onToast(editingSubId ? "Subcategory updated" : "Subcategory added — saved when you create this category");
      setSubForm(EMPTY_SUBCATEGORY_FORM);
      setEditingSubId(null);
      return;
    }

    setSavingSub(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const url = editingSubId
        ? `${import.meta.env.VITE_API_URL}/admin/categories/${editingId}/subcategories/${editingSubId}`
        : `${import.meta.env.VITE_API_URL}/admin/categories/${editingId}/subcategories`;
      const res = await fetch(url, {
        method: editingSubId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast(data.error || "Failed to save subcategory");
        return;
      }
      onToast(editingSubId ? "Subcategory updated" : "Subcategory added");
      setSubForm(EMPTY_SUBCATEGORY_FORM);
      setEditingSubId(null);
      setForm((f) => ({ ...f, subcategories: data.category?.subcategories || f.subcategories }));
      await loadCategories();
    } catch {
      onToast("Failed to save subcategory");
    } finally {
      setSavingSub(false);
    }
  };

  const handleDeleteSub = async (sub) => {
    if (!(await confirm(`Delete subcategory "${sub.name}"?`))) return;

    if (!editingId) {
      setForm((f) => ({ ...f, subcategories: (f.subcategories || []).filter((s) => (s._localId || s._id) !== (sub._localId || sub._id)) }));
      return;
    }

    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories/${editingId}/subcategories/${sub._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      onToast("Subcategory deleted");
      setForm((f) => ({ ...f, subcategories: (f.subcategories || []).filter((s) => s._id !== sub._id) }));
      await loadCategories();
    } catch {
      onToast("Failed to delete subcategory");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Name and description are required");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const token = localStorage.getItem("vencome_token");
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim() || undefined,
        status: form.status,
        subcategories: !editingId
          ? (form.subcategories || []).map(({ name, description, image }) => ({ name, description, image }))
          : undefined,
      };
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/admin/categories/${editingId}`
        : `${import.meta.env.VITE_API_URL}/admin/categories`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Failed to save category");
        setSaving(false);
        return;
      }
      onToast(editingId ? "Category updated" : "Category created");
      setShowForm(false);
      await loadCategories();
    } catch {
      setFormError("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category) => {
    const nextStatus = category.status === "published" ? "draft" : "published";
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories/${category._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      setCategories((current) => current.map((c) => (c._id === category._id ? { ...c, status: nextStatus } : c)));
      onToast(nextStatus === "published" ? "Category published" : "Category moved to draft");
    } catch {
      onToast("Failed to update status");
    }
  };

  const handleDelete = async (category) => {
    if (!(await confirm(`Delete "${category.name}"? This cannot be undone.`))) return;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/categories/${category._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast(data.error || "Failed to delete category");
        return;
      }
      setCategories((current) => current.filter((c) => c._id !== category._id));
      onToast("Category deleted");
    } catch {
      onToast("Failed to delete category");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Categories</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Manage property categories and their visibility</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A1628] px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          <Plus size={15} />
          Create Category
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[14px] text-[#6B7280]">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-12 text-center text-[14px] text-[#6B7280]">
          No categories yet — click "Create Category" to add your first one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {categories.map((category) => (
            <div key={category._id} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1.5px solid #E5E7EB" }}>
              <div style={{ height: 100, background: `url(${category.image}) center/cover no-repeat, #F3F4F6` }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", margin: 0 }}>{category.name}</p>
                  <button
                    type="button"
                    onClick={() => toggleStatus(category)}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      color: category.status === "published" ? "#16A34A" : "#D97706",
                      background: category.status === "published" ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)",
                      padding: "3px 10px",
                      borderRadius: 999,
                      flexShrink: 0,
                    }}
                    title="Click to toggle"
                  >
                    {category.status === "published" ? "Published" : "Draft"}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 12px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {category.description}
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>{category.listingCount || 0} listing(s)</p>
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => openEditForm(category)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#111827]"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626]"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {ConfirmDialog}

      <Modal isOpen={showForm} onClose={closeForm}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>
          {editingId ? "Edit Category" : "Create Category"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            />
            <label style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#F8F6F0", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: "#374151" }}>
              Upload
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const uploadData = new FormData();
                uploadData.append("file", file);
                try {
                  const token = localStorage.getItem("vencome_token");
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: uploadData,
                  });
                  const data = await res.json();
                  if (data.url) setForm((f) => ({ ...f, image: data.url }));
                } catch (err) {
                  console.error("Upload error:", err);
                }
              }} />
            </label>
          </div>
          {form.image && (
            <img src={form.image} alt="Category preview" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
          )}
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          >
            <option value="published">Published (visible to hosts)</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </div>

        <div style={{ marginTop: 20, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0A1628", marginBottom: 10 }}>Subcategories</p>
            {(form.subcategories || []).map((sub) => (
              <div key={sub._id || sub._localId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                {sub.image && <img src={sub.image} alt={sub.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{sub.name}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.description}</p>
                </div>
                <button type="button" onClick={() => startEditSub(sub)} style={{ border: "1px solid #E5E7EB", background: "white", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                  <Pencil size={11} />
                </button>
                <button type="button" onClick={() => handleDeleteSub(sub)} style={{ border: "1px solid #FCA5A5", background: "white", color: "#DC2626", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, background: "#F8F6F0", borderRadius: 10, padding: 12 }}>
              <input
                type="text"
                placeholder="Subcategory name"
                value={subForm.name}
                onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
                style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
              <input
                type="text"
                placeholder="Subcategory description"
                value={subForm.description}
                onChange={(e) => setSubForm((f) => ({ ...f, description: e.target.value }))}
                style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Image URL (optional, falls back to category image)"
                  value={subForm.image}
                  onChange={(e) => setSubForm((f) => ({ ...f, image: e.target.value }))}
                  style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
                />
                <label style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: "#374151" }}>
                  Upload
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const uploadData = new FormData();
                    uploadData.append("file", file);
                    try {
                      const token = localStorage.getItem("vencome_token");
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: uploadData,
                      });
                      const data = await res.json();
                      if (data.url) setSubForm((f) => ({ ...f, image: data.url }));
                    } catch (err) {
                      console.error("Upload error:", err);
                    }
                  }} />
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                {editingSubId ? (
                  <button
                    type="button"
                    onClick={() => { setEditingSubId(null); setSubForm(EMPTY_SUBCATEGORY_FORM); }}
                    style={{ border: "1px solid #E5E7EB", background: "white", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "#111827" }}
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSaveSub}
                  disabled={savingSub}
                  style={{ border: "none", background: "#0A1628", color: "white", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: savingSub ? "not-allowed" : "pointer", opacity: savingSub ? 0.7 : 1 }}
                >
                  {savingSub ? "Saving..." : editingSubId ? "Save Subcategory" : "Add Subcategory"}
                </button>
              </div>
            </div>
        </div>

        {formError ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginTop: 12 }}>
            {formError}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </Modal>
    </>
  );
}

const MARKET_STATUS_META = {
  active: { label: "Active", color: "#16A34A" },
  coming_soon: { label: "Coming Soon", color: "#D97706" },
  planned: { label: "Planned", color: "#6B7280" },
};

const EMPTY_MARKET_FORM = { name: "", flag: "🌍", citiesText: "", status: "planned", phase: "", currency: "GBP", primaryLanguage: "English" };

function MarketsSection({ bookings, onToast }) {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_MARKET_FORM);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/markets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMarkets(data.markets || []);
      }
    } catch (err) {
      console.error("Failed to load markets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  const bookingsForMarket = (market) => {
    const needles = [market.name, ...(market.cities || [])].map((s) => s.toLowerCase());
    return bookings.filter((b) => {
      const country = b.property?.location?.country?.toLowerCase() || "";
      const city = b.property?.location?.city?.toLowerCase() || "";
      return needles.some((n) => country.includes(n) || city.includes(n));
    }).length;
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_MARKET_FORM);
    setShowForm(true);
  };

  const openEditForm = (market) => {
    setEditingId(market._id);
    setForm({
      name: market.name,
      flag: market.flag || "🌍",
      citiesText: (market.cities || []).join(", "),
      status: market.status,
      phase: market.phase || "",
      currency: market.currency || "GBP",
      primaryLanguage: market.primaryLanguage || "English",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      onToast("Market name is required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const payload = {
        name: form.name.trim(),
        flag: form.flag.trim() || "🌍",
        cities: form.citiesText.split(",").map((c) => c.trim()).filter(Boolean),
        status: form.status,
        phase: form.phase.trim(),
        currency: form.currency,
        primaryLanguage: form.primaryLanguage.trim() || "English",
      };
      const url = editingId
        ? `${import.meta.env.VITE_API_URL}/admin/markets/${editingId}`
        : `${import.meta.env.VITE_API_URL}/admin/markets`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast(data.error || "Failed to save market");
        setSaving(false);
        return;
      }
      onToast(editingId ? "Market updated" : "Market created");
      setShowForm(false);
      await loadMarkets();
    } catch {
      onToast("Failed to save market");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (market) => {
    if (!(await confirm(`Delete "${market.name}"? This cannot be undone.`))) return;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/markets/${market._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      onToast("Market deleted");
      setMarkets((current) => current.filter((m) => m._id !== market._id));
    } catch {
      onToast("Failed to delete market");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Markets</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Geographic market overview and expansion status</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A1628] px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          <Plus size={15} />
          Create Market
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[14px] text-[#6B7280]">Loading markets...</div>
      ) : markets.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-12 text-center text-[14px] text-[#6B7280]">
          No markets yet — click "Create Market" to add your first one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 24 }}>
          {markets.map((market) => {
            const meta = MARKET_STATUS_META[market.status] || MARKET_STATUS_META.planned;
            return (
              <div key={market._id} style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{market.flag}</span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", margin: 0 }}>{market.name}</p>
                      <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: `${meta.color}18`, padding: "2px 8px", borderRadius: 999 }}>{meta.label}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#0A1628", margin: 0 }}>{bookingsForMarket(market)}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>bookings</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {(market.cities || []).map((city) => (
                    <span key={city} style={{ fontSize: 12, color: "#6B7280", background: "#F3F4F6", padding: "3px 10px", borderRadius: 999 }}>{city}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>{market.currency || "GBP"} · {market.primaryLanguage || "English"}</p>
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid #F3F4F6", paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => openEditForm(market)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#111827]"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(market)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#FCA5A5] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626]"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {markets.length > 0 ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Expansion Roadmap</h3>
          {markets
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((market) => {
              const meta = MARKET_STATUS_META[market.status] || MARKET_STATUS_META.planned;
              return (
                <div key={market._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0A1628", width: 90, flexShrink: 0 }}>{market.phase || "—"}</span>
                  <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>
                    {market.name} — {(market.cities || []).join(", ") || "No cities listed"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, background: `${meta.color}18`, padding: "3px 12px", borderRadius: 999 }}>{meta.label}</span>
                </div>
              );
            })}
        </div>
      ) : null}

      {ConfirmDialog}

      <Modal isOpen={showForm} onClose={closeForm}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>
          {editingId ? "Edit Market" : "Create Market"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Flag emoji"
              value={form.flag}
              onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
              style={{ width: 70, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 18, textAlign: "center" }}
            />
            <input
              type="text"
              placeholder="Market name (e.g. United Kingdom)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            />
          </div>
          <input
            type="text"
            placeholder="Cities, comma separated (e.g. London, Manchester)"
            value={form.citiesText}
            onChange={(e) => setForm((f) => ({ ...f, citiesText: e.target.value }))}
            style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            >
              <option value="active">Active</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="planned">Planned</option>
            </select>
            <input
              type="text"
              placeholder="Phase (e.g. Phase 1)"
              value={form.phase}
              onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            >
              <option>GBP</option>
              <option>USD</option>
              <option>EUR</option>
              <option>AED</option>
              <option>SAR</option>
            </select>
            <input
              type="text"
              placeholder="Primary language (e.g. English)"
              value={form.primaryLanguage}
              onChange={(e) => setForm((f) => ({ ...f, primaryLanguage: e.target.value }))}
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", fontSize: 14 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Market"}
          </button>
        </div>
      </Modal>
    </>
  );
}

function BroadcastSection({ users }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [specificUserIds, setSpecificUserIds] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();
  const [templateName, setTemplateName] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const token = localStorage.getItem("vencome_token");

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTemplates((await res.json()).templates || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistory((await res.json()).broadcasts || []);
    } catch (err) {
      console.error("Failed to load broadcast history:", err);
    } finally {
      setHistoryLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTemplates();
    loadHistory();
  }, [loadTemplates, loadHistory]);

  const targetCount =
    target === "all" ? users.length :
    target === "hosts" ? users.filter(u => u.isHost).length :
    target === "specific" ? specificUserIds.length :
    users.filter(u => !u.isHost).length;

  const filteredUserOptions = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    const name = u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return name.toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const toggleSpecificUser = (userId) => {
    setSpecificUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
    setSent(false);
  };

  const handleSend = async () => {
    if (!subject || !message) { setError("Subject and message are required"); return; }
    if (target === "specific" && specificUserIds.length === 0) { setError("Select at least one recipient"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject,
          message,
          target,
          userIds: target === "specific" ? specificUserIds : undefined,
          scheduledFor: scheduledFor || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        setSubject("");
        setMessage("");
        setScheduledFor("");
        setSpecificUserIds([]);
        loadHistory();
      } else {
        setError(data.error || "Failed to send broadcast");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !subject || !message) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: templateName.trim(), subject, message }),
      });
      if (!res.ok) throw new Error();
      setShowSaveTemplate(false);
      setTemplateName("");
      loadTemplates();
    } catch {
      setError("Failed to save template");
    }
  };

  const handleLoadTemplate = (template) => {
    setSubject(template.subject);
    setMessage(template.message);
    setSent(false);
  };

  const handleDeleteTemplate = async (template) => {
    if (!(await confirm(`Delete template "${template.name}"?`))) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/templates/${template._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  };

  const handleCancelScheduled = async (broadcast) => {
    if (!(await confirm("Cancel this scheduled broadcast?"))) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/${broadcast._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadHistory();
    } catch (err) {
      console.error("Failed to cancel broadcast:", err);
    }
  };

  return (
    <>
      {ConfirmDialog}

      <div className="mb-6">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Broadcast</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">Send announcements and updates to your users</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1.5px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", margin: 0 }}>Compose Broadcast</h3>
            {templates.length > 0 && (
              <select
                defaultValue=""
                onChange={(e) => {
                  const tpl = templates.find((t) => t._id === e.target.value);
                  if (tpl) handleLoadTemplate(tpl);
                  e.target.value = "";
                }}
                style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 10px", fontSize: 12, color: "#374151" }}
              >
                <option value="" disabled>Load template...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {sent && (
            <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "#16A34A", fontWeight: 600, margin: 0 }}>✓ Broadcast sent successfully to {targetCount} users</p>
            </div>
          )}
          {error && <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 12 }}>{error}</p>}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Send to</label>
            <select value={target} onChange={e => { setTarget(e.target.value); setSent(false); }} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#374151", outline: "none" }}>
              <option value="all">All Users ({users.length})</option>
              <option value="hosts">Hosts only ({users.filter(u => u.isHost).length})</option>
              <option value="customers">Customers only ({users.filter(u => !u.isHost).length})</option>
              <option value="specific">Specific users...</option>
            </select>
          </div>

          {target === "specific" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Recipients ({specificUserIds.length} selected)
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}
              />
              <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 10 }}>
                {filteredUserOptions.slice(0, 100).map((u) => {
                  const name = u.displayName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email;
                  const checked = specificUserIds.includes(u._id);
                  return (
                    <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", fontSize: 13 }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleSpecificUser(u._id)} />
                      <span style={{ flex: 1, color: "#111827" }}>{name}</span>
                      <span style={{ color: "#9CA3AF", fontSize: 12 }}>{u.email}</span>
                    </label>
                  );
                })}
                {filteredUserOptions.length === 0 && (
                  <p style={{ padding: 12, fontSize: 13, color: "#9CA3AF", margin: 0 }}>No users match "{userSearch}"</p>
                )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Subject</label>
            <input value={subject} onChange={e => { setSubject(e.target.value); setSent(false); }} placeholder="e.g. Important update from VenCome" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#374151", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
            <textarea value={message} onChange={e => { setMessage(e.target.value); setSent(false); }} placeholder="Write your message here..." rows={8} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#374151", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Schedule for later (optional)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => { setScheduledFor(e.target.value); setSent(false); }}
              style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#374151", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={handleSend} disabled={sending} style={{ padding: "14px 32px", background: "#0A1628", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Sending..." : scheduledFor ? `Schedule for ${targetCount} users` : `Send to ${targetCount} users`}
            </button>
            <button
              type="button"
              onClick={() => setShowSaveTemplate(true)}
              disabled={!subject || !message}
              style={{ padding: "14px 20px", background: "white", color: "#111827", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: (!subject || !message) ? "not-allowed" : "pointer", opacity: (!subject || !message) ? 0.5 : 1 }}
            >
              Save as Template
            </button>
          </div>

          {showSaveTemplate && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                type="text"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
              />
              <button type="button" onClick={handleSaveTemplate} style={{ border: "none", background: "#0A1628", color: "white", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}>Save</button>
              <button type="button" onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }} style={{ border: "1px solid #E5E7EB", background: "white", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}>Cancel</button>
            </div>
          )}

          {templates.length > 0 && (
            <div style={{ marginTop: 20, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Templates</p>
              {templates.map((t) => (
                <div key={t._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontSize: 13, color: "#111827" }}>{t.name}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => handleLoadTemplate(t)} style={{ border: "none", background: "none", color: "#305CDE", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Load</button>
                    <button type="button" onClick={() => handleDeleteTemplate(t)} style={{ border: "none", background: "none", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Audience</h3>
            {[
              { label: "Total Users", value: users.length, color: "#305CDE" },
              { label: "Hosts", value: users.filter(u => u.isHost).length, color: "#16A34A" },
              { label: "Customers", value: users.filter(u => !u.isHost).length, color: "#D97706" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 14, color: "#374151" }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#FEF3C7", borderRadius: 20, padding: 20, border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 6 }}>⚠️ Before you send</p>
            <p style={{ fontSize: 13, color: "#92400E", margin: 0, lineHeight: 1.5 }}>Broadcast emails send immediately unless scheduled for later. This action cannot be undone.</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>History</h3>
            {historyLoading ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>Loading...</p>
            ) : history.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No broadcasts sent yet.</p>
            ) : (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {history.map((b) => (
                  <div key={b._id} style={{ padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{b.subject}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999,
                        color: b.status === "sent" ? "#16A34A" : b.status === "scheduled" ? "#D97706" : b.status === "cancelled" ? "#6B7280" : "#DC2626",
                        background: b.status === "sent" ? "rgba(22,163,74,0.1)" : b.status === "scheduled" ? "rgba(217,119,6,0.1)" : b.status === "cancelled" ? "rgba(107,114,128,0.1)" : "rgba(220,38,38,0.1)",
                      }}>
                        {b.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 0" }}>
                      {b.target}{b.recipientCount ? ` · ${b.recipientCount} recipients` : ""} · {formatDate(b.status === "scheduled" ? b.scheduledFor : b.sentAt || b.createdAt)}
                    </p>
                    {b.status === "scheduled" && (
                      <button type="button" onClick={() => handleCancelScheduled(b)} style={{ border: "none", background: "none", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4, padding: 0 }}>
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function AnalyticsSection({ chartData, categoryData, stats, bookings, livePayments, paymentStats, loading }) {
  const [chartRange, setChartRange] = useState("1Y");

  const filterChartData = (data, range) => {
    if (!data.length) return data;
    const cutoffs = { "7D": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };
    const days = cutoffs[range] || 365;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return data.filter((item) => {
      if (!item.date) return true;
      return new Date(item.date) >= cutoff;
    });
  };

  const activeChartData = filterChartData(chartData, chartRange);
  const totalRevenue = livePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const conversionRate = bookings.length > 0 ? Math.round((confirmedBookings / bookings.length) * 100) : 0;

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(paymentStats.gmv || totalRevenue), sub: "All time", color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
    { label: "Platform Revenue", value: formatCurrency(paymentStats.platformRevenue || 0), sub: "Commission earned", color: "#305CDE", bg: "rgba(48,92,222,0.08)" },
    { label: "Total Bookings", value: bookings.length, sub: `${confirmedBookings} confirmed`, color: "#0A1628", bg: "rgba(10,22,40,0.06)" },
    { label: "Conversion Rate", value: `${conversionRate}%`, sub: "Requests to confirmed", color: "#D97706", bg: "rgba(217,119,6,0.08)" },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Analytics</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">Platform performance overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1.5px solid #E5E7EB" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <BarChart2 size={18} color={card.color} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#0A1628", margin: "0 0 4px" }}>{card.value}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>{card.label}</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", margin: 0 }}>Revenue & Bookings Over Time</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {["7D", "1M", "3M", "6M", "1Y"].map((r) => (
              <button key={r} onClick={() => setChartRange(r)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid", borderColor: chartRange === r ? "#0A1628" : "#E5E7EB", background: chartRange === r ? "#0A1628" : "#fff", color: chartRange === r ? "#fff" : "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <BarChart data={activeChartData.length > 0 ? activeChartData : [{ month: "No data", revenue: 0, bookings: 0 }]} />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 2, background: "#0A1628" }} /><span style={{ fontSize: 12, color: "#6B7280" }}>Revenue</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 3, background: "#305CDE", borderRadius: 2 }} /><span style={{ fontSize: 12, color: "#6B7280" }}>Bookings</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Booking Status Breakdown</h3>
          {[
            { label: "Confirmed", count: confirmedBookings, color: "#16A34A", bg: "#DCFCE7" },
            { label: "Pending", count: pendingBookings, color: "#D97706", bg: "#FEF3C7" },
            { label: "Cancelled", count: cancelledBookings, color: "#DC2626", bg: "#FEE2E2" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: 14, color: "#374151" }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", background: item.bg, padding: "2px 10px", borderRadius: 999 }}>{item.count}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Listings by Category</h3>
          {categoryData.slice(0, 6).map((cat) => (
            <div key={cat.category} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{cat.category}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0A1628" }}>{cat.count}</span>
              </div>
              <div style={{ height: 6, background: "#F3F4F6", borderRadius: 999 }}>
                <div style={{ height: "100%", borderRadius: 999, background: "#305CDE", width: `${Math.min(100, (cat.count / Math.max(1, categoryData[0]?.count)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1.5px solid #E5E7EB" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Platform Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
          {[
            { label: "Total Users", value: stats.totalUsers || 0 },
            { label: "Active Listings", value: stats.totalListings || 0 },
            { label: "In Escrow", value: formatCurrency(paymentStats.inEscrow || 0) },
            { label: "Awaiting Payout", value: formatCurrency(paymentStats.awaitingPayout || 0) },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center", padding: 16, background: "#F8F6F0", borderRadius: 12 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", margin: "0 0 4px" }}>{item.value}</p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ContentSection({ blogs, fetchBlogs, blogForm, setBlogForm, editingBlog, setEditingBlog, blogError, setBlogError, blogSuccess, setBlogSuccess, blogLoading, setBlogLoading }) {
  const [showForm, setShowForm] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (!showForm) return;

    const initTinyMCE = () => {
      if (!window.tinymce) return;
      if (window.tinymce.get("blog-content-editor")) {
        window.tinymce.get("blog-content-editor").remove();
      }
      window.tinymce.init({
        selector: "#blog-content-editor",
        plugins: "anchor autolink charmap codesample code emoticons image link lists media searchreplace table visualblocks wordcount",
        toolbar: "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | code",
        height: 400,
        menubar: false,
        skin: "oxide",
        content_css: "default",
        // TinyMCE defaults to rewriting same-site absolute URLs into
        // relative ones on save (and can mangle them entirely when the
        // link's host doesn't exactly match the admin panel's own host,
        // e.g. www vs non-www) -- disable all of that so a link is stored
        // and re-shown exactly as typed.
        relative_urls: false,
        remove_script_host: false,
        convert_urls: false,
        images_upload_handler: (blobInfo) =>
          new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());
            const token = localStorage.getItem("vencome_token");
            fetch(`${import.meta.env.VITE_API_URL}/upload`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => (data.url ? resolve(data.url) : reject("Upload failed")))
              .catch(() => reject("Upload failed"));
          }),
        setup: (editor) => {
          editor.on("change keyup input", () => {
            setBlogForm(p => ({ ...p, content: editor.getContent() }));
          });
        },
      });
    };

    if (window.tinymce) {
      setTimeout(initTinyMCE, 100);
    } else {
      const existing = document.getElementById("tinymce-script");
      if (existing) {
        existing.addEventListener("load", () => setTimeout(initTinyMCE, 100));
        return;
      }
      const script = document.createElement("script");
      script.id = "tinymce-script";
      script.src = "https://cdn.tiny.cloud/1/d3ph19mc06oelgecrd2lzifkp7481i19iu8z3zv9w3zz2e76/tinymce/8/tinymce.min.js";
      script.referrerPolicy = "origin";
      script.crossOrigin = "anonymous";
      script.onload = () => setTimeout(initTinyMCE, 100);
      document.head.appendChild(script);
    }

    return () => {
      if (window.tinymce?.get("blog-content-editor")) {
        window.tinymce.get("blog-content-editor").remove();
      }
    };
    // Re-init on editingBlog?._id too, not just showForm -- otherwise
    // switching to edit a different post while the form is already open
    // leaves the previous post's stale content showing in the editor.
  }, [showForm, editingBlog?._id]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleSubmit = async (statusOverride) => {
    setBlogError("");
    setBlogSuccess("");
    if (!blogForm.title || !blogForm.excerpt || !blogForm.content) {
      setBlogError("Title, excerpt and content are required");
      return;
    }
    setBlogLoading(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const url = editingBlog
        ? `${import.meta.env.VITE_API_URL}/blog/${editingBlog._id}`
        : `${import.meta.env.VITE_API_URL}/blog`;
      const method = editingBlog ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...blogForm,
          status: statusOverride || blogForm.status,
          tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setBlogSuccess(editingBlog ? "Blog updated successfully" : "Blog created successfully");
        setBlogForm({ title: "", excerpt: "", content: "", coverImage: "", category: "News", tags: "", author: "VenCome Team", status: "draft", seoTitle: "", seoDescription: "", ogImage: "" });
        setEditingBlog(null);
        setShowForm(false);
        fetchBlogs();
      } else {
        const err = await res.json();
        setBlogError(err.error || "Failed to save blog");
      }
    } catch {
      setBlogError("Something went wrong");
    } finally {
      setBlogLoading(false);
    }
  };

  const handleEdit = async (blog) => {
    // The list this `blog` came from (GET /blog/admin/all) excludes content
    // to stay lightweight -- fetch the full post so the content editor
    // doesn't come up blank (which previously overwrote real content with
    // an empty string on save).
    let fullBlog = blog;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/admin/${blog._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        fullBlog = data.blog;
      }
    } catch {
      // fall back to the list's (content-less) blog object below
    }
    setEditingBlog(fullBlog);
    setBlogForm({ title: fullBlog.title, excerpt: fullBlog.excerpt, content: fullBlog.content || "", coverImage: fullBlog.coverImage || "", category: fullBlog.category, tags: (fullBlog.tags || []).join(", "), author: fullBlog.author, status: fullBlog.status });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Delete this blog post?"))) return;
    const token = localStorage.getItem("vencome_token");
    await fetch(`${import.meta.env.VITE_API_URL}/blog/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchBlogs();
  };

  const handlePublish = async (blog) => {
    const token = localStorage.getItem("vencome_token");
    await fetch(`${import.meta.env.VITE_API_URL}/blog/${blog._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: blog.status === "published" ? "draft" : "published" }),
    });
    fetchBlogs();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, color: "#374151", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };

  return (
    <>
      {ConfirmDialog}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Content & Blog</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingBlog(null); setBlogForm({ title: "", excerpt: "", content: "", coverImage: "", category: "News", tags: "", author: "VenCome Team", status: "draft", seoTitle: "", seoDescription: "", ogImage: "" }); }}
          style={{ padding: "10px 20px", background: "#0A1628", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ New Blog Post"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1.5px solid #E5E7EB", marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 24 }}>
            {editingBlog ? "Edit Blog Post" : "New Blog Post"}
          </h3>
          {blogError && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 16 }}>{blogError}</p>}
          {blogSuccess && <p style={{ color: "#16A34A", fontSize: 13, marginBottom: 16 }}>{blogSuccess}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={blogForm.title} onChange={e => setBlogForm(p => ({ ...p, title: e.target.value }))} placeholder="Blog post title" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))}>
                {["News", "Guides", "Industry", "Tips", "Updates", "Case Studies"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Excerpt * (max 300 chars)</label>
            <textarea style={{ ...inputStyle, height: 80, resize: "vertical" }} value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description shown in blog list..." maxLength={300} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Content *</label>
            <textarea id="blog-content-editor" defaultValue={blogForm.content} style={{ width: "100%", minHeight: 400 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Cover Image</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input style={{ ...inputStyle, flex: 1 }} value={blogForm.coverImage} onChange={e => setBlogForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="Paste image URL or upload below..." />
                <label style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#F8F6F0", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", color: "#374151" }}>
                  Upload
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const token = localStorage.getItem("vencome_token");
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                      });
                      const data = await res.json();
                      if (data.url) setBlogForm(p => ({ ...p, coverImage: data.url }));
                    } catch (err) {
                      console.error("Upload error:", err);
                    }
                  }} />
                </label>
              </div>
              {blogForm.coverImage && (
                <img src={blogForm.coverImage} alt="Cover preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
              )}
            </div>
            <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input style={inputStyle} value={blogForm.tags} onChange={e => setBlogForm(p => ({ ...p, tags: e.target.value }))} placeholder="office, london, tips" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Author</label>
              <input style={inputStyle} value={blogForm.author} onChange={e => setBlogForm(p => ({ ...p, author: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={blogForm.status} onChange={e => setBlogForm(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* SEO Section */}
          <div style={{ background: "#F8F6F0", borderRadius: 12, padding: 20, marginBottom: 24, border: "1.5px solid #E5E7EB" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0A1628", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>SEO Settings</p>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Meta Title <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(defaults to blog title)</span></label>
              <input style={inputStyle} value={blogForm.seoTitle || ""} onChange={e => setBlogForm(p => ({ ...p, seoTitle: e.target.value }))} placeholder={blogForm.title || "Meta title for search engines"} maxLength={60} />
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{(blogForm.seoTitle || "").length}/60 characters</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Meta Description <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(defaults to excerpt)</span></label>
              <textarea style={{ ...inputStyle, height: 70, resize: "vertical" }} value={blogForm.seoDescription || ""} onChange={e => setBlogForm(p => ({ ...p, seoDescription: e.target.value }))} placeholder={blogForm.excerpt || "Meta description for search engines"} maxLength={160} />
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{(blogForm.seoDescription || "").length}/160 characters</p>
            </div>
            <div>
              <label style={labelStyle}>OG Image URL <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(defaults to cover image)</span></label>
              <input style={inputStyle} value={blogForm.ogImage || ""} onChange={e => setBlogForm(p => ({ ...p, ogImage: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={blogLoading}
              style={{ padding: "14px 32px", background: "#fff", color: "#0A1628", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: blogLoading ? "not-allowed" : "pointer", opacity: blogLoading ? 0.7 : 1 }}
            >
              {blogLoading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={blogLoading}
              style={{ padding: "14px 32px", background: "#305CDE", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: blogLoading ? "not-allowed" : "pointer", opacity: blogLoading ? 0.7 : 1 }}
            >
              {blogLoading ? "Saving..." : editingBlog ? "Update & Publish" : "Publish"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6B7280" }}>
            <p style={{ fontSize: 16 }}>No blog posts yet. Create your first one above.</p>
          </div>
        ) : blogs.map((blog) => (
          <div key={blog._id} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", gap: 16 }}>
            {blog.coverImage ? (
              <img src={blog.coverImage} alt={blog.title} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 80, height: 60, background: "linear-gradient(135deg, #0A1628, #305CDE)", borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>✍️</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: blog.status === "published" ? "#16A34A" : "#D97706", background: blog.status === "published" ? "#DCFCE7" : "#FEF3C7", padding: "2px 8px", borderRadius: 999 }}>
                  {blog.status}
                </span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{blog.category}</span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blog.title}</p>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>{blog.readTime} min read · {blog.views} views · {new Date(blog.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => handlePublish(blog)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: blog.status === "published" ? "#D97706" : "#16A34A" }}>
                {blog.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => handleEdit(blog)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#305CDE" }}>
                Edit
              </button>
              <button onClick={() => handleDelete(blog._id)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#FEF2F2", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#DC2626" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
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
                    <td className="px-4 py-3.5 text-[13px] text-[#374151]">{getUserName(booking.guest)}</td>
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
  livePayments = [],
  paymentStats = {},
  onReleaseFunds,
}) {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [releasingId, setReleasingId] = useState(null);

  const filteredTransactions = livePayments.filter((transaction) => {
    if (paymentsFilter === "all") return true;
    if (paymentsFilter === "completed") return transaction.status === "completed";
    if (paymentsFilter === "escrow_held") return transaction.status === "escrow_held";
    return transaction.status === "refunded";
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      onToast("No transactions to export");
      return;
    }
    const headers = ["Transaction ID", "Booking Ref", "Customer", "Host", "Space", "Amount", "Commission", "Host Payout", "Status", "Date"];
    const rows = filteredTransactions.map((t) => [
      t.id, t.bookingRef, t.customer, t.host, t.space, t.amount, t.commission, t.hostPayout, t.status,
      t.date ? new Date(t.date).toISOString() : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vencome-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onToast("CSV downloaded");
  };

  const handleRelease = async (transaction) => {
    setReleasingId(transaction.bookingId);
    await onReleaseFunds(transaction);
    setReleasingId(null);
  };

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
            onClick={handleExportCSV}
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
            value: formatCurrency(paymentStats.gmv || 0),
            classes: "bg-[rgba(10,22,40,0.06)] text-[#0A1628]",
          },
          {
            icon: TrendingUp,
            label: "Platform Revenue",
            value: formatCurrency(paymentStats.platformRevenue || 0),
            classes: "bg-[rgba(22,163,74,0.1)] text-[#16A34A]",
          },
          {
            icon: Clock,
            label: "In Escrow",
            value: formatCurrency(paymentStats.inEscrow || 0),
            classes: "bg-[rgba(217,119,6,0.1)] text-[#D97706]",
          },
          {
            icon: RefreshCw,
            label: "Awaiting Payout",
            value: formatCurrency(paymentStats.awaitingPayout || 0),
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#6B7280]">
                    No transactions yet.
                  </td>
                </tr>
              ) : null}
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
                      <button
                        type="button"
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-[13px] font-medium text-[#305CDE]"
                      >
                        View
                      </button>
                      {transaction.status === "escrow_held" && transaction.bookingStatus === "completed" && !transaction.disputeFrozen ? (
                        <button
                          type="button"
                          disabled={releasingId === transaction.bookingId}
                          onClick={() => handleRelease(transaction)}
                          className="rounded-lg bg-[#0A1628] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                        >
                          {releasingId === transaction.bookingId ? "Releasing…" : "Release Funds"}
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

      {selectedTransaction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", margin: 0 }}>Transaction Details</h2>
              <button aria-label="Close" onClick={() => setSelectedTransaction(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#6B7280" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Transaction ID</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedTransaction.id}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Booking Ref</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{selectedTransaction.bookingRef}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Customer</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedTransaction.customer}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Host</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedTransaction.host}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Space</p>
                <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{selectedTransaction.space}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Amount</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Commission</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#305CDE", margin: 0 }}>{formatCurrency(selectedTransaction.commission)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Host Payout</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", margin: 0 }}>{formatCurrency(selectedTransaction.hostPayout)}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Status</p>
                  <StatusPill status={selectedTransaction.status} type="payment" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>Date</p>
                  <p style={{ fontSize: 14, color: "#374151", margin: 0 }}>{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
              {selectedTransaction.disputeFrozen && (
                <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 600, margin: 0 }}>Frozen pending dispute review — cannot release funds.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const DISPUTE_REASON_LABELS = {
  spam: "Spam",
  inappropriate: "Inappropriate content",
  fraud: "Suspected fraud",
  harassment: "Harassment",
  fake_listing: "Fake listing",
  not_as_described: "Space wasn't as described",
  no_show: "Host/guest didn't show up",
  property_damage: "Property damage",
  payment_issue: "Payment or charge issue",
  other: "Other",
};

function disputePriority(reason) {
  if (["fraud", "harassment", "property_damage", "payment_issue"].includes(reason)) return "high";
  if (["fake_listing", "inappropriate", "no_show", "not_as_described"].includes(reason)) return "medium";
  return "low";
}

function timeAgo(dateString) {
  if (!dateString) return "recently";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function DisputesSection({ disputes, setDisputes, disputesFilter, setDisputesFilter, onToast }) {
  const [resolvedFlashId, setResolvedFlashId] = useState(null);

  useEffect(() => {
    if (!resolvedFlashId) return undefined;
    const timer = window.setTimeout(() => setResolvedFlashId(null), 800);
    return () => window.clearTimeout(timer);
  }, [resolvedFlashId]);

  const filteredDisputes = disputes.filter((dispute) => {
    if (disputesFilter === "all") return true;
    return dispute.status === disputesFilter;
  });

  const updateDisputeStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Request failed");
      setDisputes((current) => current.map((item) => (item._id === id ? { ...item, status } : item)));
      if (status === "resolved") setResolvedFlashId(id);
      onToast(status === "resolved" ? "Dispute marked as resolved" : "Dispute dismissed");
    } catch {
      onToast("Failed to update dispute — try again");
    }
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
    {
      key: "dismissed",
      label: `Dismissed (${disputes.filter((item) => item.status === "dismissed").length})`,
    },
  ];

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Dispute Resolution</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          {disputes.filter((item) => item.status === "open").length} open disputes requiring attention
        </p>
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

      {filteredDisputes.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white py-12 text-center text-[14px] text-[#6B7280]">
          No disputes in this view
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredDisputes.map((dispute) => {
            const actionable = dispute.status === "open" || dispute.status === "under_review";
            const priority = disputePriority(dispute.reason);
            const reporterName =
              dispute.reporter?.firstName || dispute.reporter?.lastName
                ? `${dispute.reporter?.firstName || ""} ${dispute.reporter?.lastName || ""}`.trim()
                : dispute.reporter?.email || "Unknown reporter";
            return (
              <motion.div
                key={dispute._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow:
                    resolvedFlashId === dispute._id
                      ? "0 0 0 2px rgba(22,163,74,0.45)"
                      : "0 0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl border border-[#E5E7EB] bg-white p-5 ${
                  priority === "high"
                    ? "border-l-4 border-l-[#EF4444]"
                    : priority === "medium"
                    ? "border-l-4 border-l-[#D97706]"
                    : "border-l-4 border-l-[#16A34A]"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-[#6B7280]">
                        #{dispute._id?.toString().slice(-6).toUpperCase()}
                      </p>
                      <h3 className="mt-1 text-[16px] font-bold text-[#0A1628]">
                        {dispute.target?.label || `${dispute.type} report`}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] capitalize">{dispute.type}</p>
                    </div>
                    <StatusPill status={dispute.status} type="dispute" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[rgba(10,22,40,0.06)] px-3 py-2 text-[13px] text-[#111827]">
                      <User size={14} />
                      {dispute.target?.customer || reporterName}
                    </span>
                    {dispute.target?.host ? (
                      <>
                        <ArrowRight size={14} className="text-[#6B7280]" />
                        <span className="inline-flex items-center gap-2 rounded-lg bg-[rgba(10,22,40,0.06)] px-3 py-2 text-[13px] text-[#111827]">
                          <Building2 size={14} />
                          {dispute.target.host}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div>
                    {typeof dispute.target?.amount === "number" ? (
                      <p className="text-[15px] font-bold text-[#0A1628]">
                        {formatCurrency(dispute.target.amount)} in dispute
                      </p>
                    ) : null}
                    <p className="mt-1 text-[13px] italic leading-6 text-[#374151]">
                      {DISPUTE_REASON_LABELS[dispute.reason] || dispute.reason}
                      {dispute.description ? ` — ${dispute.description}` : ""}
                    </p>
                  </div>

                  <p className="inline-flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <Clock size={13} />
                    Opened {timeAgo(dispute.createdAt)}
                  </p>

                  {actionable ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateDisputeStatus(dispute._id, "resolved")}
                        className="min-h-[44px] rounded-lg bg-[rgba(22,163,74,0.1)] px-3.5 py-2 text-[13px] font-semibold text-[#16A34A]"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDisputeStatus(dispute._id, "dismissed")}
                        className="min-h-[44px] rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#111827]"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}

const TICKET_STATUS_OPTIONS = ["open", "in_progress", "waiting_on_user", "resolved", "closed"];
const TICKET_PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];
const TICKET_CATEGORY_LABELS = {
  booking_payments: "Booking & Payments",
  hosting_listings: "Hosting & Listings",
  account_security: "Account & Security",
  trust_safety: "Trust & Safety",
  technical: "Technical Issue",
  other: "Other",
};

function ticketStatusLabel(status) {
  return (status || "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Detail/reply view for one ticket, opened from a SupportTicketsSection row.
// Reuses the ticket data/message shape from the customer-facing
// SupportTicketThread.jsx but is its own Tailwind-styled Modal (rather than
// importing that page directly) so it can carry the admin-only status/
// priority/assignment controls that don't belong on the customer page.
function SupportTicketDetailModal({ ticketId, isOpen, onClose, onToast, myAdmin, onStatusChange }) {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !ticketId) return;
    setLoading(true);
    const token = localStorage.getItem("vencome_token");
    fetch(`${import.meta.env.VITE_API_URL}/support/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
        setMessages(data.messages || []);
      })
      .catch((err) => console.error("Failed to load ticket:", err))
      .finally(() => setLoading(false));
  }, [isOpen, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Same live-append pattern as SupportTicketThread.jsx: join the ticket's
  // room and append messages only via the socket event (the server
  // broadcasts to the whole room including the sender), so the reply sent
  // below isn't appended twice.
  useEffect(() => {
    if (!isOpen || !ticketId) return undefined;
    const token = localStorage.getItem("vencome_token");
    const socket = initSocket(token);
    socket.emit("joinTicket", ticketId);

    const handleMessage = (payload) => {
      if (String(payload.ticketId) !== String(ticketId)) return;
      setMessages((prev) =>
        prev.some((m) => m._id === payload.message._id) ? prev : [...prev, payload.message]
      );
      if (payload.status) setTicket((prev) => (prev ? { ...prev, status: payload.status } : prev));
    };
    const handleStatusChanged = (payload) => {
      setTicket((prev) => (prev ? { ...prev, status: payload.status } : prev));
    };

    socket.on("ticket_message", handleMessage);
    socket.on("ticket_status_changed", handleStatusChanged);
    return () => {
      socket.off("ticket_message", handleMessage);
      socket.off("ticket_status_changed", handleStatusChanged);
    };
  }, [isOpen, ticketId]);

  const patchTicket = async (updates) => {
    setUpdating(true);
    const prevTicket = ticket;
    setTicket((current) => (current ? { ...current, ...updates } : current));
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setTicket(data);
      if (updates.status) onStatusChange?.(ticketId, data.status);
      onToast("Ticket updated");
    } catch {
      setTicket(prevTicket);
      onToast("Failed to update ticket — try again");
    } finally {
      setUpdating(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem("vencome_token");
      const formData = new FormData();
      formData.append("body", replyText.trim());
      if (replyFile) formData.append("attachment", replyFile);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");
      setReplyText("");
      setReplyFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send reply:", err);
      onToast("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const isAssignedToMe = ticket?.assignedAdmin?._id === myAdmin?._id || ticket?.assignedAdmin === myAdmin?._id;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        {loading || !ticket ? (
          <div className="py-10 text-center text-[14px] text-[#6B7280]">Loading ticket...</div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-[#6B7280]">{ticket.ticketNumber}</p>
                <h3 className="mt-1 text-[18px] font-bold text-[#0A1628]">{ticket.subject}</h3>
                <p className="text-[13px] text-[#6B7280]">
                  {getUserDisplayName(ticket.user)} · {TICKET_CATEGORY_LABELS[ticket.category] || ticket.category}
                </p>
              </div>
              <StatusPill status={ticket.status} type="ticket" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={ticket.status}
                disabled={updating}
                onChange={(event) => patchTicket({ status: event.target.value })}
                className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-[13px] text-[#111827] outline-none disabled:opacity-50"
              >
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {ticketStatusLabel(status)}
                  </option>
                ))}
              </select>
              <select
                value={ticket.priority}
                disabled={updating}
                onChange={(event) => patchTicket({ priority: event.target.value })}
                className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-2 text-[13px] text-[#111827] outline-none disabled:opacity-50"
              >
                {TICKET_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
              {isAssignedToMe ? (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => patchTicket({ assignedAdmin: null })}
                  className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-medium text-[#111827] disabled:opacity-50"
                >
                  Unassign from me
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => patchTicket({ assignedAdmin: myAdmin?._id })}
                  className="h-9 rounded-lg bg-[#305CDE] px-3 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  Assign to me
                </button>
              )}
            </div>

            <div className="mt-4 flex max-h-[360px] flex-col gap-3 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#F8F6F0] p-4">
              {messages.length === 0 ? (
                <p className="text-center text-[13px] text-[#6B7280]">No messages yet.</p>
              ) : (
                messages.map((msg, index) => {
                  const isCustomer = msg.senderRole === "customer";
                  return (
                    <div key={msg._id || index} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] leading-6 ${
                          isCustomer ? "bg-[#0A1628] text-white" : "border border-[#E5E7EB] bg-white text-[#111827]"
                        }`}
                      >
                        {msg.body}
                        {msg.attachments?.length > 0 &&
                          msg.attachments.map((url, i) => (
                            <img key={i} src={url} alt="Attachment" className="mt-2 max-w-full rounded-lg" />
                          ))}
                        <div className={`mt-1 text-[10px] ${isCustomer ? "text-white/60" : "text-[#9CA3AF]"}`}>
                          {timeAgo(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                placeholder="Reply to this ticket..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#0A1628]"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setReplyFile(event.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 shrink-0 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280]"
              >
                <Paperclip size={16} className="mx-auto" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!replyText.trim() || sending}
                className="h-10 shrink-0 rounded-lg bg-[#305CDE] px-4 text-[13px] font-semibold text-white disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
            {replyFile ? <p className="mt-1 text-[11px] text-[#6B7280]">Attached: {replyFile.name}</p> : null}
          </>
        )}
      </div>
    </Modal>
  );
}

function SupportTicketsSection({ onToast, myAdmin }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTickets = useCallback(
    async (pageNum) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("vencome_token");
        const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        if (priorityFilter) params.set("priority", priorityFilter);
        if (assignedToMe) params.set("assignedToMe", "true");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/support-tickets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
          setPage(data.page || pageNum);
          setTotalPages(data.pages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch support tickets:", err);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, categoryFilter, priorityFilter, assignedToMe]
  );

  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets((current) => current.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t)));
  };

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Support Tickets</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">{formatNumber(total)} tickets</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
        >
          <option value="">All Statuses</option>
          {TICKET_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {ticketStatusLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
        >
          <option value="">All Categories</option>
          {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] outline-none focus:border-[#0A1628]"
        >
          <option value="">All Priorities</option>
          {TICKET_PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setAssignedToMe((current) => !current)}
          className={`h-10 rounded-full border px-4 text-[13px] font-medium transition ${
            assignedToMe ? "border-[#0A1628] bg-[#0A1628] text-white" : "border-[#E5E7EB] bg-white text-[#111827]"
          }`}
        >
          Assigned to me
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="px-4 py-10 text-center text-[14px] text-[#6B7280]">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="px-4 py-10 text-center text-[14px] text-[#6B7280]">No tickets in this view</div>
        ) : (
          <div className="flex flex-col">
            {tickets.map((ticket) => (
              <button
                key={ticket._id}
                type="button"
                onClick={() => setSelectedTicketId(ticket._id)}
                className="flex flex-col gap-2 border-b border-[#F3F4F6] px-4 py-4 text-left transition last:border-b-0 hover:bg-[#FAFAFA] md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#6B7280]">{ticket.ticketNumber}</span>
                    {ticket.priority === "urgent" || ticket.priority === "high" ? (
                      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#DC2626]">
                        {ticket.priority}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[14px] font-semibold text-[#0A1628]">{ticket.subject}</p>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    {getUserDisplayName(ticket.user)} · {TICKET_CATEGORY_LABELS[ticket.category] || ticket.category}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[12px] text-[#6B7280]">{timeAgo(ticket.lastMessageAt || ticket.updatedAt)}</span>
                  <StatusPill status={ticket.status} type="ticket" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-[#6B7280]">
            Page {page} of {totalPages} — {formatNumber(total)} tickets total
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => fetchTickets(page - 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => fetchTickets(page + 1)}
              className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <SupportTicketDetailModal
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onToast={onToast}
        myAdmin={myAdmin}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

function CommissionSection({ onToast }) {
  const [loading, setLoading] = useState(true);
  const [defaultRate, setDefaultRate] = useState(10);
  const [originalDefaultRate, setOriginalDefaultRate] = useState(10);
  const [markets, setMarkets] = useState([]);
  const [savingDefault, setSavingDefault] = useState(false);
  const [savingMarketId, setSavingMarketId] = useState(null);

  const token = localStorage.getItem("vencome_token");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/commission`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDefaultRate(data.defaultCommissionRate ?? 10);
        setOriginalDefaultRate(data.defaultCommissionRate ?? 10);
        setMarkets(
          (data.markets || []).map((m) => ({
            ...m,
            rate: m.commissionRate ?? 0,
            active: !!m.commissionOverrideActive,
            originalRate: m.commissionRate ?? 0,
            originalActive: !!m.commissionOverrideActive,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load commission settings:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDefaultRate = async () => {
    setSavingDefault(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/commission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ defaultCommissionRate: Number(defaultRate) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast(data.error || "Failed to save commission rate");
        return;
      }
      setOriginalDefaultRate(data.defaultCommissionRate);
      onToast("Global commission rate saved");
    } catch {
      onToast("Failed to save commission rate");
    } finally {
      setSavingDefault(false);
    }
  };

  const saveMarketRow = async (row) => {
    setSavingMarketId(row._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/commission/markets/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ commissionRate: row.rate, commissionOverrideActive: row.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast(data.error || "Failed to save market override");
        return;
      }
      setMarkets((current) =>
        current.map((m) => (m._id === row._id ? { ...m, originalRate: row.rate, originalActive: row.active } : m))
      );
      onToast(`${row.name} commission override saved`);
    } catch {
      onToast("Failed to save market override");
    } finally {
      setSavingMarketId(null);
    }
  };

  if (loading) {
    return <div className="max-w-[640px] rounded-[20px] border border-[#E5E7EB] bg-white p-8 text-center text-[14px] text-[#6B7280]">Loading commission settings...</div>;
  }

  return (
    <div className="max-w-[640px] rounded-[20px] border border-[#E5E7EB] bg-white p-4 md:p-8">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Commission Rate Settings</h2>
      <p className="mt-2 text-[14px] text-[#6B7280]">
        Applies to HOURLY/DAILY/WEEKLY bookings — ANNUAL (3%) and MONTHLY (6%) rates are fixed. Changes apply to new bookings only.
      </p>

      <div className="mt-6">
        <label className="text-[13px] font-semibold text-[#0A1628]">Global Commission Rate</label>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            value={defaultRate}
            onChange={(event) => setDefaultRate(event.target.value)}
            className="h-14 w-[100px] rounded-xl border-2 border-[#E5E7EB] text-center text-[28px] font-extrabold text-[#0A1628] outline-none focus:border-[#0A1628]"
          />
          <span className="text-[20px] text-[#6B7280]">%</span>
          {Number(defaultRate) !== originalDefaultRate && (
            <button
              type="button"
              onClick={saveDefaultRate}
              disabled={savingDefault}
              className="rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {savingDefault ? "Saving..." : "Save"}
            </button>
          )}
        </div>
        <p className="mt-2 text-[12px] text-[#6B7280]">
          Currently applied to all markets unless overridden below
        </p>
      </div>

      {markets.length === 0 ? (
        <p className="mt-8 text-[13px] text-[#6B7280]">
          No markets configured yet — add markets on the Markets page to set per-market overrides.
        </p>
      ) : (
        <>
          <div className="mt-8 hidden overflow-hidden rounded-xl border border-[#E5E7EB] md:block">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] gap-4 bg-[#F8F6F0] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
              <span>Market</span>
              <span>Override Rate</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {markets.map((row) => {
              const changed = row.rate !== row.originalRate || row.active !== row.originalActive;
              return (
                <div
                  key={row._id}
                  className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr] items-center gap-4 border-t border-[#F3F4F6] px-4 py-3"
                >
                  <span className="text-[14px] font-semibold text-[#0A1628]">{row.flag} {row.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={row.rate}
                      onChange={(event) =>
                        setMarkets((current) =>
                          current.map((item) => (item._id === row._id ? { ...item, rate: Number(event.target.value) } : item))
                        )
                      }
                      className="h-9 w-[60px] rounded-lg border border-[#E5E7EB] px-2 text-[13px] text-[#111827] outline-none focus:border-[#0A1628]"
                    />
                    <span className="text-[13px] text-[#6B7280]">%</span>
                  </div>
                  <ToggleSwitch
                    enabled={row.active}
                    onChange={(value) =>
                      setMarkets((current) => current.map((item) => (item._id === row._id ? { ...item, active: value } : item)))
                    }
                    size="sm"
                  />
                  <div>
                    {changed ? (
                      <button
                        type="button"
                        onClick={() => saveMarketRow(row)}
                        disabled={savingMarketId === row._id}
                        className="rounded-lg bg-[#305CDE] px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
                      >
                        {savingMarketId === row._id ? "Saving..." : "Save"}
                      </button>
                    ) : (
                      <span className="text-[12px] text-[#9CA3AF]">{row.active ? "Overridden" : "Default"}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 space-y-3 md:hidden">
            {markets.map((row) => {
              const changed = row.rate !== row.originalRate || row.active !== row.originalActive;
              return (
                <div key={row._id} className="rounded-xl border border-[#E5E7EB] p-4">
                  <p className="text-[14px] font-semibold text-[#0A1628]">{row.flag} {row.name}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={row.rate}
                        onChange={(event) =>
                          setMarkets((current) =>
                            current.map((item) => (item._id === row._id ? { ...item, rate: Number(event.target.value) } : item))
                          )
                        }
                        className="h-9 w-[60px] rounded-lg border border-[#E5E7EB] px-2 text-[13px] text-[#111827] outline-none focus:border-[#0A1628]"
                      />
                      <span className="text-[13px] text-[#6B7280]">%</span>
                    </div>
                    <ToggleSwitch
                      enabled={row.active}
                      onChange={(value) =>
                        setMarkets((current) => current.map((item) => (item._id === row._id ? { ...item, active: value } : item)))
                      }
                      size="sm"
                    />
                  </div>
                  {changed ? (
                    <button
                      type="button"
                      onClick={() => saveMarketRow(row)}
                      disabled={savingMarketId === row._id}
                      className="mt-3 rounded-lg bg-[#305CDE] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                    >
                      {savingMarketId === row._id ? "Saving..." : "Save"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
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
  onSaveSettings,
  savingSettings,
  settingsLoaded,
}) {
  const saveButton = (
    <div className="mt-2 flex justify-end">
      <button
        type="button"
        onClick={onSaveSettings}
        disabled={!settingsLoaded || savingSettings}
        className="rounded-lg bg-[#0A1628] px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
      >
        {savingSettings ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
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
            note={generalSettings.maintenanceMode ? "Platform is unavailable to non-admin users right now" : undefined}
          >
            <ToggleSwitch
              enabled={generalSettings.maintenanceMode}
              onChange={(value) => setGeneralSettings((current) => ({ ...current, maintenanceMode: value }))}
            />
          </SettingsRow>
          <SettingsRow
            label="New User Registrations"
            note={!generalSettings.registrationsEnabled ? "Registration is disabled" : undefined}
          >
            <ToggleSwitch
              enabled={generalSettings.registrationsEnabled}
              onChange={(value) => setGeneralSettings((current) => ({ ...current, registrationsEnabled: value }))}
            />
          </SettingsRow>
          <SettingsRow label="Host Applications">
            <ToggleSwitch
              enabled={generalSettings.hostApplicationsEnabled}
              onChange={(value) =>
                setGeneralSettings((current) => ({ ...current, hostApplicationsEnabled: value }))
              }
            />
          </SettingsRow>
          {saveButton}
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
          <SettingsRow
            label="Admin 2FA"
            note={generalSettings.requireAdmin2FA ? "Admin logins require an emailed verification code" : "⚠ Admins can sign in with just a password"}
          >
            <ToggleSwitch
              enabled={generalSettings.requireAdmin2FA}
              onChange={(value) => setGeneralSettings((current) => ({ ...current, requireAdmin2FA: value }))}
            />
          </SettingsRow>
          <SettingsRow label="Session Timeout" note="How long an admin stays signed in before needing to log in again">
            <select
              value={generalSettings.sessionTimeoutMinutes}
              onChange={(event) =>
                setGeneralSettings((current) => ({ ...current, sessionTimeoutMinutes: Number(event.target.value) }))
              }
              className="h-10 rounded-lg border border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={480}>8 hours</option>
              <option value={10080}>7 days</option>
            </select>
          </SettingsRow>
          {saveButton}
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
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("section") || "overview";
  });
  const navigateToSection = (section) => {
    setActiveSection(section);
    window.history.pushState({}, "", `/admin?section=${section}`);
  };
  const { confirm, ConfirmDialog } = useConfirm();
  const [myAdmin, setMyAdmin] = useState(null);

  useEffect(() => {
    const loadMyAdmin = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMyAdmin(await res.json());
      } catch (err) {
        console.error("Failed to load current admin:", err);
      }
    };
    loadMyAdmin();
  }, [token]);

  useEffect(() => {
    if (myAdmin && !canAccessSection(myAdmin.adminRole, activeSection)) {
      navigateToSection("overview");
    }
  }, [myAdmin, activeSection]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [listings, setListings] = useState([]);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsTotalPages, setListingsTotalPages] = useState(1);
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
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [liveDisputes, setLiveDisputes] = useState([]);
  const [livePayments, setLivePayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ gmv: 0, platformRevenue: 0, inEscrow: 0, awaitingPayout: 0 });
  const [blogs, setBlogs] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", content: "", coverImage: "", category: "News", tags: "", author: "VenCome Team", status: "draft", seoTitle: "", seoDescription: "", ogImage: "" });
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogError, setBlogError] = useState("");
  const [blogSuccess, setBlogSuccess] = useState("");

  const [moderationQueue, setModerationQueue] = useState([]);
  const [listingQueueFilter, setListingQueueFilter] = useState("all");
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [rejectionState, setRejectionState] = useState({ id: null, reason: "" });

  const [userQuery, setUserQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeUserTab, setActiveUserTab] = useState("all");
  const [openUserMenuId, setOpenUserMenuId] = useState(null);
  const handleVerifyUser = async (userId, action) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, venComeVerified: action === "grant" } : u));
        showToast(action === "grant" ? "VenCome Verified granted" : "Verified status revoked");
      }
    } catch (err) {
      console.error("Verify user error:", err);
    }
  };

  const handleSuspendUser = async (userId, ban) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ban }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isBanned: ban } : u)));
        showToast(ban ? "User suspended" : "User unsuspended");
      } else {
        showToast("Couldn't update user", "error");
      }
    } catch (err) {
      console.error("Suspend user error:", err);
      showToast("Couldn't update user", "error");
    }
  };

  const [showCreateHostModal, setShowCreateHostModal] = useState(false);
  const [createdHostCreds, setCreatedHostCreds] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const handleSubmitEditUser = async (userId, form) => {
    const token = localStorage.getItem("vencome_token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Couldn't save changes");
    setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...data.user } : u)));
    setEditingUser(null);
    showToast("User details updated");
  };

  const handleCreateHost = async ({ email, firstName, lastName, phoneNumber }) => {
    const token = localStorage.getItem("vencome_token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/create-host`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, firstName, lastName, phoneNumber }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Couldn't create host account", "error");
      return;
    }
    setCreatedHostCreds({ email: data.user.email, tempPassword: data.tempPassword });
    setShowCreateHostModal(false);
    showToast("Host account created", "success");
  };

  const handleResetPasswordUser = async (userId) => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast(res.ok ? "Reset code emailed to the user" : "Couldn't send reset code", res.ok ? "success" : "error");
    } catch (err) {
      console.error("Reset password error:", err);
      showToast("Couldn't send reset code", "error");
    }
  };

  // Requests consent-based access to a user's account — the user gets
  // emailed a secure grant/deny link (see routes/admin.js
  // support-access/request and SupportAccessGrantScreen.jsx).
  const handleRequestAccess = async (user) => {
    const reason = window.prompt(
      `What's this access request for? ${getUserDisplayName(user)} will see this reason.`,
      ""
    );
    if (reason === null) return; // cancelled
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}/support-access/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Couldn't send the request", "error");
        return;
      }
      showToast(`Access request sent to ${getUserDisplayName(user)}`, "success");
    } catch (err) {
      console.error("Support access request error:", err);
      showToast("Couldn't send the request", "error");
    }
  };

  // Logs in as a user with an active, granted session — same tab, with a
  // persistent "Viewing as X — Return to Admin" banner (see
  // SupportAccessBanner.jsx / Impersonate.jsx, which stash this admin's own
  // session first so it can be restored).
  const handleImpersonateUser = async (user) => {
    if (!(await confirm(`Log in as ${getUserDisplayName(user)}? This will be logged.`, { danger: false, confirmLabel: "Log in" }))) return;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}/impersonate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Couldn't log in as this user", "error");
        return;
      }
      const params = new URLSearchParams({
        token: data.token,
        userId: user._id,
        userName: data.userName || getUserDisplayName(user),
        expiresAt: data.sessionExpiresAt,
      });
      window.location.href = `/impersonate?${params.toString()}`;
    } catch (err) {
      console.error("Impersonate error:", err);
      showToast("Couldn't log in as this user", "error");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!(await confirm(`Delete ${getUserDisplayName(user)}? This can't be undone.`))) return;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        showToast("User deleted");
      } else {
        showToast(data.error || "Couldn't delete user", "error");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      showToast("Couldn't delete user", "error");
    }
  };

  const [paymentsFilter, setPaymentsFilter] = useState("all");
  const [paymentsRange, setPaymentsRange] = useState("Last 30 days");

  const [disputes, setDisputes] = useState([]);
  const [disputesFilter, setDisputesFilter] = useState("all");

  const [settingsTab, setSettingsTab] = useState("General");
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "VenCome",
    supportEmail: "support@vencome.com",
    currency: "GBP",
    maintenanceMode: false,
    registrationsEnabled: true,
    hostApplicationsEnabled: true,
    requireAdmin2FA: true,
    sessionTimeoutMinutes: 480,
  });
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGeneralSettings((current) => ({ ...current, ...data.settings }));
        }
      } catch (err) {
        console.error("Failed to load platform settings:", err);
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, [token]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(generalSettings),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setGeneralSettings((current) => ({ ...current, ...data.settings }));
        showToast("Settings saved");
      } else {
        showToast(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const fetchPayments = useCallback(async (rangeLabel) => {
    try {
      const days = PAYMENTS_RANGE_DAYS[rangeLabel] || 30;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/payments?range=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLivePayments(data.transactions || []);
        if (data.stats) setPaymentStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments(paymentsRange);
  }, [paymentsRange, fetchPayments]);

  const handleReleaseFunds = async (transaction) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/payments/${transaction.bookingId}/release`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Funds released to host");
        fetchPayments(paymentsRange);
      } else {
        showToast(data.error || "Couldn't release funds");
      }
    } catch (err) {
      console.error("Release funds error:", err);
      showToast("Couldn't release funds");
    }
  };

  const fetchUsers = useCallback(async (page) => {
    try {
      const authToken = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const allUsers = data.users || [];
        setUsers(allUsers);
        setUsersPage(data.page || page);
        setUsersTotalPages(data.pages || 1);
        setStats((prev) => ({
          ...prev,
          totalUsers: data.total || allUsers.length,
          activeUsers: allUsers.filter((user) => !user.isBanned).length,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  const fetchListings = useCallback(async (page) => {
    try {
      const authToken = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/properties?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const allListings = data.properties || [];
        setListings(allListings);
        setListingsPage(data.page || page);
        setListingsTotalPages(data.pages || 1);
        setStats((prev) => ({
          ...prev,
          totalListings: data.total || allListings.length,
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
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    }
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [bookingsRes, analyticsRes, reportsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/admin/bookings?limit=50`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/admin/overview-analytics`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/admin/reports?status=all&limit=100`, { headers }),
        ]);

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

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.chartData?.length) setChartData(analyticsData.chartData);
          if (analyticsData.categoryData?.length) {
            setCategoryData(
              analyticsData.categoryData.map((c, i) => ({
                category: c.name,
                count: c.count,
                percent: 0,
              }))
            );
          }
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          const allReports = reportsData.reports || [];
          setDisputes(allReports);
          setLiveDisputes(allReports.filter((report) => report.status === "open"));
        }
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchUsers(usersPage);
  }, [token, usersPage, fetchUsers]);

  useEffect(() => {
    if (!token) return;
    fetchListings(listingsPage);
  }, [token, listingsPage, fetchListings]);

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
        onSectionChange={navigateToSection}
        moderationQueue={moderationQueue}
        setReviewOpenId={setReviewOpenId}
        stats={stats}
        loading={loading}
        chartData={chartData}
        categoryData={categoryData}
        liveDisputes={liveDisputes}
      />
    );
  } else if (activeSection === "users") {
    sectionContent = (
      <>
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
        onVerifyUser={handleVerifyUser}
        onSuspendUser={handleSuspendUser}
        onResetPasswordUser={handleResetPasswordUser}
        onDeleteUser={handleDeleteUser}
        onImpersonateUser={handleImpersonateUser}
        onRequestAccessUser={handleRequestAccess}
        onOpenCreateHost={() => setShowCreateHostModal(true)}
        onEditUser={setEditingUser}
        usersPage={usersPage}
        usersTotalPages={usersTotalPages}
        onUsersPageChange={setUsersPage}
      />

      <CreateHostModal
        isOpen={showCreateHostModal}
        onClose={() => setShowCreateHostModal(false)}
        onSubmit={handleCreateHost}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleSubmitEditUser}
      />

      <Modal isOpen={!!createdHostCreds} onClose={() => setCreatedHostCreds(null)}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Host Account Created</h3>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
          This password is shown once. Log in with these credentials to set up the listing yourself,
          or pass them on to the host.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Email</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0A1628" }}>{createdHostCreds?.email}</div>
          </div>
          <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Temporary Password</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0A1628", fontFamily: "monospace" }}>
              {createdHostCreds?.tempPassword}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setCreatedHostCreds(null)}
            style={{ border: "none", color: "white", background: "#0A1628", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Done
          </button>
        </div>
      </Modal>
      </>
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
        listingsPage={listingsPage}
        listingsTotalPages={listingsTotalPages}
        onListingsPageChange={setListingsPage}
      />
    );
  } else if (activeSection === "bookings") {
    sectionContent = <BookingsSection bookings={bookings} loading={loading} />;
  } else if (activeSection === "markets") {
    sectionContent = (
      <MarketsSection bookings={bookings} onToast={showToast} />
    );
  } else if (activeSection === "categories") {
    sectionContent = <CategoriesSection onToast={showToast} />;
  } else if (activeSection === "broadcast") {
    sectionContent = (
      <BroadcastSection users={users} />
    );
  } else if (activeSection === "analytics") {
    sectionContent = (
      <AnalyticsSection
        chartData={chartData}
        categoryData={categoryData}
        stats={stats}
        bookings={bookings}
        livePayments={livePayments}
        paymentStats={paymentStats}
        loading={loading}
      />
    );
  } else if (activeSection === "content") {
    sectionContent = (
      <ContentSection
        blogs={blogs}
        fetchBlogs={fetchBlogs}
        blogForm={blogForm}
        setBlogForm={setBlogForm}
        editingBlog={editingBlog}
        setEditingBlog={setEditingBlog}
        blogError={blogError}
        setBlogError={setBlogError}
        blogSuccess={blogSuccess}
        setBlogSuccess={setBlogSuccess}
        blogLoading={blogLoading}
        setBlogLoading={setBlogLoading}
      />
    );
  } else if (activeSection === "payments") {
    sectionContent = (
      <PaymentsSection
        paymentsFilter={paymentsFilter}
        setPaymentsFilter={setPaymentsFilter}
        paymentsRange={paymentsRange}
        setPaymentsRange={setPaymentsRange}
        onToast={showToast}
        livePayments={livePayments}
        paymentStats={paymentStats}
        onReleaseFunds={handleReleaseFunds}
      />
    );
  } else if (activeSection === "disputes") {
    sectionContent = (
      <DisputesSection
        disputes={disputes}
        setDisputes={setDisputes}
        disputesFilter={disputesFilter}
        setDisputesFilter={setDisputesFilter}
        onToast={showToast}
      />
    );
  } else if (activeSection === "support") {
    sectionContent = <SupportTicketsSection onToast={showToast} myAdmin={myAdmin} />;
  } else if (activeSection === "invoices") {
    sectionContent = <InvoicesSection onToast={showToast} />;
  } else if (activeSection === "commission") {
    sectionContent = <CommissionSection onToast={showToast} />;
  } else if (activeSection === "team") {
    sectionContent = <TeamSection onToast={showToast} />;
  } else if (activeSection === "settings") {
    sectionContent = (
      <SettingsSection
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        generalSettings={generalSettings}
        setGeneralSettings={setGeneralSettings}
        featureFlags={featureFlags}
        setFeatureFlags={setFeatureFlags}
        onSaveSettings={handleSaveSettings}
        savingSettings={savingSettings}
        settingsLoaded={settingsLoaded}
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
          navigateToSection(section);
          setOpenUserMenuId(null);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        adminRole={myAdmin?.adminRole}
        adminName={myAdmin?.displayName || [myAdmin?.firstName, myAdmin?.lastName].filter(Boolean).join(" ") || myAdmin?.email}
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
      {ConfirmDialog}
    </motion.div>
  );
}
