import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  AlertCircle,
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Grid,
  Heart,
  Map,
  MapPin,
  Monitor,
  Printer,
  Star,
  Users,
  UserCheck,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import Footer from "../components/Footer";
import CalendarPicker from "../components/CalendarPicker";
import apiFetch from "../utils/apiClient";

const BRAND = {
  navy: "#0A1628",
  gold: "#305CDE",
  goldDark: "#254FC7",
  bg: "#F8F6F0",
  white: "#FFFFFF",
  text: "#111827",
  mid: "#6B7280",
  border: "#E5E7EB",
};

const MOCK_PROPERTY = {
  id: "shard-executive-suite",
  title: "The Shard Executive Suite",
  location: "London Bridge, London, SE1 9SG",
  category: "Office Space",
  capacity: 24,
  rating: 4.92,
  reviewCount: 47,
  badge: "Featured",
  description: `Welcome to The Shard Executive Suite — one of London's most prestigious commercial spaces, located on the 28th floor of The Shard with panoramic views across the City, Tower Bridge, and beyond.\n\nThis fully serviced executive suite is ideal for board meetings, executive offsites, private client meetings, and high-stakes negotiations. The space comes fully equipped with state-of-the-art AV technology, a dedicated reception team, and access to a private catering service.\n\nThe suite accommodates up to 24 guests in a boardroom configuration and can be reconfigured for presentation, classroom, or networking layouts. Natural light floods the space through floor-to-ceiling glass, and the iconic London skyline provides an unforgettable backdrop for any professional event.`,
  images: [
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  ],
  amenities: [
    { label: "High-Speed WiFi", icon: "Wifi" },
    { label: "AV Equipment", icon: "Monitor" },
    { label: "Air Conditioning", icon: "Wind" },
    { label: "Reception Service", icon: "UserCheck" },
    { label: "Catering Available", icon: "Coffee" },
    { label: "Parking (nearby)", icon: "Car" },
    { label: "Disabled Access", icon: "Accessibility" },
    { label: "CCTV Security", icon: "Camera" },
    { label: "24/7 Access", icon: "Clock" },
    { label: "Printing/Copying", icon: "Printer" },
  ],
  pricing: [
    { unit: "hour", price: 85, label: "Per Hour", min: "1 hour minimum" },
    { unit: "day", price: 580, label: "Per Day", min: "Full day (9am-6pm)" },
    { unit: "week", price: 2400, label: "Per Week", min: "Mon-Fri included" },
    { unit: "month", price: 7800, label: "Per Month", min: "Rolling monthly" },
  ],
  host: {
    name: "James Thornton",
    company: "Shard Commercial Properties Ltd",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    verified: true,
    responseRate: 98,
    responseTime: "within 1 hour",
    joinedYear: 2021,
    totalListings: 4,
  },
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=80",
      rating: 5,
      date: "March 2026",
      text: "Absolutely stunning space. The views alone are worth it. Our client was incredibly impressed and the reception team were professional throughout. Will book again for our next quarterly review.",
    },
    {
      id: 2,
      author: "Ahmed K.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
      rating: 5,
      date: "February 2026",
      text: "Perfect for our board meeting. AV setup was flawless, the catering was excellent, and James was very responsive to all our questions. The space is even better in person than in the photos.",
    },
    {
      id: 3,
      author: "Priya S.",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80",
      rating: 4,
      date: "January 2026",
      text: "Great space overall. Only minor issue was parking validation took a while to sort. The space itself is world-class and the location is unbeatable for central London.",
    },
    {
      id: 4,
      author: "Tom W.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80",
      rating: 5,
      date: "December 2025",
      text: "We used this for a full-day strategy session with 18 people. Plenty of space, great natural light, and the AV worked perfectly for our video calls with the US team. Highly recommend.",
    },
  ],
  ratingBreakdown: { 5: 38, 4: 7, 3: 2, 2: 0, 1: 0 },
  rules: [
    "No smoking anywhere in the building",
    "Catering must be pre-arranged 48hrs in advance",
    "Maximum 24 guests at any time",
    "Access via reception — photo ID required",
    "Cancellation: 72 hours notice for full refund",
  ],
  location_detail: {
    lat: 51.5045,
    lng: -0.0865,
    description:
      "Located in The Shard, London Bridge Street, SE1 9SG. 2 minutes walk from London Bridge Station (Jubilee & Northern lines, National Rail). Nearest parking: Q-Park London Bridge.",
  },
};

const SIMILAR_SPACES = [
  {
    id: 2,
    title: "Canary Wharf Boardroom",
    location: "Canary Wharf, London",
    category: "Meeting Rooms",
    price: 120,
    priceUnit: "hour",
    rating: 4.85,
    reviewCount: 31,
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=80",
  },
  {
    id: 10,
    title: "Mayfair Private Members Office",
    location: "Mayfair, London",
    category: "Office Space",
    price: 5500,
    priceUnit: "month",
    rating: 4.95,
    reviewCount: 12,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  },
  {
    id: 7,
    title: "Birmingham Conference Centre",
    location: "Digbeth, Birmingham",
    category: "Meeting Rooms",
    price: 90,
    priceUnit: "hour",
    rating: 4.6,
    reviewCount: 33,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&q=80",
  },
];

const ICON_MAP = {
  Wifi,
  Monitor,
  Wind,
  UserCheck,
  Coffee,
  Car,
  Accessibility,
  Camera,
  Clock,
  Printer,
  Check,
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const OPEN_DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" },
};

const getAmenityIcon = (amenity = "") => {
  const value = amenity.toLowerCase();
  if (value.includes("wifi")) return "Wifi";
  if (value.includes("park")) return "Car";
  if (value.includes("av") || value.includes("monitor") || value.includes("screen")) {
    return "Monitor";
  }
  if (value.includes("kitchen") || value.includes("coffee") || value.includes("catering")) {
    return "Coffee";
  }
  if (value.includes("reception")) return "UserCheck";
  if (value.includes("air") || value.includes("vent")) return "Wind";
  if (value.includes("disabled")) return "Accessibility";
  if (value.includes("cctv") || value.includes("camera") || value.includes("security")) {
    return "Camera";
  }
  if (value.includes("24/7") || value.includes("access")) return "Clock";
  if (value.includes("print")) return "Printer";
  return "Check";
};

const formatOpenDays = (openDays = []) => {
  if (!openDays.length) return "Availability on request";

  const normalized = openDays.map((day) => OPEN_DAY_SHORT[day] || day.slice(0, 3));
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const everyDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (normalized.join(",") === weekdays.join(",")) return "Mon - Fri";
  if (normalized.join(",") === everyDay.join(",")) return "Mon - Sun";

  return normalized.join(", ");
};

