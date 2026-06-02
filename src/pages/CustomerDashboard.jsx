import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CalendarX,
  Check,
  Clock,
  Heart,
  HelpCircle,
  MapPin,
  MessageSquare,
  Search,
  Star,
  User,
  Settings as SettingsIcon,
  Building2,
} from "lucide-react";
import CustomerLayout from "../layouts/CustomerLayout";
import PropertyCard from "../components/PropertyCard";
import { getUser } from "../utils/auth";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS = [
  {
    id: 1, tab: "upcoming",
    space: "Canary Wharf Boardroom", location: "Canary Wharf, London",
    category: "Meeting Rooms",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&q=80",
    checkIn: "Mon 19 May 2026", duration: "9:00am – 1:00pm",
    price: 480, status: "Confirmed", bookingRef: "VC-2026-001",
    host: "Marcus Williams", canCancel: true,
  },
  {
    id: 2, tab: "upcoming",
    space: "DIFC Creative Studio", location: "DIFC, Dubai",
    category: "Studio Space",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
    checkIn: "Fri 23 May 2026", duration: "9:00am – 6:00pm",
    price: 250, status: "Pending Approval", bookingRef: "VC-2026-002",
    host: "Aisha Rahman", canCancel: true,
  },
  {
    id: 3, tab: "past",
    space: "The Shard Executive Suite", location: "London Bridge, London",
    category: "Office Space",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80",
    checkIn: "Wed 1 May 2026", duration: "10:00am – 4:00pm",
    price: 510, status: "Completed", bookingRef: "VC-2026-003",
    host: "James Thornton", canCancel: false, hasReview: false,
  },
  {
    id: 4, tab: "cancelled",
    space: "Birmingham Conference Centre", location: "Digbeth, Birmingham",
    category: "Meeting Rooms",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&q=80",
    checkIn: "Thu 10 Apr 2026", duration: "2:00pm – 5:00pm",
    price: 270, status: "Cancelled", bookingRef: "VC-2026-004",
    host: "David Park", canCancel: false, refundStatus: "Refunded £270",
  },
];

