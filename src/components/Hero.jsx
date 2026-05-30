import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { apiFetch } from "../utils/api";
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar";
import DateSelector from "./DateSelector";
import {
  MapPin,
  Building2,
  Clock,
  CalendarDays,
  Globe,
  TowerControlIcon,
  ChevronDown,
} from "lucide-react"; // pick suitable icons

const DURATION_OPTIONS = [
  { value: "less_than_1_month", label: "Less than 1 month" },
  { value: "1_to_3_months", label: "1 – 3 months" },
  { value: "3_to_12_months", label: "3 – 12 months" },
  { value: "12_plus_months", label: "12+ months" },
];

const HERO_TABS = [
  { id: "spaces", label: "Spaces", icon: Building2 },
  { id: "short-term", label: "Short Term", icon: Clock },
  { id: "long-term", label: "Long Term", icon: CalendarDays },
];

const DurationDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = DURATION_OPTIONS.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Duration
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-300 transition"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : "Choose duration"}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 overflow-hidden">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition ${
                value === opt.value
                  ? "font-medium text-blue-600"
                  : "text-gray-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function shouldShowTwoMonths() {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return dayOfMonth >= daysInMonth - 6;
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate &&
    secondDate &&
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isInRange(date, startDate, endDate) {
  if (!startDate || !endDate) return false;
  return date > startDate && date < endDate;
}

function formatHeroDateLabel(startDate, endDate) {
  if (!startDate) return "";
  const start = startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (!endDate) return start;
  const end = endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${start} - ${end}`;
}

function MiniCalendar({ month, year, startDate, endDate, onSelectDate, onPrev, onNext, showPrev, showNext }) {
  const today = new Date();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < first.getDay(); i += 1) days.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) days.push(new Date(year, month, d));

  return (
    <div style={{ minWidth: 280 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button
          type="button"
          onClick={onPrev}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1.5px solid #E5E7EB",
            background: "white",
            cursor: showPrev ? "pointer" : "default",
            opacity: showPrev ? 1 : 0,
          }}
          disabled={!showPrev}
        >
          ‹
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A1628" }}>
          {new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={onNext}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1.5px solid #E5E7EB",
            background: "white",
            cursor: showNext ? "pointer" : "default",
            opacity: showNext ? 1 : 0,
          }}
          disabled={!showNext}
        >
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
          <div
            key={label}
            style={{
              fontSize: 11,
              fontWeight: 600,
              textAlign: "center",
              textTransform: "uppercase",
              color: "#6B7280",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} style={{ width: 40, height: 40 }} />;

          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = isSameDay(date, today);
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const range = isInRange(date, startDate, endDate);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(date)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: isToday ? "1.5px solid #C9A84C" : "1.5px solid transparent",
                background: isStart || isEnd ? "#0A1628" : range ? "rgba(10,22,40,0.08)" : "transparent",
                color: isStart || isEnd ? "white" : "#0A1628",
                cursor: isPast ? "default" : "pointer",
                opacity: isPast ? 0.35 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isPast && !(isStart || isEnd) && !range) e.currentTarget.style.background = "#F8F6F0";
              }}
              onMouseLeave={(e) => {
                if (!isPast) {
                  e.currentTarget.style.background = isStart || isEnd ? "#0A1628" : range ? "rgba(10,22,40,0.08)" : "transparent";
                }
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroCalendarDropdown({ startDate, endDate, onSelectDate }) {
  const today = new Date();
  const showTwo = shouldShowTwoMonths();
  const [month1, setMonth1] = useState(today.getMonth());
  const [year1, setYear1] = useState(today.getFullYear());

  const month2 = month1 === 11 ? 0 : month1 + 1;
  const year2 = month1 === 11 ? year1 + 1 : year1;

  return (
    <div style={{ display: "flex", gap: 24, padding: 4 }}>
      <MiniCalendar
        month={month1}
        year={year1}
        startDate={startDate}
        endDate={endDate}
        onSelectDate={onSelectDate}
        onPrev={() => {
          if (month1 === 0) {
            setMonth1(11);
            setYear1((y) => y - 1);
          } else {
            setMonth1((m) => m - 1);
          }
        }}
        onNext={() => {
          if (month1 === 11) {
            setMonth1(0);
            setYear1((y) => y + 1);
          } else {
            setMonth1((m) => m + 1);
          }
        }}
        showPrev={true}
        showNext={!showTwo}
      />
      {showTwo ? (
        <MiniCalendar
          month={month2}
          year={year2}
          startDate={startDate}
          endDate={endDate}
          onSelectDate={onSelectDate}
          showPrev={false}
          showNext={true}
          onNext={() => {
            if (month1 === 11) {
              setMonth1(0);
              setYear1((y) => y + 1);
            } else {
              setMonth1((m) => m + 1);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function TypeOfSpaceDropdown({ selected, onSelect }) {
  const TYPES = [
    "Office Space",
    "Co-working",
    "Meeting Rooms",
    "Event Venues",
    "Retail",
    "Warehouse",
    "Studio Space",
    "Hospitality",
    "Medical",
    "Educational",
    "Other",
  ];

  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#0A1628",
          marginBottom: 12,
        }}
      >
        Type of Space
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: selected === type ? "#0A1628" : "#E5E7EB",
              background: selected === type ? "#0A1628" : "white",
              color: selected === type ? "white" : "#111827",
              transition: "all 0.15s",
            }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
const Hero = ({ onExplore, activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const searchOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const searchY = useTransform(scrollY, [0, 100], [0, -12]);
  const searchScale = useTransform(scrollY, [0, 100], [1, 0.97]);
  const [heroTab, setHeroTab] = useState(activeTab ?? "spaces");
  const [selectedType, setSelectedType] = useState("");
  const [leaseLength, setLeaseLength] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const calendarRef = useRef(null);
  const typeRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    location: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    checkIn: "",
    checkOut: "",
    duration: "",
  });
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (activeTab) setHeroTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handler = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setShowCalendar(false);
      if (typeRef.current && !typeRef.current.contains(event.target)) setShowTypePicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const locations = [
    {
      label: "Nearby",
      sublabel: "Find what's around you",
      icon: MapPin,
      bgClass: "bg-blue-200",
      textClass: "text-blue-600",
    },
    {
      label: "Paris, France",
      sublabel: "For sights like Eiffel Tower",
      icon: TowerControlIcon, // Eiffel Tower-like icon
      bgClass: "bg-red-200",
      textClass: "text-red-600",
    },
    {
      label: "Barcelona, Spain",
      sublabel: "Popular beach destination",
      icon: Building2, // Barcelona-style building icon
      bgClass: "bg-yellow-200",
      textClass: "text-yellow-600",
    },
    {
      label: "Lisbon, Portugal",
      sublabel: "For its bustling nightlife",
      icon: Globe, // general globe icon
      bgClass: "bg-green-200",
      textClass: "text-green-600",
    },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/categories",
          method: "GET",
          cacheable: true,
        });
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleExploreClick = () => {
    if (onExplore) onExplore(""); // Reset category filter
    navigate("/");
  };

  const changeHeroTab = (nextTab) => {
    setHeroTab(nextTab);
    if (onTabChange) onTabChange(nextTab);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const queryParams = new URLSearchParams();

      if (formData.location) queryParams.append("location", formData.location);
      if (formData.category) queryParams.append("category", formData.category);
      if (formData.minPrice) queryParams.append("minPrice", formData.minPrice);
      if (formData.maxPrice) queryParams.append("maxPrice", formData.maxPrice);

      // Backend accepts checkIn & checkOut as optional logs
      if (formData.checkIn) queryParams.append("checkIn", formData.checkIn);
      if (formData.checkOut) queryParams.append("checkOut", formData.checkOut);
      if (formData.duration) queryParams.append("duration", formData.duration);

      const data = await apiFetch({
        endpoint: `/properties/search?${queryParams.toString()}`,
        method: "GET",
        cacheable: false,
      });

      // Backend returns: { success, count, properties }
      navigate("/search", { state: { properties: data.properties } });
    } catch (err) {
      setError(err.message || "Search failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectDate = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    if (date <= startDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    setEndDate(date);
  };

  useEffect(() => {
    if (!startDate) return;
    setFormData((prev) => ({
      ...prev,
      checkIn: startDate.toISOString().slice(0, 10),
      checkOut: endDate ? endDate.toISOString().slice(0, 10) : "",
    }));
  }, [endDate, startDate]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: selectedType,
      duration: leaseLength,
    }));
  }, [leaseLength, selectedType]);

  return (
    <div
      className="relative w-full h-full md:h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-between pb-8 h-full px-4">
        <Navbar />
        <div style={{ display: "flex", gap: 4, marginBottom: 12, justifyContent: "center" }}>
          {HERO_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = heroTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeHeroTab(tab.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "8px 20px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: 10,
                  position: "relative",
                }}
              >
                <Icon size={15} color={active ? "white" : "rgba(255,255,255,0.6)"} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? "white" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tab.label}
                </span>
                {active ? (
                  <motion.div
                    layoutId="hero-tab-underline"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 20,
                      right: 20,
                      height: 2,
                      background: "#2557D6",
                      borderRadius: 2,
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <motion.div
          style={{ opacity: searchOpacity, y: searchY, scale: searchScale }}
          className="w-full max-w-6xl bg-white bg-opacity-90 p-6 rounded-[24px] shadow-lg mt-10"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            <div className="relative">
              <Input
                label="LOCATION"
                name="location"
                value={formData.location}
                onChange={(e) => {
                  handleChange(e);
                  setShowSuggestions(true);
                }}
                placeholder="Where do you need space?"
                onFocus={() => setShowSuggestions(true)}
              />

              {showSuggestions && (
                <div className="absolute z-50 md:min-w-lg w-full bg-white border border-gray-200 rounded-lg shadow-md p-3">
                  <p className="text-xs font-semibold mb-2">
                    Suggested destinations
                  </p>
                  {locations.map(
                    ({ label, sublabel, icon: Icon, bgClass, textClass }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, location: label }));
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 text-left py-3 px-2 hover:bg-gray-50 rounded-lg transition"
                      >
                        {/* Icon with tinted background */}
                        <div
                          className={`rounded-lg p-2 flex items-center justify-center ${bgClass}`}
                        >
                          <Icon size={20} className={textClass} />
                        </div>

                        {/* Label + Sublabel */}
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {label}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {sublabel}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={calendarRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {heroTab === "long-term" ? "MOVE-IN DATE" : "WHEN"}
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar((value) => !value)}
                className="w-full flex items-center justify-between text-left px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-300 transition"
              >
                <span className={startDate ? "text-gray-900" : "text-gray-400"}>
                  {formatHeroDateLabel(startDate, endDate) ||
                    (heroTab === "long-term" ? "Add date" : "Add dates")}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showCalendar ? "rotate-180" : ""}`}
                />
              </button>

              {showCalendar ? (
                <div className="absolute z-50 bg-white border border-gray-200 rounded-[20px] shadow-md mt-2 p-5">
                  <HeroCalendarDropdown
                    startDate={startDate}
                    endDate={endDate}
                    onSelectDate={(date) => {
                      handleSelectDate(date);
                      if (startDate && date > startDate) setShowCalendar(false);
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="relative" ref={typeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {heroTab === "long-term" ? "LEASE LENGTH" : "TYPE OF SPACE"}
              </label>
              <button
                type="button"
                onClick={() => setShowTypePicker((value) => !value)}
                className="w-full flex items-center justify-between text-left px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-300 transition"
              >
                <span
                  className={(heroTab === "long-term" ? leaseLength : selectedType) ? "text-gray-900" : "text-gray-400"}
                >
                  {(heroTab === "long-term" ? leaseLength : selectedType) ||
                    (heroTab === "long-term" ? "Add length" : "Select type")}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showTypePicker ? "rotate-180" : ""}`}
                />
              </button>

              {showTypePicker ? (
                <div className="absolute z-50 bg-white border border-gray-200 rounded-[20px] shadow-md mt-2 p-5 w-full">
                  {heroTab === "long-term" ? (
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          color: "#0A1628",
                          marginBottom: 12,
                        }}
                      >
                        Lease Length
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {["Monthly", "Quarterly", "6 Months", "Annual", "Custom"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setLeaseLength(option);
                              setShowTypePicker(false);
                            }}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 9999,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: "pointer",
                              border: "1.5px solid",
                              borderColor: leaseLength === option ? "#0A1628" : "#E5E7EB",
                              background: leaseLength === option ? "#0A1628" : "white",
                              color: leaseLength === option ? "white" : "#111827",
                              transition: "all 0.15s",
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <TypeOfSpaceDropdown
                      selected={selectedType}
                      onSelect={(type) => {
                        setSelectedType(type);
                        setShowTypePicker(false);
                      }}
                    />
                  )}
                </div>
              ) : null}
            </div>
            <Button children="Search" className="py-1" />
          </form>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
        <div className="container mx-auto mt-10 flex items-center justify-between text-white">
          <h2 className="text-4xl">
            Book the <span className="block text-primary">Perfect Venue</span>{" "}
            with Ease
          </h2>
          <p className="w-1/4">
            From weddings to business conferences, discover event spaces
            tailored to your needs.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