const getPricingValue = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "object") {
    if (!value.enabled || value.price === null || value.price === undefined || value.price === "") {
      return null;
    }
    const numericValue = Number(value.price);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const pickPricingValue = (...values) => {
  for (const value of values) {
    const parsedValue = getPricingValue(value);
    if (parsedValue !== null) return parsedValue;
  }

  return null;
};

const buildPricingTiers = (pricing = {}) =>
  [
    {
      unit: "hour",
      price: pickPricingValue(pricing.hourly, pricing.hourlyPrice),
      label: "Per Hour",
      min: "1 hour minimum",
    },
    {
      unit: "day",
      price: pickPricingValue(pricing.daily, pricing.weekdayPrice),
      label: "Per Day",
      min: "Full day booking",
    },
    {
      unit: "week",
      price: pickPricingValue(pricing.weekly),
      label: "Per Week",
      min: "Weekly booking",
    },
    {
      unit: "month",
      price: pickPricingValue(pricing.monthly),
      label: "Per Month",
      min: "Rolling monthly",
    },
  ].filter((tier) => tier.price !== null && tier.price !== undefined && tier.price !== "");

const normalizePropertyData = (property) => {
  if (!property) return null;

  const hostName =
    property.host?.displayName ||
    [property.host?.firstName, property.host?.lastName].filter(Boolean).join(" ") ||
    property.host?.name ||
    "VenCome Host";
  const location = [
    property.location?.address,
    property.location?.city,
    property.location?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const imageList = [property.coverImage, ...(property.images || [])].filter(Boolean);
  const pricing = buildPricingTiers(property.pricing || {});
  const amenities = (property.features?.amenities || []).map((amenity) => ({
    label: amenity,
    icon: getAmenityIcon(amenity),
  }));
  const rules = property.houseRules
    ? property.houseRules
        .split(/\r?\n/)
        .map((rule) => rule.trim())
        .filter(Boolean)
    : [];
  const reviews = (property.reviews || []).map((review, index) => ({
    id: review._id || review.id || `review-${index}`,
    author:
      review.author?.displayName ||
      [review.author?.firstName, review.author?.lastName].filter(Boolean).join(" ") ||
      review.user?.displayName ||
      [review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") ||
      "Guest",
    avatar:
      review.author?.profileImage ||
      review.user?.profileImage ||
      property.host?.profileImage ||
      property.coverImage ||
      "",
    rating: review.rating || 0,
    date: review.createdAt
      ? new Date(review.createdAt).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "",
    text: review.comment || review.text || "",
  }));
  const derivedRatingBreakdown = reviews.reduce(
    (accumulator, review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        accumulator[review.rating] += 1;
      }
      return accumulator;
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  );
  const reviewCount = property.reviewNumber || property.reviewCount || reviews.length || 0;
  const rating = property.rating || "New";
  const latitude = property.coordinates?.lat ?? property.coordinates?.latitude ?? null;
  const longitude = property.coordinates?.lng ?? property.coordinates?.longitude ?? null;
  const openDays = property.availability?.openDays || [];
  const openTime = property.availability?.openTime || "";
  const closeTime = property.availability?.closeTime || "";

  return {
    ...property,
    title: property.title || "Untitled space",
    location,
    category: property.category?.name || property.category || "",
    capacity:
      property.features?.capacity ||
      property.features?.maxGuests ||
      property.features?.seatCapacity ||
      1,
    rating,
    reviewCount,
    badge: property.bookingSettings?.instantBook ? "Instant Book" : "Request to Book",
    description: property.description || "",
    images: imageList.length ? imageList : [""],
    amenities,
    pricing,
    host: {
      name: hostName,
      company: property.host?.company || "VenCome Host",
      avatar: property.host?.profileImage || property.host?.avatar || property.coverImage || "",
      verified: Boolean(property.host?.verified || property.host?.isVerified),
      responseRate: property.host?.responseRate || 0,
      responseTime: property.host?.responseTime || "soon",
      joinedYear:
        property.host?.joinedYear ||
        (property.host?.createdAt ? new Date(property.host.createdAt).getFullYear() : ""),
      totalListings: property.host?.totalListings || 0,
    },
    reviews,
    ratingBreakdown: property.ratingBreakdown || derivedRatingBreakdown,
    rules,
    location_detail: {
      lat: latitude,
      lng: longitude,
      description:
        location ||
        "Location details will be shared after your booking is confirmed.",
    },
    availabilityLabel: formatOpenDays(openDays),
    availabilityHours:
      openTime && closeTime ? `${openTime} - ${closeTime}` : "Hours available on request",
    bookingTypeLabel: property.bookingSettings?.instantBook
      ? "Instant Book"
      : "Request to Book",
  };
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (firstDate, secondDate) =>
  Boolean(
    firstDate &&
      secondDate &&
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
  );

const formatCurrency = (value) =>
  `£${new Intl.NumberFormat("en-GB").format(Math.round(value))}`;

const formatDateLabel = (date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getDayDifferenceInclusive = (startDate, endDate) =>
  Math.round((startOfDay(endDate) - startOfDay(startDate)) / 86400000) + 1;

const createMonthDays = (visibleMonth) => {
  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1
  );
  const lastDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0
  );

  const leading = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `leading-${index}`,
    date: null,
  }));

  const current = Array.from({ length: lastDay.getDate() }, (_, index) => ({
    key: `day-${index + 1}`,
    date: new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      index + 1
    ),
  }));

  const trailingCount = (7 - ((leading.length + current.length) % 7)) % 7;
  const trailing = Array.from({ length: trailingCount }, (_, index) => ({
    key: `trailing-${index}`,
    date: null,
  }));

  return [...leading, ...current, ...trailing];
};

const isBetweenDates = (date, startDate, endDate) =>
  Boolean(
    date &&
      startDate &&
      endDate &&
      startOfDay(date) > startOfDay(startDate) &&
      startOfDay(date) < startOfDay(endDate)
  );