const MOCK_SAVED = [
  { id: 1, title: "The Shard Executive Suite", location: "London Bridge, London", category: "Office Space", price: 85, priceUnit: "hour", rating: 4.92, reviewCount: 47, badge: "Featured", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80" },
  { id: 2, title: "Shoreditch Event Space", location: "Shoreditch, London", category: "Event Venues", price: 450, priceUnit: "day", rating: 4.9, reviewCount: 58, badge: "Popular", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80" },
  { id: 3, title: "DIFC Creative Studio", location: "DIFC, Dubai", category: "Studio Space", price: 250, priceUnit: "day", rating: 4.97, reviewCount: 22, badge: "Verified", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80" },
  { id: 4, title: "Mayfair Private Members Office", location: "Mayfair, London", category: "Office Space", price: 5500, priceUnit: "month", rating: 4.95, reviewCount: 12, badge: "Featured", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" },
];

const MOCK_RECOMMENDED = [
  { id: 5, title: "Old Street Co-working Hub", location: "Old Street, London", category: "Co-working", price: 45, priceUnit: "day", rating: 4.88, reviewCount: 134, badge: "Popular", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
  { id: 6, title: "Riyadh Business Centre", location: "Al Olaya, Riyadh", category: "Office Space", price: 320, priceUnit: "day", rating: 4.85, reviewCount: 31, badge: "Verified", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80" },
  { id: 7, title: "Manchester Media City Studio", location: "Salford, Manchester", category: "Studio Space", price: 180, priceUnit: "day", rating: 4.91, reviewCount: 67, badge: "Featured", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80" },
  { id: 8, title: "Dubai Marina Event Hall", location: "Dubai Marina, Dubai", category: "Event Venues", price: 1200, priceUnit: "day", rating: 4.94, reviewCount: 28, badge: "Premium", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80" },
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
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(amount) || 0);

// ── STATUS BADGE ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    Confirmed: { bg: "rgba(22,163,74,0.1)", text: "#16A34A" },
    "Pending Approval": { bg: "rgba(217,119,6,0.1)", text: "#D97706" },
    Completed: { bg: "rgba(10,22,40,0.08)", text: "#0A1628" },
    Cancelled: { bg: "rgba(220,38,38,0.08)", text: "#DC2626" },
  };
  const s = map[status] || map.Cancelled;
  return (
    <span style={{ background: s.bg, color: s.text, borderRadius: 9999, padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────

function DashboardSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?location=${encodeURIComponent(query)}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "white", borderRadius: 9999,
      border: "1.5px solid #E5E7EB",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      padding: "8px 8px 8px 20px",
      marginTop: 20,
    }}>
      <Search size={18} color="#6B7280" style={{ flexShrink: 0 }} />
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
        placeholder="Search for offices, studios, event venues..."
        style={{
          flex: 1, border: "none", outline: "none",
          fontSize: 14, color: "#111827", background: "transparent",
        }}
      />
      <button
        type="button"
        onClick={handleSearch}
        style={{
          background: "#2E58EC", color: "white",
          border: "none", borderRadius: 9999,
          padding: "10px 20px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        Find a Space
      </button>
    </div>
  );
}

// ── OVERVIEW SECTION ──────────────────────────────────────────────────────────

function OverviewSection({ displayName }) {
  const upcoming = MOCK_BOOKINGS.filter(b => b.tab === "upcoming");

  const stats = [
    { icon: CalendarDays, label: "Upcoming Bookings", value: "2", sub: "Next: Mon 19 May" },
    { icon: Heart, label: "Saved Spaces", value: "4", sub: "1 new match" },
    { icon: MessageSquare, label: "Unread Messages", value: "3", sub: "2 from hosts" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

      {/* Welcome Banner + Search */}
      <div style={{
        background: "linear-gradient(135deg, #0A1628 0%, #1a2f4e 100%)",
        borderRadius: 16, padding: "28px 32px", marginBottom: 28,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(46,88,236,0.15)", pointerEvents: "none" }} />
        <p style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
          Good morning, {displayName}
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          Find your next commercial space across the UK and Middle East.
        </p>
        <DashboardSearch />
      </div>

      {/* 3 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}
        className="grid-cols-1 sm:grid-cols-3">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(46,88,236,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color="#2E58EC" />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{item.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#0A1628", lineHeight: 1.2 }}>{item.value}</p>
                  <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{item.sub}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming Bookings */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Upcoming Bookings</h2>
          <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>View all →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.slice(0, 2).map((booking, i) => (
            <motion.div key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", gap: 16, background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 16, alignItems: "center" }}>
              <img src={booking.image} alt={booking.space} style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} className="hidden sm:block" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.space}</p>
                <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6B7280" }}><MapPin size={13} />{booking.location}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6B7280" }}><Clock size={13} />{booking.duration}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0A1628" }}>{formatCurrency(booking.price)}</p>
                <StatusBadge status={booking.status} />
                <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>View Details</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended Spaces */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Recommended for You</h2>
          <Link to="/search" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>Browse all →</Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }} className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_RECOMMENDED.map(space => (
            <div key={space.id} style={{ minWidth: 240, flexShrink: 0 }}>
              <PropertyCard {...space} />
            </div>
          ))}
        </div>
      </div>

      {/* Saved Spaces */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Saved Spaces</h2>
          <Link to="/customer/saved" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>View all →</Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }} className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_SAVED.map(space => (
            <div key={space.id} style={{ minWidth: 240, flexShrink: 0 }}>
              <PropertyCard {...space} />
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

// ── BOOKINGS SECTION ──────────────────────────────────────────────────────────

function BookingsSection() {
  const TABS = [
    { id: "upcoming", label: "Upcoming (2)" },
    { id: "current", label: "Current" },
    { id: "past", label: "Past (1)" },
    { id: "cancelled", label: "Cancelled (1)" },
  ];
  const [activeTab, setActiveTab] = useState("upcoming");
  const list = MOCK_BOOKINGS.filter(b => b.tab === activeTab);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div style={{ borderBottom: "1px solid #E5E7EB", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }} className="[scrollbar-width:none]">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ padding: "12px 20px", fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? "#0A1628" : "#6B7280", borderBottom: activeTab === tab.id ? "2px solid #2E58EC" : "2px solid transparent", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid #2E58EC" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center" }}>
          <CalendarX size={48} color="#E5E7EB" />
          <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>No {activeTab} bookings</p>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>Nothing to show here right now.</p>
          {activeTab === "upcoming" && (
            <Link to="/search" style={{ marginTop: 24, padding: "12px 24px", borderRadius: 9999, background: "#2E58EC", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Find a Space
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {list.map(booking => (
            <div key={booking.id} style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column" }} className="md:flex-row">
                <img src={booking.image} alt={booking.space} style={{ width: "100%", height: 160, objectFit: "cover" }} className="md:w-[160px] md:h-[140px]" />
                <div style={{ flex: 1, padding: 20, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{booking.space}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}><MapPin size={13} />{booking.location}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}><Clock size={13} />{booking.checkIn} · {booking.duration}</span>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", marginTop: 16 }}>{formatCurrency(booking.price)}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8F6F0", padding: "12px 20px", flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 12, color: "#6B7280" }}>Ref: {booking.bookingRef}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>View Details</Link>
                  {booking.tab === "upcoming" && (
                    <Link to="/customer/messages" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>Message Host</Link>
                  )}
                  {booking.tab === "upcoming" && booking.canCancel && (
                    <button type="button" style={{ fontSize: 13, fontWeight: 600, color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
                  )}
                  {booking.tab === "past" && !booking.hasReview && (
                    <Link to="/customer/reviews" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>Leave a Review</Link>
                  )}
                  {booking.tab === "past" && (
                    <Link to="/search" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>Book Again</Link>
                  )}
                  {booking.refundStatus && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>{booking.refundStatus}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── SAVED SECTION ─────────────────────────────────────────────────────────────

function SavedSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628" }}>Saved Spaces ({MOCK_SAVED.length})</h2>
        <Link to="/search" style={{ fontSize: 13, fontWeight: 600, color: "#C9A84C", textDecoration: "none" }}>Find more spaces →</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
        {MOCK_SAVED.map(space => <PropertyCard key={space.id} {...space} />)}
      </div>
    </motion.div>
  );
}

// ── MESSAGES SECTION ──────────────────────────────────────────────────────────

function MessagesSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center" }}>
      <MessageSquare size={48} color="#E5E7EB" />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>Messages</h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8, maxWidth: 360 }}>Your conversations with hosts will appear here.</p>
      <Link to="/search" style={{ marginTop: 24, padding: "12px 24px", borderRadius: 9999, background: "#2E58EC", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        Browse Spaces
      </Link>
    </div>
  );
}

// ── REVIEWS SECTION ───────────────────────────────────────────────────────────

function ReviewsSection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center" }}>
      <Star size={48} color="#E5E7EB" />
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>My Reviews</h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8, maxWidth: 360 }}>Reviews you have left for spaces will appear here.</p>
      <Link to="/customer/bookings" style={{ marginTop: 24, padding: "12px 24px", borderRadius: 9999, background: "#2E58EC", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
        View Bookings
      </Link>
    </div>
  );
}

// ── PROFILE SECTION ───────────────────────────────────────────────────────────

function ProfileSection() {
  const currentUser = getUser();
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [email] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || "");
  const [company, setCompany] = useState("");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="grid-cols-1 lg:grid-cols-2">
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <User size={36} color="#2E58EC" />
        </div>
        <button type="button" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", background: "none", border: "none", cursor: "pointer", marginTop: 12 }}>Edit Photo</button>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : email}
        </p>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{email}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C", borderRadius: 9999, padding: "4px 12px", fontSize: 10, fontWeight: 700, marginTop: 12 }}>
          <Check size={12} /> Verified Customer
        </span>
      </div>

      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "First Name", value: firstName, onChange: setFirstName },
            { label: "Last Name", value: lastName, onChange: setLastName },
            { label: "Email", value: email, onChange: () => {}, disabled: true },
            { label: "Phone", value: phone, onChange: setPhone },
            { label: "Company", value: company, onChange: setCompany },
          ].map(field => (
            <div key={field.label}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#0A1628", marginBottom: 6 }}>{field.label}</label>
              <input value={field.value} onChange={e => field.onChange(e.target.value)} disabled={field.disabled}
                style={{ width: "100%", height: 48, borderRadius: 10, border: "1px solid #E5E7EB", padding: "0 16px", fontSize: 15, color: "#111827", outline: "none", background: field.disabled ? "#F8F6F0" : "white", boxSizing: "border-box" }} />
            </div>
          ))}
        </div>
        <button type="button" style={{ marginTop: 20, width: "100%", height: 48, borderRadius: 10, background: "#2E58EC", color: "white", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Save Changes
        </button>
      </div>
    </motion.div>
  );
}

// ── SETTINGS SECTION ──────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }) {
  return (
    <motion.div onClick={() => onChange(!enabled)}
      style={{ width: 44, height: 24, borderRadius: 12, background: enabled ? "#0A1628" : "#E5E7EB", position: "relative", cursor: "pointer", display: "flex", alignItems: "center", padding: 2, flexShrink: 0 }}
      animate={{ background: enabled ? "#0A1628" : "#E5E7EB" }} transition={{ duration: 0.2 }}>
      <motion.div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
        animate={{ x: enabled ? 20 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </motion.div>
  );
}

function SettingsSection() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  const rows = [
    { title: "Email Notifications", desc: "Booking confirmations and updates", value: emailNotifs, onChange: setEmailNotifs },
    { title: "SMS Notifications", desc: "Critical alerts via text message", value: smsNotifs, onChange: setSmsNotifs },
    { title: "Marketing Emails", desc: "Offers, tips and new spaces", value: marketingEmails, onChange: setMarketingEmails },
    { title: "Two-Factor Auth", desc: "Extra security for your account", value: twoFactor, onChange: setTwoFactor },
    { title: "Profile Visibility", desc: "Show profile to hosts", value: profileVisible, onChange: setProfileVisible },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 24 }}>Account Settings</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, i) => (
          <div key={row.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderTop: i === 0 ? "none" : "1px solid #F3F4F6" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0A1628" }}>{row.title}</p>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{row.desc}</p>
            </div>
            <Toggle enabled={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 24, marginTop: 8 }}>
        <button type="button" style={{ border: "1px solid #DC2626", color: "#DC2626", background: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Delete Account
        </button>
      </div>
    </motion.div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function CustomerDashboard({ section = "overview" }) {
  const currentUser = getUser();
  const displayName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    : currentUser?.email?.split("@")[0] || "there";

  const resolvedSection = SECTION_TITLES[section] ? section : "overview";

  return (
    <CustomerLayout title={SECTION_TITLES[resolvedSection]}>
      {resolvedSection === "overview" && <OverviewSection displayName={displayName} />}
      {resolvedSection === "bookings" && <BookingsSection />}
      {resolvedSection === "saved" && <SavedSection />}
      {resolvedSection === "messages" && <MessagesSection />}
      {resolvedSection === "reviews" && <ReviewsSection />}
      {resolvedSection === "profile" && <ProfileSection />}
      {resolvedSection === "settings" && <SettingsSection />}
    </CustomerLayout>
  );
}