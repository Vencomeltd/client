import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
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
import DashboardLayout from "../layouts/DashboardLayout";
import PropertyCard from "../components/PropertyCard";
import Modal from "../components/Modal";
import { getUser } from "../utils/auth";

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

const formatStatusLabel = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "pending") return "Pending";
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "completed") return "Completed";
  if (normalized === "declined") return "Declined";
  return status || "Pending";
};

const getBookingTab = (booking) => {
  const status = String(booking.status || "").toLowerCase();
  const checkIn = booking.checkIn ? new Date(booking.checkIn) : null;
  const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;
  const now = new Date();

  if (status === "cancelled") return "cancelled";
  if (checkIn && checkIn > now) return "upcoming";
  if (checkIn && checkOut && checkIn <= now && checkOut >= now) return "current";
  return "past";
};

const getBookingLocation = (booking) =>
  booking.property?.location?.city || "";

const getListingLocation = (listing) =>
  [listing.location?.city, listing.location?.country].filter(Boolean).join(", ");

const getListingCardProps = (listing) => ({
  id: listing._id,
  image: listing.coverImage,
  title: listing.title,
  location: listing.location?.city || "",
  category: listing.category?.name || "",
  price: listing.pricing?.hourly || 0,
  priceUnit: listing.pricing?.hourly ? "hr" : "POA",
  rating: listing.rating || 0,
  reviewCount: listing.reviewNumber || 0,
});

// ── STATUS BADGE ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending: { bg: "#FEF9C3", text: "#854D0E" },
    confirmed: { bg: "#F0FDF4", text: "#166534" },
    cancelled: { bg: "#FEF2F2", text: "#991B1B" },
    completed: { bg: "#F3F4F6", text: "#374151" },
    declined: { bg: "#FEF2F2", text: "#991B1B" },
  };
  const normalized = String(status || "").toLowerCase();
  const s = map[normalized] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.text, borderRadius: 9999, padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {formatStatusLabel(status)}
    </span>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────