const hasBlockedDates = (startDate, endDate, unavailableSet) => {
  const cursor = new Date(startDate);
  cursor.setDate(cursor.getDate() + 1);

  while (startOfDay(cursor) < startOfDay(endDate)) {
    const key = cursor.toDateString();
    if (unavailableSet.has(key)) {
      return true;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return false;
};

const getBookingMetrics = (tier, selectedDays) => {
  if (!selectedDays || !tier) {
    return { units: 0, label: "", subtotal: 0 };
  }

  if (tier.unit === "hour") {
    const units = selectedDays * 8;
    return { units, label: `${units} hours`, subtotal: units * tier.price };
  }

  if (tier.unit === "day") {
    return {
      units: selectedDays,
      label: `${selectedDays} day${selectedDays > 1 ? "s" : ""}`,
      subtotal: selectedDays * tier.price,
    };
  }

  if (tier.unit === "week") {
    const units = Math.max(1, Math.ceil(selectedDays / 7));
    return { units, label: `${units} week${units > 1 ? "s" : ""}`, subtotal: units * tier.price };
  }

  const units = Math.max(1, Math.ceil(selectedDays / 30));
  return {
    units,
    label: `${units} month${units > 1 ? "s" : ""}`,
    subtotal: units * tier.price,
  };
};

const DURATION_BY_UNIT = {
  hour: "hourly",
  day: "daily",
  week: "weekly",
  month: "monthly",
};

const formatInputDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatInputDateTimeValue = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatInputDateValue(date)}T${hours}:${minutes}`;
};

const formatBookingInputValue = (date, duration, boundary = "start") => {
  const nextDate = new Date(date);

  if (duration === "hourly") {
    if (nextDate.getHours() === 0 && nextDate.getMinutes() === 0) {
      nextDate.setHours(boundary === "start" ? 9 : 17, 0, 0, 0);
    }
    return formatInputDateTimeValue(nextDate);
  }

  return formatInputDateValue(nextDate);
};

const parseBookingInputValue = (value, duration, boundary = "start") => {
  if (!value) return null;
  if (duration === "hourly") return new Date(value);
  return new Date(`${value}T${boundary === "end" ? "23:59" : "00:00"}:00`);
};

export default function PropertyDetails() {
  const { id } = useParams();
  const today = startOfDay(new Date());
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hideNavbarForLightbox, setHideNavbarForLightbox] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(1);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [selectedPricingTier, setSelectedPricingTier] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("hourly");
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDurationType, setSelectedDurationType] = useState(null);
  const [bookingMode, setBookingMode] = useState("single");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [recurringConfig, setRecurringConfig] = useState({
    startDate: "",
    frequency: "weekly",
    occurrences: 1,
  });
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [similarSpaces, setSimilarSpaces] = useState([]);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryError, setEnquiryError] = useState(null);

  const bookingSidebarRef = useRef(null);
  const calendarRef = useRef(null);
  const propertyView = useMemo(() => normalizePropertyData(property), [property]);
  const enabledPricingOptions = property
    ? ["hourly", "daily", "weekly", "monthly", "annual"]
        .map((key) => {
          let price = null;

          const val = property.pricing?.[key];
          if (typeof val === "object" && val !== null) {
            if (val.enabled && val.price && parseFloat(val.price) > 0) {
              price = parseFloat(val.price);
            }
          } else if (typeof val === "number" && val > 0) {
            price = val;
          } else if (typeof val === "string" && parseFloat(val) > 0) {
            price = parseFloat(val);
          }

          if (!price && key === "hourly" && property.pricing?.hourlyPrice > 0) {
            price = property.pricing.hourlyPrice;
          }
          if (!price && key === "daily" && property.pricing?.weekdayPrice > 0) {
            price = property.pricing.weekdayPrice;
          }

          if (!price) return null;

          return {
            key,
            label: {
              hourly: "Per Hour",
              daily: "Per Day",
              weekly: "Per Week",
              monthly: "Per Month",
              annual: "Per Year",
            }[key],
            price,
            unit: {
              hourly: "/hr",
              daily: "/day",
              weekly: "/week",
              monthly: "/month",
              annual: "/year",
            }[key],
          };
        })
        .filter(Boolean)
    : [];

  const getPriceForDisplay = (key) => {
    const pricing = property?.pricing;
    if (!pricing) return null;

    const val = pricing[key];
    if (typeof val === "object" && val !== null) {
      if (val.enabled && val.price && parseFloat(val.price) > 0) return parseFloat(val.price);
      return null;
    }
    if (typeof val === "number" && val > 0) return val;
    if (typeof val === "string" && parseFloat(val) > 0) return parseFloat(val);

    if (key === "hourly" && pricing.hourlyPrice > 0) return pricing.hourlyPrice;
    if (key === "daily" && pricing.weekdayPrice > 0) return pricing.weekdayPrice;

    return null;
  };

  const pricingOptions = useMemo(
    () =>
      [
        {
          unit: "hour",
          price: getPriceForDisplay("hourly"),
          label: "Per Hour",
          min: "1 hour minimum",
        },
        {
          unit: "day",
          price: getPriceForDisplay("daily"),
          label: "Per Day",
          min: "Full day booking",
        },
        {
          unit: "week",
          price: getPriceForDisplay("weekly"),
          label: "Per Week",
          min: "Weekly booking",
        },
        {
          unit: "month",
          price: getPriceForDisplay("monthly"),
          label: "Per Month",
          min: "Rolling monthly",
        },
        {
          unit: "year",
          price: getPriceForDisplay("annual"),
          label: "Per Year",
          min: "Annual booking",
        },
      ].filter((tier) => tier.price !== null),
    [property]
  );

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/properties/${id}`);
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();
        setProperty(data.property || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  useEffect(() => {
    if (!property) return;

    const lat = property?.coordinates?.lat || property?.coordinates?.latitude;
    const lng = property?.coordinates?.lng || property?.coordinates?.longitude;

    const address = [property?.location?.address, property?.location?.city, property?.location?.country]
      .filter(Boolean)
      .join(", ");

    if (!lat && !lng && !address) return;

    let cancelled = false;

    const waitForDivAndInit = () => {
      const mapDiv = document.getElementById("property-detail-map");
      if (!mapDiv) {
        if (!cancelled) setTimeout(waitForDivAndInit, 100);
        return;
      }

      const initMap = () => {
        if (cancelled) return;
        try {
          const center =
            lat && lng
              ? { lat: parseFloat(lat), lng: parseFloat(lng) }
              : { lat: 51.5074, lng: -0.1278 };

          const map = new window.google.maps.Map(mapDiv, {
            center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          setTimeout(() => {
            window.google.maps.event.trigger(map, "resize");
            map.setCenter(center);
          }, 100);

          if (lat && lng) {
            new window.google.maps.Marker({
              position: center,
              map,
              title: property?.title || "Property",
            });
          } else {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
              if (status === "OK" && results[0]) {
                const loc = results[0].geometry.location;
                map.setCenter(loc);
                new window.google.maps.Marker({ position: loc, map });
              }
            });
          }
        } catch (err) {
          console.error("Map init error:", err);
        }
      };

      if (window.google?.maps) {
        initMap();
      } else {
        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
          existingScript.addEventListener("load", initMap);
        } else {
          const script = document.createElement("script");
          script.id = "google-maps-script";
          script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        }
      }
    };

    waitForDivAndInit();

    return () => {
      cancelled = true;
    };
  }, [property]);

  useEffect(() => {
    const fetchSimilarSpaces = async () => {
      if (!property) return;
      try {
        const categoryId = property.category?._id || property.category;
        const url = categoryId
          ? `${import.meta.env.VITE_API_URL}/properties?limit=6`
          : `${import.meta.env.VITE_API_URL}/properties?limit=6`;
        const response = await fetch(url);
        const data = await response.json();
        const all = data.properties || [];
        const filtered = all.filter((space) => space._id !== property._id).slice(0, 3);
        setSimilarSpaces(filtered);
      } catch (err) {
        console.error("Failed to fetch similar spaces:", err);
      }
    };

    fetchSimilarSpaces();
  }, [property]);

  useEffect(() => {
    const checkSaved = async () => {
      const token = localStorage.getItem("vencome_token");
      if (!token || !property?._id) return;
      try {
        const res = await apiFetch(`/properties/${property._id}/is-saved`);
        const data = await res.json();
        setIsSaved(data.isSaved || false);
      } catch (err) {
        console.error("Failed to check saved status:", err);
      }
    };
    checkSaved();
  }, [property?._id]);

  useEffect(() => {
    const navbar =
      document.querySelector("nav") ||
      document.querySelector("header") ||
      document.querySelector('[class*="Navbar"]') ||
      document.querySelector('[class*="navbar"]');

    if (navbar) {
      navbar.style.position = "fixed";
      navbar.style.top = "0";
      navbar.style.left = "0";
      navbar.style.right = "0";
      navbar.style.zIndex = "1000";
    }

    return () => {
      if (navbar) {
        navbar.style.zIndex = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!propertyView) return;
    setSelectedPricingTier(0);
    setSelectedDuration(DURATION_BY_UNIT[pricingOptions?.[0]?.unit] || "hourly");
    setCheckIn("");
    setCheckOut("");
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setGuests(1);
    setBookingError(null);
  }, [propertyView, pricingOptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setBookingSuccess(true);
      // Clean the URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("cancel") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (
      enabledPricingOptions.length > 0 &&
      !enabledPricingOptions.some((option) => option.key === selectedDurationType)
    ) {
      setSelectedDurationType(enabledPricingOptions[0].key);
    }
  }, [property, enabledPricingOptions, selectedDurationType]);

  const selectedTier = pricingOptions?.[selectedPricingTier] || pricingOptions?.[0];

  useEffect(() => {
    if (!selectedTier?.unit) return;
    setSelectedDuration(DURATION_BY_UNIT[selectedTier.unit] || "hourly");
  }, [selectedTier?.unit]);

  useEffect(() => {
    if (selectedStartDate) {
      setCheckIn(formatBookingInputValue(selectedStartDate, selectedDuration, "start"));
    }
    if (selectedEndDate) {
      setCheckOut(formatBookingInputValue(selectedEndDate, selectedDuration, "end"));
    }
  }, [selectedStartDate, selectedEndDate, selectedDuration]);

  const unavailableDates = useMemo(() => {
    const set = new Set();
    const blocked = property?.blockedDates || [];
    blocked.forEach(({ start, end }) => {
      const cursor = new Date(start);
      const endDate = new Date(end);
      while (cursor <= endDate) {
        set.add(new Date(cursor).toDateString());
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return set;
  }, [property]);

  const calendarDays = useMemo(() => createMonthDays(visibleMonth), [visibleMonth]);

  const selectedDays = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return getDayDifferenceInclusive(selectedStartDate, selectedEndDate);
  }, [selectedStartDate, selectedEndDate]);

  const bookingMetrics = useMemo(
    () => getBookingMetrics(selectedTier, selectedDays),
    [selectedTier, selectedDays]
  );

  const cleaningFee = selectedDays ? 45 : 0;
  const platformFee = selectedDays ? Math.round(bookingMetrics.subtotal * 0.1) : 0;
  const bookingTotal = bookingMetrics.subtotal + cleaningFee + platformFee;

  const displayedReviews = showAllReviews
    ? propertyView?.reviews || []
    : (propertyView?.reviews || []).slice(0, 2);

  const reviewPercentages = [5, 4, 3, 2, 1].map((score) => ({
    score,
    count: propertyView?.ratingBreakdown?.[score] || 0,
    percentage: Math.round(
      (((propertyView?.ratingBreakdown?.[score] || 0) / Math.max(propertyView?.reviewCount || 0, 1)) *
        100)
    ),
  }));

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: "16px",
              height: "400px",
              marginBottom: "24px",
            }}
          />
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: "8px",
              height: "32px",
              width: "60%",
              marginBottom: "16px",
            }}
          />
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: "8px",
              height: "20px",
              width: "40%",
            }}
          />
        </div>
      </>
    );
  }

  if (error || !propertyView) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <p style={{ fontSize: "20px", color: "#111827", marginBottom: "8px" }}>
            Property not found
          </p>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
            This listing may have been removed or is no longer available.
          </p>
          <a
            href="/search"
            style={{ color: "#0A1628", fontWeight: "600", textDecoration: "underline" }}
          >
            Browse all spaces
          </a>
        </div>
      </>
    );
  }

  const openImage = (index, hideNavbar = false) => {
    setLightboxDirection(index >= activeImageIndex ? 1 : -1);
    setActiveImageIndex(index);
    setHideNavbarForLightbox(hideNavbar);
    setLightboxOpen(true);
  };

  const changeImage = (direction) => {
    setLightboxDirection(direction);
    setActiveImageIndex((current) => {
      const total = propertyView.images.length;
      return (current + direction + total) % total;
    });
  };

  const focusCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const focusBooking = () => {
    bookingSidebarRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDateSelect = (date) => {
    const normalizedDate = startOfDay(date);
    const isUnavailable = unavailableDates.has(normalizedDate.toDateString());
    const isPast = normalizedDate < today;

    if (isUnavailable || isPast) return;

    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(normalizedDate);
      setSelectedEndDate(null);
      return;
    }

    if (normalizedDate < selectedStartDate) {
      setSelectedStartDate(normalizedDate);
      return;
    }

    if (hasBlockedDates(selectedStartDate, normalizedDate, unavailableDates)) {
      setSelectedStartDate(normalizedDate);
      setSelectedEndDate(null);
      return;
    }

    setSelectedEndDate(normalizedDate);
  };

  const handleCheckInChange = (value) => {
    setCheckIn(value);
    setBookingError(null);
    setBookingSuccess(false);
    if (value) setSelectedStartDate(new Date(value));
  };

  const handleCheckOutChange = (value) => {
    setCheckOut(value);
    setBookingError(null);
    setBookingSuccess(false);
    if (value) setSelectedEndDate(new Date(value));
  };

  const handleBooking = async () => {
    setBookingError(null);
    setBookingLoading(true);

    try {
      const token = localStorage.getItem("vencome_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      let bookingsToCreate = [];

      if (bookingMode === "single") {
        if (!checkIn || !checkOut) {
          setBookingError("Please select check-in and check-out dates");
          setBookingLoading(false);
          return;
        }
        bookingsToCreate = [{ checkIn, checkOut }];
      }

      if (bookingMode === "multiple") {
        const valid = selectedDates.filter((dateRange) => dateRange.start && dateRange.end);
        if (valid.length === 0) {
          setBookingError("Please add at least one date range");
          setBookingLoading(false);
          return;
        }
        bookingsToCreate = valid.map((dateRange) => ({
          checkIn: dateRange.start,
          checkOut: dateRange.end,
        }));
      }

      if (bookingMode === "recurring") {
        if (!recurringConfig.startDate) {
          setBookingError("Please select a start date");
          setBookingLoading(false);
          return;
        }
        const dates = [];
        let current = new Date(recurringConfig.startDate);
        for (let index = 0; index < recurringConfig.occurrences; index += 1) {
          const start = new Date(current);
          const end = new Date(current);
          if (selectedDurationType === "daily") end.setDate(end.getDate() + 1);
          else if (selectedDurationType === "weekly") end.setDate(end.getDate() + 7);
          else if (selectedDurationType === "monthly") end.setMonth(end.getMonth() + 1);
          else end.setDate(end.getDate() + 1);
          dates.push({ checkIn: start.toISOString(), checkOut: end.toISOString() });
          if (recurringConfig.frequency === "weekly") current.setDate(current.getDate() + 7);
          else if (recurringConfig.frequency === "biweekly") {
            current.setDate(current.getDate() + 14);
          } else if (recurringConfig.frequency === "monthly") {
            current.setMonth(current.getMonth() + 1);
          }
        }
        bookingsToCreate = dates;
      }

      const results = await Promise.all(
        bookingsToCreate.map(async ({ checkIn: bookingCheckIn, checkOut: bookingCheckOut }) => {
          const formData = new FormData();
          formData.append("propertyId", property._id);
          const checkInISO = bookingCheckIn.length === 10
            ? new Date(bookingCheckIn + "T09:00:00").toISOString()
            : new Date(bookingCheckIn).toISOString();
          const checkOutISO = bookingCheckOut.length === 10
            ? new Date(bookingCheckOut + "T18:00:00").toISOString()
            : new Date(bookingCheckOut).toISOString();
          formData.append("checkIn", checkInISO);
          formData.append("checkOut", checkOutISO);
          formData.append("guests", guests);
          formData.append("extras", JSON.stringify([]));
          const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          return response;
        })
      );

      const failedResponse = results.find((response) => !response.ok);
      if (failedResponse) {
        const firstFailed = await failedResponse.json();
        setBookingError(firstFailed?.error || "One or more bookings failed");
        return;
      }

      // Get the first successful booking and redirect to Stripe
      const firstResult = results[0];
      const booking = await firstResult.json();

      const stripeRes = await fetch(
        `${import.meta.env.VITE_API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId: booking._id }),
        }
      );

      if (!stripeRes.ok) {
        const stripeErr = await stripeRes.json();
        setBookingError(stripeErr.error || "Payment setup failed");
        return;
      }

      const { url } = await stripeRes.json();
      window.location.href = url;
    } catch (err) {
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleEnquiry = async () => {
    const token = localStorage.getItem("vencome_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates before sending a request.");
      return;
    }
    setEnquiryError(null);
    setShowEnquiryModal(true);
  };

  const submitEnquiry = async () => {
    setEnquiryLoading(true);
    setEnquiryError(null);
    try {
      const token = localStorage.getItem("vencome_token");
      const selectedOption = enabledPricingOptions.find(
        (o) => o.key === selectedDurationType
      );
      const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property._id,
          checkIn,
          checkOut,
          guests,
          durationType: selectedDurationType || "hourly",
          totalPrice: selectedOption?.price || 0,
          message: enquiryMessage,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send enquiry");
      }
      const data = await res.json();
      setShowEnquiryModal(false);
      const user = JSON.parse(localStorage.getItem("vencome_user") || "{}");
      const isHost = user?.isHost || user?.role === "host";
      const base = isHost ? "/dashboard/messages" : "/customer/messages";
      window.location.href = `${base}/${data.conversation._id}`;
    } catch (err) {
      setEnquiryError(err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews((current) => ({
      ...current,
      [reviewId]: !current[reviewId],
    }));
  };

  const handleToggleSave = async () => {
    const token = localStorage.getItem("vencome_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setSaveLoading(true);
    try {
      const res = await apiFetch(`/properties/${property._id}/save`, {
        method: "POST",
      });
      const data = await res.json();
      setIsSaved(data.saved);
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const sectionProps = (delay = 0) => ({
    ...SECTION_REVEAL,
    transition: { ...SECTION_REVEAL.transition, delay },
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen overflow-x-hidden bg-[#F8F6F0] pb-24 md:pb-0">
        <PhotoGallery
          images={propertyView.images}
          onOpen={openImage}
          onShowAll={() => openImage(0, true)}
        />

        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.95fr)] lg:gap-16">
            <div className="min-w-0">
              <motion.section {...sectionProps(0)}>
                <TitleBlock
                  property={propertyView}
                  isSaved={isSaved}
                  saveLoading={saveLoading}
                  onToggleSave={handleToggleSave}
                />
              </motion.section>

              <motion.section {...sectionProps(0.05)}>
                <HostSection property={property} />
              </motion.section>

              <motion.section {...sectionProps(0.1)}>
                <DescriptionSection
                  description={propertyView.description}
                  expanded={expandedDescription}
                  onToggle={() => setExpandedDescription((current) => !current)}
                />
              </motion.section>

              <motion.section {...sectionProps(0.15)}>
                <AmenitiesSection property={property} />
              </motion.section>

              <motion.section {...sectionProps(0.2)}>
                <PricingSection
                  pricing={pricingOptions}
                  selectedPricingTier={selectedPricingTier}
                  onSelectTier={setSelectedPricingTier}
                />
              </motion.section>

              <motion.section ref={calendarRef} {...sectionProps(0.25)}>
                <AvailabilitySection
                  visibleMonth={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  calendarDays={calendarDays}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  unavailableDates={unavailableDates}
                  onDateSelect={handleDateSelect}
                  today={today}
                  selectedDays={selectedDays}
                  availabilityTotal={bookingMetrics.subtotal}
                  openDaysLabel={propertyView.availabilityLabel}
                  openHours={propertyView.availabilityHours}
                />
              </motion.section>

              <motion.section {...sectionProps(0.3)}>
                <HouseRulesSection property={property} />
              </motion.section>

              <motion.section {...sectionProps(0.35)}>
                <LocationSection property={propertyView} />
              </motion.section>

              <motion.section id="reviews" {...sectionProps(0.4)}>
                <ReviewsSection
                  property={propertyView}
                  displayedReviews={displayedReviews}
                  showAllReviews={showAllReviews}
                  onToggleShowAll={() => setShowAllReviews((current) => !current)}
                  expandedReviews={expandedReviews}
                  onToggleReview={toggleReviewExpansion}
                  reviewPercentages={reviewPercentages}
                />
              </motion.section>
            </div>

            <motion.aside
              ref={bookingSidebarRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="lg:self-start"
            >
              <BookingSidebar
                property={property}
                enabledPricingOptions={enabledPricingOptions}
                selectedDurationType={selectedDurationType}
                onSelectDurationType={setSelectedDurationType}
                bookingMode={bookingMode}
                onBookingModeChange={setBookingMode}
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={handleCheckInChange}
                onCheckOutChange={handleCheckOutChange}
                selectedDates={selectedDates}
                onSelectedDatesChange={setSelectedDates}
                recurringConfig={recurringConfig}
                onRecurringConfigChange={setRecurringConfig}
                guests={guests}
                onGuestsChange={setGuests}
                bookingLoading={bookingLoading}
                bookingError={bookingError}
                onBook={handleBooking}
                onEnquiry={handleEnquiry}
              />
            </motion.aside>
          </div>
        </div>

        <SimilarSpaces spaces={similarSpaces} />
        <Footer />

        <MobileBookingBar
          selectedTier={selectedTier}
          rating={propertyView.rating}
          onBookNow={focusBooking}
        />
      </div>

      {bookingSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "48px 40px",
              maxWidth: "480px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0A1628",
                marginBottom: "12px",
              }}
            >
              {property?.bookingSettings?.instantBook ? "Booking Confirmed!" : "Request Sent!"}
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#6B7280",
                lineHeight: "1.6",
                marginBottom: "8px",
              }}
            >
              {property?.bookingSettings?.instantBook
                ? `Your booking for ${property?.title} has been confirmed.`
                : `Your request for ${property?.title} has been sent to the host.`}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#9CA3AF",
                marginBottom: "32px",
              }}
            >
              A confirmation email has been sent to you.
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
            >
              <button
                onClick={() => (window.location.href = "/my-bookings")}
                style={{
                  background: "#0A1628",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View My Bookings
              </button>
              <button
                onClick={() => setBookingSuccess(false)}
                style={{
                  background: "transparent",
                  color: "#0A1628",
                  border: "1.5px solid #0A1628",
                  borderRadius: "8px",
                  padding: "14px 24px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEnquiryModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#0A1628",
              marginBottom: "8px",
            }}>
              Request to Book
            </h2>
            <p style={{
              fontSize: "14px",
              color: "#6B7280",
              marginBottom: "20px",
              lineHeight: "1.6",
            }}>
              Send your booking request to the host. They will review and respond within 24 hours.
            </p>

            {checkIn && checkOut && (
              <div style={{
                background: "#F8F6F0",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#374151",
              }}>
                <p style={{ margin: "0 0 4px", fontWeight: "600" }}>Booking Details</p>
                <p style={{ margin: "0 0 2px" }}>Check-in: {new Date(checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p style={{ margin: "0 0 2px" }}>Check-out: {new Date(checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p style={{ margin: 0 }}>Guests: {guests}</p>
              </div>
            )}

            <textarea
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              placeholder="Add a message to the host (optional)..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "16px",
              }}
            />

            {enquiryError && (
              <p style={{
                color: "#EF4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}>
                {enquiryError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowEnquiryModal(false);
                  setEnquiryError(null);
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E7EB",
                  background: "#fff",
                  color: "#0A1628",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitEnquiry}
                disabled={enquiryLoading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "none",
                  background: enquiryLoading ? "#9CA3AF" : "#2E58EC",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: enquiryLoading ? "not-allowed" : "pointer",
                }}
              >
                {enquiryLoading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Lightbox
        images={propertyView.images}
        activeImageIndex={activeImageIndex}
        direction={lightboxDirection}
        isOpen={lightboxOpen}
        hideNavbar={hideNavbarForLightbox}
        onClose={() => {
          setLightboxOpen(false);
          setHideNavbarForLightbox(false);
        }}
        onChangeImage={changeImage}
      />
    </>
  );
}

function PhotoGallery({ images, onOpen, onShowAll }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-24 md:px-6 md:pt-28">
      <div className="relative overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={onShowAll}
          className="absolute bottom-4 right-4 z-10 hidden items-center gap-2 rounded-lg border border-[#111827] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] shadow-sm md:inline-flex"
        >
          <Grid size={16} />
          <span>Show all photos</span>
        </button>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="block h-[260px] w-full"
          >
            <img
              src={images[0]}
              alt="Property hero"
              className="h-full w-full object-cover"
            />
          </button>
        </div>

        <div className="hidden grid-cols-[2fr_1fr_1fr] grid-rows-[240px_240px] gap-1.5 md:grid">
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            onClick={() => onOpen(0)}
            className="row-span-2 overflow-hidden"
          >
            <img
              src={images[0]}
              alt="Property view 1"
              className="h-full w-full object-cover"
            />
          </motion.button>

          {images.slice(1).map((image, index) => (
            <motion.button
              key={image}
              type="button"
              whileHover={{ scale: 1.03 }}
              onClick={() => onOpen(index + 1)}
              className={`overflow-hidden ${
                index === 1 ? "rounded-tr-[12px]" : ""
              } ${index === 3 ? "rounded-br-[12px]" : ""}`}
            >
              <img
                src={image}
                alt={`Property view ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TitleBlock({ property, isSaved, saveLoading, onToggleSave }) {
  const scrollToReviews = () => {
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="border-b border-[#E5E7EB] pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {property.categories && property.categories.length > 0 ? (
            property.categories.map((cat) => (
              <span
                key={cat._id || cat}
                className="rounded-md bg-[#0A1628] px-2.5 py-1 text-[11px] font-semibold text-white"
              >
                {cat.name || cat}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-[#0A1628] px-2.5 py-1 text-[11px] font-semibold text-white">
              {property.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#0A1628]">
            {property.bookingTypeLabel}
          </span>
          {property.host.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[12px] font-medium text-[#0A1628]">
              <Check size={14} className="text-[#305CDE]" />
              Verified host
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          disabled={saveLoading}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1.5px solid #E5E7EB",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: saveLoading ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          <Heart
            size={18}
            fill={isSaved ? "#2E58EC" : "none"}
            color={isSaved ? "#2E58EC" : "#6B7280"}
          />
        </button>
      </div>

      <h1 className="mt-4 text-[clamp(22px,5vw,32px)] font-extrabold leading-tight text-[#0A1628]">
        {property.title}
      </h1>

      <div className="mt-4 flex flex-col gap-3 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#6B7280]" />
          <span className="text-[15px]">{property.location}</span>
        </div>

        <div className="flex items-center gap-2 text-[15px]">
          <Star size={16} className="fill-[#305CDE] text-[#305CDE]" />
          <span className="font-semibold text-[#111827]">{property.rating}</span>
          <button
            type="button"
            onClick={scrollToReviews}
            className="text-[#6B7280] underline-offset-4 transition hover:text-[#0A1628] hover:underline"
          >
            ({property.reviewCount} reviews)
          </button>
        </div>
      </div>

      {property?.capacity ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#F8F6F0",
            border: "1px solid #E5E7EB",
            borderRadius: "9999px",
            padding: "6px 14px",
            fontSize: "13px",
            color: "#374151",
            fontWeight: "500",
            marginTop: "8px",
          }}
        >
          <Users size={14} />
          <span>Up to {property.capacity} people</span>
        </div>
      ) : null}
    </div>
  );
}

function HostSection({ property }) {
  return (() => {
    const hostName = property?.host?.displayName ||
      (property?.host?.firstName && property?.host?.lastName
        ? `${property.host.firstName} ${property.host.lastName}`
        : property?.host?.firstName || property?.host?.email?.split("@")[0] || "VenCome Host");

    const hostInitials = hostName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const hasRealAvatar = property?.host?.profileImage &&
      !property.host.profileImage.includes("gravatar") &&
      !property.host.profileImage.includes("00000000000000000000000000000000");

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px 0",
          borderTop: "1px solid #E5E7EB",
          borderBottom: "1px solid #E5E7EB",
          margin: "24px 0",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: hasRealAvatar ? "transparent" : "#0A1628",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasRealAvatar ? (
            <img
              src={property.host.profileImage}
              alt={hostName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: "700" }}>
              {hostInitials}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
            {hostName}
          </p>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0 0" }}>
            {property?.host?.isVerified ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Check size={12} />
                Verified Host
              </span>
            ) : (
              "VenCome Host"
            )}{" "}
            · Hosting since{" "}
            {new Date(property?.host?.createdAt || property?.createdAt).toLocaleDateString(
              "en-GB",
              { month: "long", year: "numeric" }
            )}
          </p>
        </div>
        <button
          onClick={() => {
            const token = localStorage.getItem("vencome_token");
            if (!token) {
              window.location.href = "/login";
              return;
            }
            window.location.href = `/chat?hostId=${property?.host?._id}&propertyId=${property?._id}`;
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1.5px solid #0A1628",
            background: "#fff",
            color: "#0A1628",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Contact Host
        </button>
      </div>
    );
  })();
}

function DescriptionSection({ description, expanded, onToggle }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">About This Space</h2>

      <motion.div
        layout
        animate={{ maxHeight: expanded ? 1000 : 80 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
        <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#374151]">
          {description}
        </p>
      </motion.div>

      <button
        type="button"
        onClick={onToggle}
        className="mt-4 text-[14px] font-semibold text-[#305CDE]"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

function AmenitiesSection({ property }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">What's Included</h2>

      <div className="mt-5">
        {property?.whatsIncluded ? (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "10px",
            }}
          >
            {property.whatsIncluded.split(",").map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#F0FDF4",
                    border: "1px solid #86EFAC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "11px",
                    color: "#16A34A",
                    fontWeight: "700",
                  }}
                >
                  <Check size={12} />
                </span>
                {item.trim()}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "14px", color: "#9CA3AF", fontStyle: "italic" }}>
            Details provided on request
          </p>
        )}
      </div>
    </div>
  );
}

function PricingSection({ pricing, selectedPricingTier, onSelectTier }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Pricing Options</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "16px" }}>
        {pricing.map((tier, index) => {
          const keyMap = {
            "Per Hour": "hourly",
            "Per Day": "daily",
            "Per Week": "weekly",
            "Per Month": "monthly",
            "Per Year": "annual",
          };
          const key = keyMap[tier.label];
          const labels = {
            hourly: "PER HOUR",
            daily: "PER DAY",
            weekly: "PER WEEK",
            monthly: "PER MONTH",
            annual: "PER YEAR",
          };
          const units = {
            hourly: "/ hour",
            daily: "/ day",
            weekly: "/ week",
            monthly: "/ month",
            annual: "/ year",
          };
          const descriptions = {
            hourly: "1 hour minimum",
            daily: "Full day booking",
            weekly: "Weekly arrangement",
            monthly: "Monthly rolling",
            annual: "Annual lease",
          };

          return (
            <div
              key={key || `${tier.unit}-${index}`}
              onClick={() => onSelectTier(index)}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "20px 24px",
                minWidth: "160px",
                flex: "1",
                cursor: "pointer",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#6B7280",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                }}
              >
                {labels[key]}
              </p>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0A1628",
                  marginBottom: "4px",
                }}
              >
                £{tier.price.toLocaleString()}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "400",
                    color: "#6B7280",
                  }}
                >
                  {" "}
                  {units[key]}
                </span>
              </p>
              <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{descriptions[key]}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilitySection({
  visibleMonth,
  onMonthChange,
  calendarDays,
  selectedStartDate,
  selectedEndDate,
  unavailableDates,
  onDateSelect,
  today,
  selectedDays,
  availabilityTotal,
  openDaysLabel,
  openHours,
}) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Availability</h2>
      <p className="mt-1 text-[13px] text-[#6B7280]">{openDaysLabel}</p>
      <p className="mt-1 text-[13px] text-[#6B7280]">{openHours}</p>

      <div className="mt-5 rounded-[18px] border border-[#E5E7EB] bg-white p-4">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            <ChevronLeft size={18} />
          </button>

          <h3 className="text-[18px] font-bold text-[#0A1628]">
            {visibleMonth.toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button
            type="button"
            onClick={() =>
              onMonthChange(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0A1628]"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[12px] font-medium text-[#6B7280]">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-2">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarDays.map((item) => {
            if (!item.date) {
              return <span key={item.key} className="h-10 w-10" />;
            }

            const date = startOfDay(item.date);
            const unavailable = unavailableDates.has(date.toDateString());
            const past = date < today;
            const isStart = isSameDay(date, selectedStartDate);
            const isEnd = isSameDay(date, selectedEndDate);
            const inRange = isBetweenDates(date, selectedStartDate, selectedEndDate);
            const isToday = isSameDay(date, today);

            const rangeClasses = isStart && isEnd
              ? "rounded-full bg-[#0A1628] text-white"
              : isStart
              ? "rounded-l-full rounded-r-none bg-[#0A1628] text-white"
              : isEnd
              ? "rounded-r-full rounded-l-none bg-[#0A1628] text-white"
              : inRange
              ? "rounded-none bg-[rgba(10,22,40,0.08)] text-[#111827]"
              : unavailable
              ? "rounded-full bg-[#F3F4F6] text-[#D1D5DB] line-through"
              : "rounded-full bg-white text-[#111827] hover:bg-[#F8F6F0]";

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onDateSelect(date)}
                disabled={unavailable || past}
                className={`flex h-10 w-10 items-center justify-center text-[14px] transition ${rangeClasses} ${
                  past ? "cursor-not-allowed opacity-35" : ""
                } ${isToday ? "border-2 border-[#305CDE]" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {selectedDays > 0 ? (
          <p className="mt-5 rounded-xl bg-[#F8F6F0] px-4 py-3 text-[14px] font-medium text-[#0A1628]">
            {selectedDays} days selected — {formatCurrency(availabilityTotal)} total
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HouseRulesSection({ property }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Space Rules</h2>

      <div className="mt-5">
        {(() => {
          const rules =
            property?.features?.houseRules ||
            property?.features?.spaceRules ||
            property?.spaceRules ||
            property?.houseRules;
          return rules ? (
            <p
              style={{
                fontSize: "15px",
                color: "#374151",
                lineHeight: "1.8",
                whiteSpace: "pre-line",
              }}
            >
              {rules}
            </p>
          ) : (
            <p style={{ fontSize: "14px", color: "#9CA3AF", fontStyle: "italic" }}>
              No specific rules provided
            </p>
          );
        })()}
      </div>
    </div>
  );
}

function LocationSection({ property }) {
  return (
    <div className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[20px] font-bold text-[#0A1628]">Location</h2>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#E5E7EB]">
        <div
          id="property-detail-map"
          style={{
            width: "100%",
            height: "320px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #E5E7EB",
            background: "#f3f4f6",
          }}
        />
      </div>

      {property.location_detail?.description ? (
        <p className="mt-5 text-[14px] leading-7 text-[#6B7280]">
          {property.location_detail.description}
        </p>
      ) : null}
    </div>
  );
}

function ReviewsSection({
  property,
  displayedReviews,
  showAllReviews,
  onToggleShowAll,
  expandedReviews,
  onToggleReview,
  reviewPercentages,
}) {
  return (
    <div className="py-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[64px] font-extrabold leading-none text-[#0A1628]">
            {property.rating}
          </p>
          <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-[#305CDE]">
            <Star size={16} className="fill-current" />
            Exceptional
          </p>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Based on {property.reviewCount} reviews
          </p>
        </div>

        <div className="w-full max-w-[420px] space-y-3">
          {reviewPercentages.map((item) => (
            <div key={item.score} className="grid grid-cols-[36px_1fr_44px] items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[12px] text-[#111827]">
                {item.score}
                <Star size={12} color="#C9A84C" fill="#C9A84C" />
              </span>
              <div className="h-1 rounded-full bg-[#E5E7EB]">
                <div
                  className="h-1 rounded-full bg-[#0A1628]"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="text-right text-[12px] text-[#6B7280]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {displayedReviews.map((review) => {
          const expanded = expandedReviews[review.id];
          const shouldToggle = review.text.length > 160;

          return (
            <div
              key={review.id}
              className="rounded-[14px] border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {review.author}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[#305CDE]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={14} className="fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-right text-[12px] text-[#6B7280]">{review.date}</p>
              </div>

              <p
                className={`mt-4 text-[14px] leading-7 text-[#374151] ${
                  expanded ? "" : "line-clamp-3"
                }`}
              >
                {review.text}
              </p>

              {shouldToggle ? (
                <button
                  type="button"
                  onClick={() => onToggleReview(review.id)}
                  className="mt-3 text-[13px] font-semibold text-[#305CDE]"
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {property.reviewCount > 0 ? (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="mt-8 w-full rounded-[10px] border-[1.5px] border-[#0A1628] px-4 py-3 text-[14px] font-semibold text-[#0A1628] transition hover:bg-[#0A1628] hover:text-white"
        >
          {showAllReviews ? "Show fewer reviews" : `Show all ${property.reviewCount} reviews`}
        </button>
      ) : null}
    </div>
  );
}

function BookingSidebar({
  property,
  enabledPricingOptions,
  selectedDurationType,
  onSelectDurationType,
  bookingMode,
  onBookingModeChange,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  selectedDates,
  onSelectedDatesChange,
  recurringConfig,
  onRecurringConfigChange,
  guests,
  onGuestsChange,
  bookingLoading,
  bookingError,
  onBook,
  onEnquiry,
}) {
  const minDateTime = new Date().toISOString().slice(0, 16);
  const minDate = new Date().toISOString().slice(0, 10);
  const maxCapacity =
    property?.features?.capacity ||
    property?.features?.seatCapacity ||
    property?.features?.maxGuests ||
    100;
  const selectedOption = enabledPricingOptions.find(
    (option) => option.key === selectedDurationType
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        padding: "24px",
        position: "sticky",
        top: "100px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      {enabledPricingOptions.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#6B7280",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Duration Type
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {enabledPricingOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onSelectDurationType(option.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  border: `2px solid ${
                    selectedDurationType === option.key ? "#0A1628" : "#E5E7EB"
                  }`,
                  background: selectedDurationType === option.key ? "#0A1628" : "#fff",
                  color: selectedDurationType === option.key ? "#fff" : "#0A1628",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {selectedDurationType && selectedOption ? (
            <p
              style={{
                marginTop: "8px",
                fontSize: "22px",
                fontWeight: "800",
                color: "#0A1628",
              }}
            >
              £{selectedOption.price}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: "#6B7280",
                }}
              >
                {" "}
                {selectedOption.unit}
              </span>
            </p>
          ) : null}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#6B7280",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Booking Type
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "single", label: "Single" },
            { key: "multiple", label: "Multiple Dates" },
            { key: "recurring", label: "Recurring" },
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => onBookingModeChange(mode.key)}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: "8px",
                border: `2px solid ${
                  bookingMode === mode.key ? "#0A1628" : "#E5E7EB"
                }`,
                background: bookingMode === mode.key ? "#0A1628" : "#fff",
                color: bookingMode === mode.key ? "#fff" : "#0A1628",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {bookingMode === "single" && (
        <div style={{ marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              {selectedDurationType === "hourly" ? "Start Date & Time" : "Check In"}
            </label>
            <CalendarPicker
              value={checkIn}
              onChange={onCheckInChange}
              isHourly={selectedDurationType === "hourly"}
              placeholder={selectedDurationType === "hourly" ? "Select start date & time" : "Select check-in date"}
            />
          </div>
          <div style={{ marginTop: "12px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              {selectedDurationType === "hourly" ? "End Date & Time" : "Check Out"}
            </label>
            <CalendarPicker
              value={checkOut}
              onChange={onCheckOutChange}
              isHourly={selectedDurationType === "hourly"}
              minDate={checkIn || undefined}
              placeholder={selectedDurationType === "hourly" ? "Select end date & time" : "Select check-out date"}
            />
          </div>
        </div>
      )}

      {bookingMode === "multiple" && (
        <div style={{ marginBottom: "16px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Select Dates
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
            Add each date or date range you want to book
          </p>
          {selectedDates.map((dateRange, index) => (
            <div
              key={`${dateRange.start}-${dateRange.end}-${index}`}
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="date"
                value={dateRange.start}
                onChange={(event) => {
                  const updated = [...selectedDates];
                  updated[index] = { ...updated[index], start: event.target.value };
                  onSelectedDatesChange(updated);
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <span style={{ color: "#6B7280", fontSize: "12px" }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(event) => {
                  const updated = [...selectedDates];
                  updated[index] = { ...updated[index], end: event.target.value };
                  onSelectedDatesChange(updated);
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1.5px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                onClick={() =>
                  onSelectedDatesChange(selectedDates.filter((_, i) => i !== index))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#DC2626",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px",
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onSelectedDatesChange([...selectedDates, { start: "", end: "" }])}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1.5px dashed #D1D5DB",
              background: "#F9FAFB",
              color: "#374151",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            + Add Date Range
          </button>
        </div>
      )}

      {bookingMode === "recurring" && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={recurringConfig.startDate}
              onChange={(event) =>
                onRecurringConfigChange({
                  ...recurringConfig,
                  startDate: event.target.value,
                })
              }
              min={minDate}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Repeat Every
            </label>
            <select
              value={recurringConfig.frequency}
              onChange={(event) =>
                onRecurringConfigChange({
                  ...recurringConfig,
                  frequency: event.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="weekly">Every Week</option>
              <option value="biweekly">Every 2 Weeks</option>
              <option value="monthly">Every Month</option>
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Number of Occurrences
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() =>
                  onRecurringConfigChange({
                    ...recurringConfig,
                    occurrences: Math.max(1, recurringConfig.occurrences - 1),
                  })
                }
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1.5px solid #E5E7EB",
                  background: "#fff",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0A1628",
                  minWidth: "32px",
                  textAlign: "center",
                }}
              >
                {recurringConfig.occurrences}
              </span>
              <button
                onClick={() =>
                  onRecurringConfigChange({
                    ...recurringConfig,
                    occurrences: Math.min(52, recurringConfig.occurrences + 1),
                  })
                }
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "1.5px solid #E5E7EB",
                  background: "#fff",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "8px" }}>
              {recurringConfig.startDate
                ? `First booking: ${new Date(recurringConfig.startDate).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}`
                : ""}
            </p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            display: "block",
            marginBottom: "8px",
          }}
        >
          People / Workstations
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => onGuestsChange(Math.max(1, guests - 1))}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0A1628",
              minWidth: "32px",
              textAlign: "center",
            }}
          >
            {guests}
          </span>
          <button
            onClick={() => onGuestsChange(Math.min(maxCapacity, guests + 1))}
            disabled={guests >= maxCapacity}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid #E5E7EB",
              background: guests >= maxCapacity ? "#F3F4F6" : "#fff",
              fontSize: "18px",
              cursor: guests >= maxCapacity ? "not-allowed" : "pointer",
              color: guests >= maxCapacity ? "#9CA3AF" : "#0A1628",
            }}
          >
            +
          </button>
        </div>
        {guests >= maxCapacity ? (
          <p style={{ fontSize: "12px", color: "#D97706", marginTop: "6px", fontWeight: "500" }}>
            Maximum capacity reached ({maxCapacity} people)
          </p>
        ) : null}
      </div>

      <button
        onClick={onBook}
        disabled={bookingLoading}
        style={{
          width: "100%",
          background: bookingLoading ? "#9CA3AF" : "#0A1628",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "16px",
          fontWeight: "700",
          cursor: bookingLoading ? "not-allowed" : "pointer",
          marginBottom: "12px",
        }}
      >
        {bookingLoading
          ? "Processing..."
          : property?.bookingSettings?.instantBook
          ? "Book Now"
          : "Request to Book"}
      </button>

      {bookingError ? (
        <p
          style={{
            color: "#EF4444",
            fontSize: "13px",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          {bookingError}
        </p>
      ) : null}

      <button
        onClick={onEnquiry}
        style={{
          width: "100%",
          background: "#fff",
          color: "#0A1628",
          border: "1.5px solid #0A1628",
          borderRadius: "10px",
          padding: "14px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "16px",
        }}
      >
        Send Enquiry
      </button>

      <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>
        You won't be charged yet
      </p>
    </div>
  );
}

function SimilarSpaces({ spaces }) {
  if (!spaces.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-4 md:px-6">
      <h2 className="text-[24px] font-bold text-[#0A1628]">
        Similar Spaces You Might Like
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {spaces.length > 0
          ? spaces.map((space) => {
              const price =
                space.pricing?.hourly ||
                space.pricing?.hourlyPrice ||
                space.pricing?.daily ||
                space.pricing?.weekdayPrice ||
                0;
              const unit =
                space.pricing?.hourly || space.pricing?.hourlyPrice ? "/hr" : "/day";

              return (
                <div
                  key={space._id}
                  onClick={() => {
                    window.location.href = `/property/${space._id}`;
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img
                    src={space.coverImage}
                    alt={space.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                  <div style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                        {space.location?.city}, {space.location?.country}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          margin: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Star size={13} fill="currentColor" />
                        {space.rating > 0 ? space.rating.toFixed(2) : "New"}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0A1628",
                        margin: "4px 0",
                      }}
                    >
                      {space.title}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 8px" }}>
                      {space.category?.name || ""}
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
                      £{price.toLocaleString()}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "400",
                          color: "#6B7280",
                        }}
                      >
                        {" "}
                        {unit}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    </section>
  );
}

function MobileBookingBar({ selectedTier, rating, onBookNow }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#E5E7EB] bg-white px-5 py-3 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[14px] font-bold text-[#0A1628] md:text-[16px]">
            {selectedTier ? formatCurrency(selectedTier.price) : "POA"}
            {selectedTier ? (
              <span className="ml-1 text-[13px] font-normal text-[#6B7280]">
                / {selectedTier.unit}
              </span>
            ) : null}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#6B7280]">
            <Star size={13} className="fill-[#305CDE] text-[#305CDE]" />
            {rating}
          </p>
        </div>

        <button
          type="button"
          onClick={onBookNow}
          className="min-h-[44px] rounded-lg bg-[#305CDE] px-4 py-2.5 text-[14px] font-semibold text-white md:px-5"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

const LIGHTBOX_VARIANTS = {
  enter: (dir) => ({ x: dir * 300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -300, opacity: 0 }),
};

function Lightbox({
  images,
  activeImageIndex,
  direction,
  isOpen,
  hideNavbar,
  onClose,
  onChangeImage,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const currentLightboxImage = images[activeImageIndex];

  useEffect(() => {
    const navbar =
      document.querySelector("nav") ||
      document.querySelector("header") ||
      document.querySelector('[class*="navbar"]') ||
      document.querySelector('[class*="Navbar"]');

    if (navbar) {
      navbar.style.zIndex = isOpen && hideNavbar ? "-1" : "1000";
      navbar.style.visibility = isOpen && hideNavbar ? "hidden" : "";
    }

    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      if (navbar) {
        navbar.style.zIndex = "1000";
        navbar.style.visibility = "";
      }
      document.body.style.overflow = "";
    };
  }, [hideNavbar, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) setZoomLevel(1);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-black/90"
        >
          <button
            onClick={onClose}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
              backdropFilter: "blur(4px)",
            }}
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={() => onChangeImage(-1)}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm md:left-4 md:h-12 md:w-12"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            type="button"
            onClick={() => onChangeImage(1)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm md:right-4 md:h-12 md:w-12"
          >
            <ChevronRight size={32} />
          </button>

          <div className="flex h-full items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLightboxImage}
                custom={direction}
                variants={LIGHTBOX_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <motion.img
                    src={currentLightboxImage}
                    alt={`Property image ${activeImageIndex + 1}`}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 80) onChangeImage(-1);
                      if (info.offset.x < -80) onChangeImage(1);
                    }}
                    style={{
                      maxWidth: zoomLevel === 1 ? "90vw" : "none",
                      maxHeight: zoomLevel === 1 ? "90vh" : "none",
                      width: zoomLevel > 1 ? `${zoomLevel * 60}vw` : "auto",
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "center",
                      borderRadius: zoomLevel === 1 ? "12px" : "0",
                      transition: "transform 0.2s ease",
                      cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in",
                      userSelect: "none",
                    }}
                    onClick={() =>
                      setZoomLevel((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))
                    }
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "12px",
              zIndex: 10001,
            }}
          >
            <button
              onClick={() => setZoomLevel((prev) => Math.max(1, prev - 1))}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              -
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              style={{
                padding: "0 16px",
                height: "40px",
                borderRadius: "20px",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(3, prev + 1))}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              +
            </button>
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[14px] text-white">
            {activeImageIndex + 1} / {images.length}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
