import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Building2,
  CalendarDays,
  Castle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Factory,
  Gem,
  Globe,
  Globe2,
  GraduationCap,
  HelpCircle,
  House,
  Landmark,
  LogIn,
  Menu,
  Sailboat,
  Search,
  Star,
  Trees,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const COLORS = {
  blue: "#2E58EC",
  navy: "#0A1628",
  white: "#FFFFFF",
  background: "#F8F6F0",
  border: "#E5E7EB",
  grey: "#6B7280",
  glassBg: "rgba(255,255,255,0.15)",
  glassBorder: "rgba(255,255,255,0.25)",
};

const TABS = [
  { id: "spaces", label: "Spaces", icon: Building2 },
  { id: "short-term", label: "Short Term", icon: Clock },
  { id: "long-term", label: "Long Term", icon: CalendarDays },
];

const CITY_SUGGESTIONS = [
  { name: "London", desc: "United Kingdom", Icon: Landmark },
  { name: "Manchester", desc: "United Kingdom", Icon: Factory },
  { name: "Birmingham", desc: "United Kingdom", Icon: Building2 },
  { name: "Edinburgh", desc: "United Kingdom", Icon: Castle },
  { name: "Leeds", desc: "United Kingdom", Icon: GraduationCap },
  { name: "Dubai", desc: "United Arab Emirates", Icon: Gem },
  { name: "Riyadh", desc: "Saudi Arabia", Icon: Star },
  { name: "Abu Dhabi", desc: "United Arab Emirates", Icon: Sailboat },
  { name: "Doha", desc: "Qatar", Icon: Globe2 },
  { name: "Kuwait City", desc: "Kuwait", Icon: Trees },
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const LEASE_OPTIONS = ["Monthly", "Quarterly", "6 Months", "Annual", "Custom"];

function formatDate(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Local YYYY-MM-DD -- deliberately not toISOString(), which converts to UTC
// first and can shift the date by a day for users west of UTC.
function formatInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNextFriday(base) {
  const d = new Date(base);
  const day = d.getDay();
  const delta = (5 - day + 7) % 7;
  d.setDate(d.getDate() + delta);
  return d;
}

function MiniCalendar({ calMonth, calYear, setCalMonth, setCalYear, selectedDate, onSelect }) {
  const today = new Date();
  const monthStart = new Date(calYear, calMonth, 1);
  const monthEnd = new Date(calYear, calMonth + 1, 0);
  const firstDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calYear, calMonth, d));
  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const todayStart = startOfDay(today);

  return (
    <div style={{ minWidth: 280 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button type="button" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: COLORS.background, color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{monthLabel}</span>
        <button type="button" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
          style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: COLORS.background, color: COLORS.navy, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {WEEKDAYS.map(d => (
          <span key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: COLORS.grey, padding: "4px 0" }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((date, i) => {
          if (!date) return <span key={`e-${i}`} style={{ height: 36 }} />;
          const isPast = startOfDay(date) < todayStart;
          const isToday = startOfDay(date).getTime() === todayStart.getTime();
          const isSelected = selectedDate && startOfDay(date).getTime() === startOfDay(selectedDate).getTime();
          return (
            <button key={date.toISOString()} type="button" disabled={isPast} onClick={() => onSelect(date)}
              style={{ height: 36, width: 36, borderRadius: "50%", border: isToday ? "2px solid " + COLORS.blue : "none", background: isSelected ? COLORS.navy : "transparent", color: isSelected ? "white" : isPast ? "#D1D5DB" : "#111827", fontSize: 13, fontWeight: 500, cursor: isPast ? "not-allowed" : "pointer", opacity: isPast ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center", justifySelf: "center" }}
              onMouseEnter={e => { if (!isPast && !isSelected) e.currentTarget.style.background = COLORS.background; }}
              onMouseLeave={e => { if (!isPast) e.currentTarget.style.background = isSelected ? COLORS.navy : "transparent"; }}>
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <motion.div onClick={() => onChange(!enabled)}
      style={{ width: 44, height: 24, borderRadius: 9999, background: enabled ? COLORS.navy : COLORS.border, padding: 2, display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}
      animate={{ background: enabled ? COLORS.navy : COLORS.border }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}>
      <motion.div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </motion.div>
  );
}

export default function Navbar({ activeTab: activeTabProp, onTabChange }) {
  const navigate = useNavigate();
  const location_path = useLocation();
  const isHomePage = location_path.pathname === "/";
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("vencome_user") || "null");
    } catch {
      return null;
    }
  })();
  const isLoggedIn = !!currentUser && !!localStorage.getItem("vencome_token");
  const isHost = currentUser?.isHost === true;
  const userInitials = currentUser
    ? (
        (
          currentUser.displayName ||
          `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
          currentUser.email ||
          ""
        )
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      ) || "U"
    : "";
  const navRef = useRef(null);
  const searchBarRef = useRef(null);
  const menuRef = useRef(null);
  const globeRef = useRef(null);

  // ── SCROLL STATE ──────────────────────────────────────────────────────────
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleNativeScroll = () => {
      const currentScrollTop = Math.max(
        typeof window !== "undefined" ? window.scrollY : 0,
        document.documentElement?.scrollTop ?? 0,
        document.body?.scrollTop ?? 0
      );
      const hasScrolled = currentScrollTop > 80;

      setScrolled(hasScrolled);
      if (!hasScrolled) {
        setPillExpanded(false);
        setActiveField(null);
      }
    };

    handleNativeScroll();
    document.addEventListener("scroll", handleNativeScroll, true);
    return () => document.removeEventListener("scroll", handleNativeScroll, true);
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      setPillExpanded(false);
    }
  }, [isHomePage]);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
    }
  }, []);

  const navBg = (scrolled || !isHomePage) ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.12)";
  const navShadow = (scrolled || !isHomePage) ? "0 2px 12px rgba(0,0,0,0.08)" : "0 0px 0px rgba(0,0,0,0)";

  // ── UI STATE ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(activeTabProp ?? "spaces");
  const [pillExpanded, setPillExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [globeOpen, setGlobeOpen] = useState(false);
  const [globeTab, setGlobeTab] = useState("language");
  const [activeField, setActiveField] = useState(null);
  const [location, setLocation] = useState("");
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [when, setWhen] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [guests, setGuests] = useState(0);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English — United Kingdom");
  const [selectedCurrency, setSelectedCurrency] = useState("GBP £");

  useEffect(() => {
    if (activeTabProp) setActiveTab(activeTabProp);
  }, [activeTabProp]);

  // Real categories from the DB -- the "Type of Space" pill selector used to
  // be a hardcoded label list disconnected from actual Category documents,
  // so picking a type here never matched anything on the search results
  // page (which filters by real Category _id). Fetched once on mount.
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
    if (window.google?.maps?.places) return;
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!location || location.length < 2) {
      setGoogleSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        if (!window.google?.maps?.places) return;
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: location,
            types: ["(cities)"],
            componentRestrictions: null,
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setGoogleSuggestions(predictions.slice(0, 5));
            } else {
              setGoogleSuggestions([]);
            }
          }
        );
      } catch (err) {
        setGoogleSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [location]);

  // ── WHAT TO SHOW ───────────────────────────────────────────────────────────
  // Not scrolled → show full expanded bar + tabs (hero state)
  // Scrolled + pill not expanded → show collapsed pill only
  // Scrolled + pill expanded → show full expanded bar + tabs (no collapse on tab switch)
  const isHeroState = isHomePage && !scrolled;
  const isExpandedState = (!isHomePage || scrolled) && pillExpanded;
  const isCollapsedState = (!isHomePage && !pillExpanded) || (scrolled && !pillExpanded);
  const showCenterTabs = isHeroState || isExpandedState;
  const showFullSearchBar = isHeroState || isExpandedState;
  const showCollapsedPill = isCollapsedState;

  // ── CLICK OUTSIDE ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (globeRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      if (searchBarRef.current?.contains(e.target)) return;
      if (navRef.current?.contains(e.target)) {
        setActiveField(null);
        return;
      }
      setActiveField(null);
      if (scrolled) setPillExpanded(false);
      setMenuOpen(false);
      setGlobeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [scrolled]);

  useEffect(() => {
    document.body.style.overflow = globeOpen || (menuOpen && window.innerWidth < 768) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [globeOpen, menuOpen]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const query = new URLSearchParams();
    if (location) query.set("location", location);
    // Real category _id, not the display label -- the search results page
    // filters by Category _id, and "type" (the old label-based param) was
    // never even read there, so picking a type silently did nothing before.
    // Doesn't apply on the long-term tab, where this same field picks a
    // lease length instead of a space category.
    if (selectedCategoryId && activeTab !== "long-term") {
      query.set("category", selectedCategoryId);
    }
    // Single anchor date -> a 1-day availability window, so the results
    // page can filter out spaces that are already booked/blocked that day.
    if (selectedDate) {
      const checkIn = formatInputDate(selectedDate);
      const checkOutDate = new Date(selectedDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      query.set("checkIn", checkIn);
      query.set("checkOut", formatInputDate(checkOutDate));
    }
    if (guests > 0) query.set("capacity", String(guests));
    if (activeTab) query.set("mode", activeTab);
    navigate(`/search?${query.toString()}`);
    setActiveField(null);
    setPillExpanded(false);
    setMenuOpen(false);
  };

  const handleQuickDate = (label) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    if (label === "Today") { setSelectedDate(todayStart); setWhen(formatShortDate(todayStart)); return; }
    if (label === "Tomorrow") { const t = new Date(todayStart); t.setDate(t.getDate() + 1); setSelectedDate(t); setWhen(formatShortDate(t)); return; }
    const friday = getNextFriday(todayStart);
    setSelectedDate(friday);
    setWhen("This Weekend");
  };

  // Tab switching — NEVER collapses the search bar
  const onTabSelect = (id) => {
    setActiveTab(id);
    if (onTabChange) onTabChange(id);
    // deliberately NOT touching pillExpanded or activeField here
  };

  // ── STYLES ────────────────────────────────────────────────────────────────
  const dropdownBaseStyle = {
    position: "absolute",
    top: "calc(100% + 12px)",
    left: 0,
    background: "white",
    borderRadius: 24,
    boxShadow: "0 8px 40px rgba(10,22,40,0.15)",
    padding: 20,
    minWidth: 320,
    zIndex: 9999,
    border: "1px solid " + COLORS.border,
  };

  const tabIconActive = (isHeroState) ? "white" : COLORS.navy;
  const tabIconInactive = (isHeroState) ? "rgba(255,255,255,0.7)" : COLORS.grey;
  const tabUnderlineColor = (isHeroState) ? "white" : COLORS.blue;

  // ── FULL SEARCH BAR (used in both hero state and expanded state) ───────────
  const FullSearchBar = (
    <motion.div
      ref={searchBarRef}
      key="full-search"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 9999,
        border: scrolled ? "1.5px solid #E5E7EB" : "none",
        boxShadow: scrolled
          ? "0 2px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)"
          : "0 8px 32px rgba(0,0,0,0.2)",
        maxWidth: 760,
        width: "100%",
        margin: "0 auto",
        position: "relative",
        zIndex: 9999,
        overflow: "visible",
      }}
    >
      {/* LOCATION */}
      <div style={{ flex: 1.4, padding: "14px 20px", position: "relative" }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>LOCATION</span>
        <input
          value={location}
          onChange={e => { setLocation(e.target.value); setActiveField("location"); }}
          onFocus={() => setActiveField("location")}
          placeholder="Search location"
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#111827", marginTop: 3 }}
        />
        <AnimatePresence>
          {activeField === "location" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{ ...dropdownBaseStyle, maxHeight: "min(70vh, calc(100vh - 140px))", overflowY: "auto", overflowX: "hidden" }}
            >
              {/* Suggested cities — show when input is empty or matches */}
              {CITY_SUGGESTIONS.filter(c =>
                !location || c.name.toLowerCase().includes(location.toLowerCase())
              ).length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, marginBottom: 12, letterSpacing: 1 }}>
                    Suggested Destinations
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: googleSuggestions.length > 0 ? 16 : 0 }}>
                    {CITY_SUGGESTIONS.filter(c =>
                      !location || c.name.toLowerCase().includes(location.toLowerCase())
                    ).map(city => {
                      const CityIcon = city.Icon;
                      return (
                        <button key={city.name} type="button"
                          onClick={() => { setLocation(city.name); setGoogleSuggestions([]); setActiveField(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F8F6F0"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <CityIcon size={18} color="#2E58EC" />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{city.name}</div>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>{city.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Google Places results — show when user is typing */}
              {googleSuggestions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, marginBottom: 12, letterSpacing: 1 }}>
                    Search Results
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {googleSuggestions.map(suggestion => (
                      <button key={suggestion.place_id} type="button"
                        onClick={() => {
                          setLocation(suggestion.structured_formatting?.main_text || suggestion.description);
                          setGoogleSuggestions([]);
                          setActiveField(null);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F8F6F0"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#2E58EC" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>
                            {suggestion.structured_formatting?.main_text || suggestion.description.split(",")[0]}
                          </div>
                          <div style={{ fontSize: 12, color: "#6B7280" }}>
                            {suggestion.structured_formatting?.secondary_text || suggestion.description.split(",").slice(1).join(",").trim()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ width: 1, height: 28, background: COLORS.border, flexShrink: 0 }} />

      {/* WHEN */}
      <div style={{ flex: 1.2, padding: "14px 20px", position: "relative" }}>
        <button type="button" onClick={() => setActiveField(v => v === "when" ? null : "when")}
          style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
            {activeTab === "long-term" ? "MOVE-IN DATE" : "WHEN"}
          </span>
          <div style={{ fontSize: 13, color: selectedDate || when ? "#111827" : "#9CA3AF", marginTop: 3 }}>
            {selectedDate ? formatShortDate(selectedDate) : when || (activeTab === "long-term" ? "Add date" : "Add dates")}
          </div>
        </button>
        <AnimatePresence>
          {activeField === "when" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ ...dropdownBaseStyle, minWidth: 520 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                  {(() => {
                    const today = new Date();
                    const tomorrow = new Date(startOfDay(today)); tomorrow.setDate(tomorrow.getDate() + 1);
                    const friday = getNextFriday(startOfDay(today));
                    const sunday = new Date(friday); sunday.setDate(sunday.getDate() + 2);
                    return [
                      { label: "Today", sub: today.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) },
                      { label: "Tomorrow", sub: tomorrow.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) },
                      { label: "This Weekend", sub: `${friday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` },
                    ];
                  })().map(opt => (
                    <button key={opt.label} type="button"
                      onClick={() => { handleQuickDate(opt.label); setActiveField(null); }}
                      style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid", borderColor: when === opt.label ? COLORS.navy : COLORS.border, background: when === opt.label ? "rgba(10,22,40,0.04)" : "white", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 2 }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
                <MiniCalendar calMonth={calMonth} calYear={calYear} setCalMonth={setCalMonth} setCalYear={setCalYear}
                  selectedDate={selectedDate} onSelect={date => { setSelectedDate(date); setWhen(formatDate(date)); setActiveField(null); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ width: 1, height: 28, background: COLORS.border, flexShrink: 0 }} />

      {/* TYPE OF SPACE */}
      <div style={{ flex: 1, padding: "14px 20px", position: "relative" }}>
        <button type="button" onClick={() => setActiveField(v => v === "type" ? null : "type")}
          style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
            {activeTab === "long-term" ? "LEASE LENGTH" : "TYPE OF SPACE"}
          </span>
          <div style={{ fontSize: 13, color: selectedType ? "#111827" : "#9CA3AF", marginTop: 3 }}>
            {selectedType || (activeTab === "long-term" ? "Add length" : "Select type")}
          </div>
        </button>
        <AnimatePresence>
          {activeField === "type" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ ...dropdownBaseStyle, minWidth: 340 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {activeTab === "long-term"
                  ? LEASE_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      onClick={() => { setSelectedType(opt); setActiveField(null); }}
                      style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid " + COLORS.border, background: selectedType === opt ? COLORS.navy : "white", color: selectedType === opt ? "white" : "#111827" }}>
                      {opt}
                    </button>
                  ))
                  : categories.map(cat => (
                    <button key={cat._id} type="button"
                      onClick={() => { setSelectedType(cat.name); setSelectedCategoryId(cat._id); setActiveField(null); }}
                      style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid " + COLORS.border, background: selectedCategoryId === cat._id ? COLORS.navy : "white", color: selectedCategoryId === cat._id ? "white" : "#111827" }}>
                      {cat.name}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ width: 1, height: 28, background: COLORS.border, flexShrink: 0 }} />

      {/* CAPACITY / GUESTS */}
      <div style={{ flex: 1, padding: "14px 20px", position: "relative" }}>
        <button type="button" onClick={() => setActiveField(v => v === "capacity" ? null : "capacity")}
          style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
            CAPACITY
          </span>
          <div style={{ fontSize: 13, color: guests > 0 ? "#111827" : "#9CA3AF", marginTop: 3 }}>
            {guests > 0 ? `${guests} ${guests === 1 ? "person" : "people"}` : "Add people"}
          </div>
        </button>
        <AnimatePresence>
          {activeField === "capacity" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ ...dropdownBaseStyle, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>People / Workstations</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={() => setGuests(g => Math.max(0, g - 1))}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", fontSize: 16, cursor: "pointer" }}>
                    −
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{guests}</span>
                  <button type="button" onClick={() => setGuests(g => g + 1)}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", fontSize: 16, cursor: "pointer" }}>
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEARCH BUTTON */}
      <button type="button" onClick={handleSearch}
        style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: 6, flexShrink: 0, boxShadow: "0 4px 16px rgba(46,88,236,0.4)" }}>
        <Search size={18} color="white" />
      </button>
    </motion.div>
  );

  // ── COLLAPSED PILL ─────────────────────────────────────────────────────────
  const CollapsedPill = (
    <motion.div
      key="collapsed-pill"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{ width: "100%", maxWidth: 460 }}
    >
      <motion.div
        role="button"
        tabIndex={0}
        onClick={() => setPillExpanded(true)}
        style={{ display: "flex", alignItems: "center", background: "white", border: "1.5px solid " + COLORS.border, borderRadius: 9999, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", width: "100%", cursor: "pointer" }}
        whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      >
        <div style={{ flex: 1, padding: "10px 18px", display: "flex", gap: 4, alignItems: "center", justifyContent: "center", minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, whiteSpace: "nowrap" }}>{location || "Location"}</span>
          <span style={{ color: COLORS.grey, margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, whiteSpace: "nowrap" }}>{when || "Dates"}</span>
          <span style={{ color: COLORS.grey, margin: "0 4px" }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, whiteSpace: "nowrap" }}>{selectedType || "Type of Space"}</span>
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); handleSearch(); }}
          style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: 6, flexShrink: 0 }}>
          <Search size={15} color="white" />
        </button>
      </motion.div>
    </motion.div>
  );

  // ── TABS ROW ──────────────────────────────────────────────────────────────
  const TabsRow = (
    <div style={{ display: "flex", gap: 4 }}>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button key={tab.id} type="button" onClick={() => onTabSelect(tab.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 20px", border: "none", background: "none", cursor: "pointer", borderRadius: 10, position: "relative" }}>
            <Icon size={15} color={active ? tabIconActive : tabIconInactive} />
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? tabIconActive : tabIconInactive }}>{tab.label}</span>
            {active && (
              <motion.div layoutId="nav-tab-line"
                style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, background: tabUnderlineColor, borderRadius: 2 }} />
            )}
          </button>
        );
      })}
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <motion.nav
        ref={navRef}
        style={{
          background: navBg,
          boxShadow: navShadow,
          zIndex: 1000,
          backdropFilter: scrolled ? "none" : "blur(16px)",
          WebkitBackdropFilter: scrolled ? "none" : "blur(16px)",
          borderBottom: scrolled ? "1px solid #E5E7EB" : "1px solid rgba(255,255,255,0.15)",
          borderRadius: scrolled ? 0 : "0 0 32px 32px",
          overflow: "visible",
          transition: "border-radius 0.3s ease",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <div className="mx-auto max-w-[1440px] px-6">

          {/* ROW 1 — Logo | Center | Actions */}
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

            {/* Logo */}
            <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
              <img src="/logo-blue.png" alt="VenCome"
                style={{ height: 40, width: "auto", objectFit: "contain", filter: (scrolled || !isHomePage) ? "none" : "brightness(0) invert(1)", transition: "filter 0.3s ease" }} />
            </Link>

            {/* Center — tabs when hero state OR expanded state | pill when collapsed */}
            <div className="hidden md:flex" style={{ flex: 1, justifyContent: "center", minWidth: 0 }}>
              <AnimatePresence mode="wait">
                {showCenterTabs ? (
                  <motion.div key="tabs-center"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}>
                    {TabsRow}
                  </motion.div>
                ) : showCollapsedPill ? (
                  <motion.div key="pill-center"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{ width: "100%", maxWidth: 460 }}>
                    {CollapsedPill}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

              {/* Publish your space / Find a space */}
              <motion.div
                animate={{ opacity: (scrolled || !isHomePage) ? 1 : 0, pointerEvents: (scrolled || !isHomePage) ? "auto" : "none" }}
                transition={{ duration: 0.2 }}
                className="hidden md:block"
              >
                {isLoggedIn ? (
                  isHost ? (
                    <Link to="/create-space"
                      style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, textDecoration: "none", padding: "8px 14px", borderRadius: 8, display: "inline-flex", alignItems: "center", minHeight: 38 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,22,40,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      Publish your space
                    </Link>
                  ) : (
                    <Link to="/search"
                      style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, textDecoration: "none", padding: "8px 14px", borderRadius: 8, display: "inline-flex", alignItems: "center", minHeight: 38 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,22,40,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      Find a Space
                    </Link>
                  )
                ) : (
                  <Link to="/create-space"
                    style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, textDecoration: "none", padding: "8px 14px", borderRadius: 8, display: "inline-flex", alignItems: "center", minHeight: 38 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,22,40,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    Publish your space
                  </Link>
                )}
              </motion.div>

              {/* Globe button */}
              <button type="button" onClick={() => setGlobeOpen(true)}
                style={{ width: 38, height: 38, borderRadius: "50%", cursor: "pointer", border: (scrolled || !isHomePage) ? "1.5px solid " + COLORS.border : "1.5px solid rgba(255,255,255,0.4)", background: (scrolled || !isHomePage) ? "white" : COLORS.glassBg, color: (scrolled || !isHomePage) ? COLORS.navy : "white", backdropFilter: (scrolled || !isHomePage) ? "none" : "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Globe size={17} />
              </button>

              {/* User initials or hamburger */}
              {isLoggedIn ? (
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(v => !v)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: "1.5px solid " + COLORS.border,
                      background: COLORS.navy,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 0.5
                    }}
                  >
                    {userInitials}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setMenuOpen(true)}
                  style={{ width: 38, height: 38, borderRadius: "50%", cursor: "pointer", border: (scrolled || !isHomePage) ? "1.5px solid " + COLORS.border : "1.5px solid rgba(255,255,255,0.4)", background: (scrolled || !isHomePage) ? "white" : COLORS.glassBg, color: (scrolled || !isHomePage) ? COLORS.navy : "white", backdropFilter: (scrolled || !isHomePage) ? "none" : "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Menu size={17} />
                </button>
              )}
            </div>
          </div>

          {/* ROW 2 — Full search bar (hero state OR expanded state) */}
          <div className="hidden md:block" style={{ overflow: "visible", paddingBottom: showFullSearchBar ? 12 : 0 }}>
            <AnimatePresence mode="wait">
              {showFullSearchBar ? FullSearchBar : null}
            </AnimatePresence>
          </div>

        </div>
      </motion.nav>

      {/* ── HAMBURGER MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: window.innerWidth < 768 ? "rgba(0,0,0,0.35)" : "transparent", zIndex: 999 }} />

            {/* Desktop dropdown */}
            <div className="hidden md:block" style={{ position: "fixed", top: 70, right: 24, zIndex: 1001 }}>
              <motion.div ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                style={{ background: "white", borderRadius: 16, border: "1px solid " + COLORS.border, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: 8, minWidth: 240 }}>
                {isLoggedIn && isHost && (
                  <>
                    {[
                      { label: "Host Dashboard", to: "/dashboard" },
                      { label: "My Listings", to: "/host/listings" },
                      { label: "Add New Space", to: "/create-space" },
                      { label: "My Bookings", to: "/dashboard/bookings" },
                      { label: "Messages", to: "/chat" },
                      { label: "Settings", to: "/settings" },
                    ].map(item => (
                      <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, textDecoration: "none", color: "#111827", fontSize: 14, fontWeight: 500 }}
                        onMouseEnter={e => { e.currentTarget.style.background = COLORS.background; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: COLORS.border, margin: "8px 6px" }} />
                    <button type="button"
                      onClick={() => {
                        localStorage.removeItem("vencome_token");
                        localStorage.removeItem("vencome_refresh");
                        localStorage.removeItem("vencome_user");
                        localStorage.removeItem("vencome_login_time");
                        setMenuOpen(false);
                        window.location.href = "/";
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#DC2626", fontSize: 14, fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      Logout
                    </button>
                  </>
                )}

                {isLoggedIn && !isHost && (
                  <>
                    {[
                      { label: "My Dashboard", to: "/customer/dashboard" },
                      { label: "My Bookings", to: "/customer/bookings" },
                      { label: "Saved Spaces", to: "/customer/saved" },
                      { label: "Messages", to: "/chat" },
                      { label: "Settings", to: "/settings" },
                    ].map(item => (
                      <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, textDecoration: "none", color: "#111827", fontSize: 14, fontWeight: 500 }}
                        onMouseEnter={e => { e.currentTarget.style.background = COLORS.background; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: COLORS.border, margin: "8px 6px" }} />
                    <button type="button"
                      onClick={() => {
                        localStorage.removeItem("vencome_token");
                        localStorage.removeItem("vencome_refresh");
                        localStorage.removeItem("vencome_user");
                        localStorage.removeItem("vencome_login_time");
                        setMenuOpen(false);
                        window.location.href = "/";
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#DC2626", fontSize: 14, fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      Logout
                    </button>
                  </>
                )}

                {!isLoggedIn && (
                  <>
                    {[
                      { icon: HelpCircle, label: "Help Center", to: "/help" },
                      { icon: Building2, label: "Become a Host", to: "/create-space", sub: "It's easy to start earning" },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, textDecoration: "none", color: "#111827" }}
                          onMouseEnter={e => { e.currentTarget.style.background = COLORS.background; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <Icon size={18} color={COLORS.navy} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                            {item.sub && <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 2 }}>{item.sub}</div>}
                          </div>
                        </Link>
                      );
                    })}
                    <div style={{ height: 1, background: COLORS.border, margin: "8px 6px" }} />
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, textDecoration: "none", color: "#111827", fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = COLORS.background; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <LogIn size={18} color={COLORS.navy} />
                      <span style={{ fontSize: 14 }}>Log in or sign up</span>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Mobile full screen */}
            <motion.div className="md:hidden"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ position: "fixed", inset: 0, background: COLORS.white, zIndex: 1001, padding: 24, overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <img src="/logo-blue.png" alt="VenCome" style={{ height: 38, width: "auto", objectFit: "contain" }} />
                <button type="button" onClick={() => setMenuOpen(false)}
                  style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={18} color={COLORS.navy} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                <div style={{ border: "1px solid " + COLORS.border, borderRadius: 20, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>LOCATION</div>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Search location"
                    style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14, marginTop: 6 }} />
                </div>
                <div style={{ border: "1px solid " + COLORS.border, borderRadius: 20, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
                    {activeTab === "long-term" ? "MOVE-IN DATE" : "WHEN"}
                  </div>
                  <button type="button" onClick={() => setActiveField(v => v === "mobile-when" ? null : "mobile-when")}
                    style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", padding: 0, marginTop: 6, fontSize: 14, color: selectedDate ? "#111827" : "#9CA3AF" }}>
                    {selectedDate ? formatShortDate(selectedDate) : when || "Add dates"}
                  </button>
                  <AnimatePresence>
                    {activeField === "mobile-when" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 10 }}>
                        <MiniCalendar calMonth={calMonth} calYear={calYear} setCalMonth={setCalMonth} setCalYear={setCalYear}
                          selectedDate={selectedDate} onSelect={date => { setSelectedDate(date); setWhen(formatShortDate(date)); setActiveField(null); }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ border: "1px solid " + COLORS.border, borderRadius: 20, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
                    {activeTab === "long-term" ? "LEASE LENGTH" : "TYPE OF SPACE"}
                  </div>
                  <button type="button" onClick={() => setActiveField(v => v === "mobile-type" ? null : "mobile-type")}
                    style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", padding: 0, marginTop: 6, fontSize: 14, color: selectedType ? "#111827" : "#9CA3AF" }}>
                    {selectedType || "Select type"}
                  </button>
                  <AnimatePresence>
                    {activeField === "mobile-type" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 10 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {activeTab === "long-term"
                            ? LEASE_OPTIONS.map(opt => (
                              <button key={opt} type="button" onClick={() => { setSelectedType(opt); setActiveField(null); }}
                                style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid " + COLORS.border, background: selectedType === opt ? COLORS.navy : "white", color: selectedType === opt ? "white" : "#111827" }}>
                                {opt}
                              </button>
                            ))
                            : categories.map(cat => (
                              <button key={cat._id} type="button" onClick={() => { setSelectedType(cat.name); setSelectedCategoryId(cat._id); setActiveField(null); }}
                                style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid " + COLORS.border, background: selectedCategoryId === cat._id ? COLORS.navy : "white", color: selectedCategoryId === cat._id ? "white" : "#111827" }}>
                                {cat.name}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ border: "1px solid " + COLORS.border, borderRadius: 20, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: COLORS.grey, letterSpacing: 0.6 }}>
                    CAPACITY
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 14, color: guests > 0 ? "#111827" : "#9CA3AF" }}>
                      {guests > 0 ? `${guests} ${guests === 1 ? "person" : "people"}` : "Add people"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button type="button" onClick={() => setGuests(g => Math.max(0, g - 1))}
                        style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", fontSize: 16, cursor: "pointer" }}>
                        −
                      </button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{guests}</span>
                      <button type="button" onClick={() => setGuests(g => g + 1)}
                        style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", fontSize: 16, cursor: "pointer" }}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={handleSearch}
                  style={{ width: "100%", height: 52, borderRadius: 12, background: COLORS.blue, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(46,88,236,0.25)" }}>
                  Search
                </button>
              </div>
              <div style={{ borderTop: "1px solid " + COLORS.border, paddingTop: 16 }}>
                {[
                  { icon: HelpCircle, label: "Help Center", to: "/help" },
                  { icon: Building2, label: "Become a Host", to: "/host/create", sub: "It's easy to start earning" },
                  { icon: Users, label: "Refer a Host", to: "/refer" },
                  { icon: UserPlus, label: "Find a co-host", to: "/co-host" },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 14, textDecoration: "none", color: COLORS.navy }}>
                      <Icon size={18} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{item.label}</div>
                        {item.sub && <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 2 }}>{item.sub}</div>}
                      </div>
                    </Link>
                  );
                })}
                <div style={{ height: 1, background: COLORS.border, margin: "12px 0" }} />
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 14, textDecoration: "none", color: COLORS.navy, fontWeight: 700 }}>
                  <LogIn size={18} />
                  <span style={{ fontSize: 16 }}>Log in or sign up</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── GLOBE MODAL ── */}
      <AnimatePresence>
        {globeOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div ref={globeRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "white", borderRadius: 20, width: "90vw", maxWidth: 800, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottom: "1px solid " + COLORS.border }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>Language and region</div>
                <button type="button" onClick={() => setGlobeOpen(false)}
                  style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid " + COLORS.border, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={18} color={COLORS.navy} />
                </button>
              </div>
              <div style={{ padding: 18, overflowY: "auto" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {[{ id: "language", label: "Language and region" }, { id: "currency", label: "Currency" }].map(tab => (
                    <button key={tab.id} type="button" onClick={() => setGlobeTab(tab.id)}
                      style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid " + COLORS.border, background: globeTab === tab.id ? COLORS.navy : "white", color: globeTab === tab.id ? "white" : COLORS.navy, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                {globeTab === "language" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: 14, borderRadius: 16, border: "1px solid " + COLORS.border, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>Translation</div>
                        <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 4 }}>Automatically translate descriptions and reviews to English.</div>
                      </div>
                      <Toggle enabled={translateEnabled} onChange={setTranslateEnabled} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.grey, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Suggested language and region</div>
                    <button type="button" onClick={() => setSelectedLanguage("English — United Kingdom")}
                      style={{ width: "100%", textAlign: "left", padding: 14, borderRadius: 16, border: "1.5px solid " + (selectedLanguage === "English — United Kingdom" ? COLORS.navy : COLORS.border), background: "white", cursor: "pointer", marginBottom: 18 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>English</div>
                      <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 2 }}>United Kingdom</div>
                    </button>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.grey, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Choose a language and region</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10 }}>
                      {["English — United States", "English — United Kingdom", "French", "German", "Spanish", "Arabic", "Hindi", "Portuguese", "Italian", "Dutch"].map(lang => (
                        <button key={lang} type="button" onClick={() => setSelectedLanguage(lang)}
                          style={{ padding: 12, borderRadius: 16, border: "1.5px solid " + (selectedLanguage === lang ? COLORS.navy : COLORS.border), background: "white", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{lang.split("—")[0].trim()}</div>
                          <div style={{ fontSize: 12, color: COLORS.grey, marginTop: 2 }}>{lang.includes("—") ? lang.split("—")[1].trim() : " "}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                    {["GBP £", "USD $", "EUR €", "AED د.إ", "SAR ﷼", "NGN ₦"].map(cur => (
                      <button key={cur} type="button" onClick={() => setSelectedCurrency(cur)}
                        style={{ padding: 14, borderRadius: 16, border: "1.5px solid " + (selectedCurrency === cur ? COLORS.navy : COLORS.border), background: "white", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>{cur}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