function DashboardSearch() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [guests, setGuests] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  // Real categories from the DB, matching the navbar's "Type of Space"
  // picker so a category picked here filters the same way on /search.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setActiveField(null);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (selectedCategoryId) params.set("category", selectedCategoryId);
    if (guests > 0) params.set("capacity", String(guests));
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    setActiveField(null);
  };

  return (
    <div ref={wrapRef}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
      style={{
        background: "white", borderRadius: 20,
        border: "1.5px solid #E5E7EB",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: 14,
        marginTop: 20,
        position: "relative",
      }}
    >
      {/* LOCATION */}
      <div className="sm:flex-1" style={{ position: "relative", minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#6B7280", letterSpacing: 0.6 }}>
          LOCATION
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <Search size={16} color="#6B7280" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Search location"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 14, color: "#111827", background: "transparent",
              minWidth: 0,
            }}
          />
        </div>
      </div>

      <div className="hidden sm:block" style={{ width: 1, height: 32, background: "#E5E7EB", flexShrink: 0 }} />
      <div className="sm:hidden" style={{ height: 1, background: "#F3F4F6" }} />

      {/* TYPE OF SPACE */}
      <div className="sm:flex-1" style={{ position: "relative", minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#6B7280", letterSpacing: 0.6 }}>
          TYPE OF SPACE
        </div>
        <button
          type="button"
          onClick={() => setActiveField(v => v === "type" ? null : "type")}
          style={{
            width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
            fontSize: 14, color: selectedType ? "#111827" : "#9CA3AF",
            padding: 0, marginTop: 3,
          }}
        >
          {selectedType || "Select type"}
        </button>
        <AnimatePresence>
          {activeField === "type" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="sm:absolute sm:w-auto"
              style={{
                position: "relative", top: 0, left: 0, width: "100%", marginTop: 10,
                background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)", padding: 16, zIndex: 30,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categories.map(cat => (
                  <button key={cat._id} type="button"
                    onClick={() => { setSelectedType(cat.name); setSelectedCategoryId(cat._id); setActiveField(null); }}
                    style={{
                      padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500,
                      cursor: "pointer", border: "1px solid #E5E7EB",
                      background: selectedCategoryId === cat._id ? "#0A1628" : "white",
                      color: selectedCategoryId === cat._id ? "white" : "#111827",
                    }}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden sm:block" style={{ width: 1, height: 32, background: "#E5E7EB", flexShrink: 0 }} />
      <div className="sm:hidden" style={{ height: 1, background: "#F3F4F6" }} />

      {/* CAPACITY */}
      <div className="sm:flex-1" style={{ position: "relative", minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#6B7280", letterSpacing: 0.6 }}>
          CAPACITY
        </div>
        <button
          type="button"
          onClick={() => setActiveField(v => v === "capacity" ? null : "capacity")}
          style={{
            width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer",
            fontSize: 14, color: guests > 0 ? "#111827" : "#9CA3AF",
            padding: 0, marginTop: 3,
          }}
        >
          {guests > 0 ? `${guests} ${guests === 1 ? "person" : "people"}` : "Add people"}
        </button>
        <AnimatePresence>
          {activeField === "capacity" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="sm:absolute sm:w-auto"
              style={{
                position: "relative", top: 0, right: 0, width: "100%", marginTop: 10,
                background: "white", borderRadius: 14, border: "1px solid #E5E7EB",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)", padding: 16, minWidth: 240, zIndex: 30,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>People / Workstations</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={() => setGuests(g => Math.max(0, g - 1))}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "white", fontSize: 16, cursor: "pointer" }}>
                    −
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{guests}</span>
                  <button type="button" onClick={() => setGuests(g => g + 1)}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "white", fontSize: 16, cursor: "pointer" }}>
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className="w-full sm:w-auto"
        style={{
          background: "#2E58EC", color: "white",
          border: "none", borderRadius: 9999,
          padding: "12px 20px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        Find a Space
      </button>
    </div>
  );
}

// ── OVERVIEW SECTION ──────────────────────────────────────────────────────────

function OverviewSection({ displayName, bookings, savedListings, stats, loading }) {
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/properties?limit=8`);
        const data = await res.json();
        setListings(data.properties || []);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchListings();
  }, []);

  const statCards = [
    { icon: CalendarDays, label: "Total Bookings", value: stats.totalBookings, sub: "All bookings" },
    { icon: Clock, label: "Upcoming", value: stats.upcomingBookings, sub: "Confirmed ahead" },
    { icon: Heart, label: "Saved Spaces", value: stats.savedSpaces, sub: "Ready to revisit" },
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
      <div style={{ display: "grid", gap: 16, marginBottom: 32 }}
        className="grid-cols-1 sm:grid-cols-3">
        {(loading ? Array.from({ length: 3 }, (_, index) => ({ id: index })) : statCards).map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label || item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "20px 24px" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: "50%", height: 12, borderRadius: 9999, background: "#F3F4F6" }} />
                    <div style={{ width: "35%", height: 28, borderRadius: 8, background: "#F3F4F6", marginTop: 8 }} />
                    <div style={{ width: "55%", height: 10, borderRadius: 9999, background: "#F3F4F6", marginTop: 8 }} />
                  </div>
                </div>
              ) : (
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
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Recent Bookings</h2>
          <Link
            to="/customer/bookings"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2E58EC",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={`booking-skeleton-${index}`} style={{ display: "flex", gap: 16, background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 16, alignItems: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 10, background: "#F3F4F6", flexShrink: 0 }} className="hidden sm:block" />
                <div style={{ flex: 1 }}>
                  <div style={{ width: "45%", height: 14, borderRadius: 9999, background: "#F3F4F6" }} />
                  <div style={{ width: "60%", height: 12, borderRadius: 9999, background: "#F3F4F6", marginTop: 10 }} />
                  <div style={{ width: "50%", height: 12, borderRadius: 9999, background: "#F3F4F6", marginTop: 8 }} />
                </div>
                <div style={{ width: 110, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <div style={{ width: "70%", height: 14, borderRadius: 9999, background: "#F3F4F6" }} />
                  <div style={{ width: "80%", height: 26, borderRadius: 9999, background: "#F3F4F6" }} />
                </div>
              </div>
            ))
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 14, border: "1px solid #E5E7EB" }}>
              <CalendarDays size={40} color="#E5E7EB" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#111827", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>
                No bookings yet
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "24px" }}>
                Find and book your first commercial space
              </p>
              <a
                href="/search"
                style={{
                  background: "#0A1628",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Browse Spaces
              </a>
            </div>
          ) : (
            bookings.slice(0, 5).map((booking, i) => (
              <motion.div key={booking._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                style={{ display: "flex", gap: 16, background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 16, alignItems: "center" }}>
                {booking.property?.coverImage ? (
                  <img
                    src={booking.property.coverImage}
                    alt={booking.property?.title || "Property"}
                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                    className="hidden sm:block"
                  />
                ) : (
                  <div
                    style={{ width: 72, height: 72, borderRadius: 10, background: "#E5E7EB", flexShrink: 0 }}
                    className="hidden sm:block"
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {booking.property?.title || "Property"}
                  </p>
                  <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6B7280" }}>
                      <MapPin size={13} />
                      {getBookingLocation(booking)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#6B7280" }}>
                      <Clock size={13} />
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#0A1628" }}>{formatCurrency(booking.totalPrice)}</p>
                  <StatusBadge status={booking.status} />
                  <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>View Details</Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Browse Spaces */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Popular Spaces</h2>
          <Link
            to="/search"
            style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }} className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loadingListings ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`listing-skeleton-${index}`} style={{ minWidth: 240, flexShrink: 0, height: 310, borderRadius: 18, background: "#F3F4F6" }} />
            ))
          ) : listings.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px", textAlign: "center", background: "white", borderRadius: 14, border: "1px solid #E5E7EB", minWidth: "100%" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#0A1628" }}>No spaces available yet</p>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Check back soon as more hosts join VenCome</p>
            </div>
          ) : (
            listings.map((listing) => (
              <div key={listing._id} style={{ minWidth: 240, flexShrink: 0 }}>
                <PropertyCard {...getListingCardProps(listing)} property={listing} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saved Spaces */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628" }}>Saved Spaces</h2>
          <Link
            to="/customer/saved"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#2E58EC",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }} className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={`saved-skeleton-${index}`} style={{ minWidth: 240, flexShrink: 0, height: 310, borderRadius: 18, background: "#F3F4F6" }} />
            ))
          ) : savedListings.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px", textAlign: "center", background: "white", borderRadius: 14, border: "1px solid #E5E7EB", minWidth: "100%" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginTop: 4 }}>No saved spaces yet</p>
              <Link to="/search" style={{ marginTop: 20, padding: "12px 24px", borderRadius: 9999, background: "#2E58EC", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Browse Spaces
              </Link>
            </div>
          ) : (
            savedListings.slice(0, 4).map((listing) => (
              <Link key={listing._id} to={`/property/${listing._id}`} style={{ minWidth: 240, flexShrink: 0, textDecoration: "none" }}>
                <PropertyCard {...getListingCardProps(listing)} />
              </Link>
            ))
          )}
        </div>
      </div>

    </motion.div>
  );
}

// ── BOOKINGS SECTION ──────────────────────────────────────────────────────────

function BookingsSection({ bookings, loading }) {
  const TABS = [
    { id: "upcoming", label: `Upcoming (${bookings.filter((b) => getBookingTab(b) === "upcoming").length})` },
    { id: "current", label: `Current (${bookings.filter((b) => getBookingTab(b) === "current").length})` },
    { id: "past", label: `Past (${bookings.filter((b) => getBookingTab(b) === "past").length})` },
    { id: "cancelled", label: `Cancelled (${bookings.filter((b) => getBookingTab(b) === "cancelled").length})` },
  ];
  const [activeTab, setActiveTab] = useState("upcoming");
  const list = bookings.filter((booking) => getBookingTab(booking) === activeTab);

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
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`full-booking-skeleton-${index}`} style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column" }} className="md:flex-row">
                <div style={{ width: "100%", height: 160, background: "#F3F4F6" }} className="md:w-[160px] md:h-[140px]" />
                <div style={{ flex: 1, padding: 20 }}>
                  <div style={{ width: "45%", height: 16, borderRadius: 9999, background: "#F3F4F6" }} />
                  <div style={{ width: "60%", height: 12, borderRadius: 9999, background: "#F3F4F6", marginTop: 12 }} />
                  <div style={{ width: "50%", height: 12, borderRadius: 9999, background: "#F3F4F6", marginTop: 8 }} />
                  <div style={{ width: "20%", height: 24, borderRadius: 9999, background: "#F3F4F6", marginTop: 18 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center" }}>
          {bookings.length === 0 ? (
            <>
              <CalendarDays size={40} color="#E5E7EB" style={{ marginBottom: "12px" }} />
              <p style={{ color: "#111827", fontWeight: "600", fontSize: "16px", marginBottom: "8px" }}>
                No bookings yet
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "24px" }}>
                Find and book your first commercial space
              </p>
              <a
                href="/search"
                style={{
                  background: "#0A1628",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Browse Spaces
              </a>
            </>
          ) : (
            <>
              <CalendarX size={48} color="#E5E7EB" />
              <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>
                No {activeTab} bookings
              </p>
              <p style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>Nothing to show here right now.</p>
              {activeTab === "upcoming" && (
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
                  }}
                >
                  Find a Space
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {list.map(booking => (
            <div key={booking._id} style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column" }} className="md:flex-row">
                {booking.property?.coverImage ? (
                  <img
                    src={booking.property.coverImage}
                    alt={booking.property?.title || "Property"}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                    className="md:w-[160px] md:h-[140px]"
                  />
                ) : (
                  <div
                    style={{ width: "100%", height: 160, background: "#E5E7EB" }}
                    className="md:w-[160px] md:h-[140px]"
                  />
                )}
                <div style={{ flex: 1, padding: 20, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {booking.property?.title || "Property"}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}><MapPin size={13} />{getBookingLocation(booking)}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}><Clock size={13} />{formatDate(booking.checkIn)} · {formatDate(booking.checkOut)}</span>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", marginTop: 16 }}>{formatCurrency(booking.totalPrice)}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8F6F0", padding: "12px 20px", flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 12, color: "#6B7280" }}>Ref: {booking.bookingReference || booking._id}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Link to="/customer/bookings" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>View Details</Link>
                  {getBookingTab(booking) === "upcoming" && (
                    <Link to="/customer/messages" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>Message Host</Link>
                  )}
                  {getBookingTab(booking) === "past" && !booking.hasReview && (
                    <Link to="/customer/reviews" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>Leave a Review</Link>
                  )}
                  {getBookingTab(booking) === "past" && (
                    <Link to="/search" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", textDecoration: "none" }}>Book Again</Link>
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

function SavedSection({ savedListings, loading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628" }}>Saved Spaces ({savedListings.length})</h2>
        <Link
          to="/search"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#2E58EC",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Find more spaces
          <ArrowRight size={14} />
        </Link>
      </div>
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`saved-grid-skeleton-${index}`} style={{ height: 310, borderRadius: 18, background: "#F3F4F6" }} />
          ))}
        </div>
      ) : savedListings.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", textAlign: "center", background: "white", borderRadius: 16, border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginTop: 4 }}>No saved spaces yet</p>
          <Link to="/search" style={{ marginTop: 24, padding: "12px 24px", borderRadius: 9999, background: "#2E58EC", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Browse Spaces
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {savedListings.slice(0, 4).map((listing) => (
            <Link key={listing._id} to={`/property/${listing._id}`} style={{ textDecoration: "none" }}>
              <PropertyCard {...getListingCardProps(listing)} />
            </Link>
          ))}
        </div>
      )}
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
      style={{ display: "grid", gap: 24 }} className="grid-cols-1 lg:grid-cols-2">
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <User size={36} color="#2E58EC" />
        </div>
        <button type="button" style={{ fontSize: 13, fontWeight: 600, color: "#2E58EC", background: "none", border: "none", cursor: "pointer", marginTop: 12 }}>Edit Photo</button>
        <p style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginTop: 16 }}>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : email}
        </p>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{email}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#2E58EC", borderRadius: 9999, padding: "4px 12px", fontSize: 10, fontWeight: 700, marginTop: 12 }}>
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
  const navigate = useNavigate();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDeleteError(data.error || "Something went wrong. Please try again.");
        setDeleting(false);
        return;
      }

      localStorage.removeItem("vencome_token");
      localStorage.removeItem("vencome_refresh");
      localStorage.removeItem("vencome_user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

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
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          style={{ border: "1px solid #DC2626", color: "#DC2626", background: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Delete Account
        </button>
      </div>

      <Modal isOpen={showDeleteModal} onClose={closeDeleteModal}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 8 }}>Delete your account?</h3>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5, marginBottom: 16 }}>
          This permanently deletes your VenCome account and cannot be undone. If you have active listings,
          unresolved bookings, or a payout still in escrow, you'll need to resolve those first.
        </p>

        {deleteError ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {deleteError}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={deleting}
            style={{ border: "1px solid #E5E7EB", color: "#111827", background: "white", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            style={{ border: "none", color: "white", background: "#DC2626", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? "Deleting..." : "Yes, Delete Account"}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function CustomerDashboard({ section = "overview" }) {
  const token = localStorage.getItem("vencome_token");
  const user = JSON.parse(localStorage.getItem("vencome_user") || "{}");
  const [bookings, setBookings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    savedSpaces: 0,
  });
  const [loading, setLoading] = useState(true);
  const displayName = user.displayName || user.firstName || user.email || "there";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [bookingsRes, savedRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/bookings`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/users/saved-listings`, { headers }),
        ]);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          const allBookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];
          setBookings(allBookings);
          setStats((prev) => ({
            ...prev,
            totalBookings: allBookings.length,
            upcomingBookings: allBookings.filter(
              (booking) =>
                String(booking.status || "").toLowerCase() === "confirmed" &&
                booking.checkIn &&
                new Date(booking.checkIn) > new Date()
            ).length,
          }));
        }

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          const saved = savedData.savedListings || savedData.listings || [];
          setSavedListings(saved);
          setStats((prev) => ({ ...prev, savedSpaces: saved.length }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const resolvedSection = SECTION_TITLES[section] ? section : "overview";

  return (
    <DashboardLayout title={SECTION_TITLES[resolvedSection]}>
      {resolvedSection === "overview" && (
        <OverviewSection
          displayName={displayName}
          bookings={bookings}
          savedListings={savedListings}
          stats={stats}
          loading={loading}
        />
      )}
      {resolvedSection === "bookings" && <BookingsSection bookings={bookings} loading={loading} />}
      {resolvedSection === "saved" && <SavedSection savedListings={savedListings} loading={loading} />}
      {resolvedSection === "messages" && <MessagesSection />}
      {resolvedSection === "reviews" && <ReviewsSection />}
      {resolvedSection === "profile" && <ProfileSection />}
      {resolvedSection === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}
