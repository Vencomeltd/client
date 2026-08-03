import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  Image as ImageIcon,
  Lightbulb,
  Link as LinkIcon,
  Loader2,
  MapPin,
  PoundSterling,
  Upload,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import apiFetch from "../utils/apiClient";
import { setNavGuard, clearNavGuard, requestNavConfirm } from "../utils/navGuard";
import DayOfWeekPricing from "../components/DayOfWeekPricing";
import BlockDatesEditor from "../components/BlockDatesEditor";

// Load Google Maps script
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      if (window.google?.maps?.places) {
        resolve(window.google);
        return;
      }

      existingScript.addEventListener(
        "load",
        () => resolve(window.google),
        { once: true }
      );
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const API = import.meta.env.VITE_API_URL;

const STEP_LABELS = [
  "Category",
  "Location",
  "Details",
  "Photos",
  "Features",
  "Pricing",
  "Availability",
  "Discounts",
  "Booking",
  "Buffer Time",
  "Block Dates",
  "Lease",
  "Calendar",
  "Preview",
];

const CATEGORY_OPTIONS = [
  {
    id: "office",
    title: "Office Space",
    description: "Private suites, executive offices, and corporate floors.",
  },
  {
    id: "coworking",
    title: "Co-working",
    description: "Flex desks, day passes, and shared work environments.",
  },
  {
    id: "meeting",
    title: "Meeting Rooms",
    description: "Boardrooms, workshop rooms, and conference spaces.",
  },
  {
    id: "studio",
    title: "Studio Space",
    description: "Creative studios, content rooms, and production spaces.",
  },
];

const PHOTO_LIBRARY = [
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80",
  "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=900&q=80",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const BUFFER_OPTIONS = [
  { label: "None", value: 0 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
  { label: "Custom", value: "custom" },
];

const CALENDAR_PROVIDERS = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Two-way sync via Google Calendar API",
    type: "oauth",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Sync via Microsoft Graph API",
    type: "oauth",
  },
  {
    id: "apple",
    name: "Apple iCal / CalDAV",
    description: "Blocks dates from your iCloud calendar",
    type: "credentials",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Blocks dates from your existing Calendly bookings",
    type: "oauth",
  },
  {
    id: "calcom",
    name: "Cal.com",
    description: "Blocks dates from your existing Cal.com bookings",
    type: "apikey",
  },
  {
    id: "ical",
    name: "iCal Feed (URL)",
    description: "Paste any .ics calendar feed URL — applies to this listing only",
    type: "ical",
  },
];

const inputClassName =
  "h-[52px] w-full rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white px-4 text-[15px] text-[#111827] outline-none transition focus:border-[#0A1628] focus:shadow-[0_0_0_3px_rgba(10,22,40,0.08)]";

const textareaClassName =
  "w-full rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white px-4 py-3 text-[15px] text-[#111827] outline-none transition focus:border-[#0A1628] focus:shadow-[0_0_0_3px_rgba(10,22,40,0.08)]";

const optionCardClassName =
  "rounded-xl border-[1.5px] border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#305CDE]";

const sectionTitleClassName = "text-[20px] font-bold text-[#0A1628]";

const defaultState = {
  category: "",
  categoryName: "",
  subcategory: "",
  subcategoryName: "",
  locationName: "",
  address: "",
  city: "",
  country: "",
  postcode: "",
  latitude: null,
  longitude: null,
  title: "",
  description: "",
  whatsIncluded: "",
  capacity: "",
  photos: [],
  images: [],
  photoUrls: [],
  coverImageIndex: 0,
  pricing: {
    hourly: { enabled: false, price: "" },
    daily: { enabled: false, price: "" },
    weekly: { enabled: false, price: "" },
    monthly: { enabled: false, price: "" },
    annual: { enabled: false, price: "" },
  },
  // Optional day-of-week rate overrides for hourly/daily pricing only.
  // { day: 0-6 (Sun-Sat), rate: number }. Days not listed use the base
  // hourly/daily rate above -- see customDayPricingEnabled toggle below.
  customDayPricingEnabled: false,
  customDayPricing: [],
  // DAILY pricing only -- restricts a booking to exactly one calendar day
  // instead of allowing a multi-night stay. See bookingSettings.singleDayOnly.
  singleDayOnly: false,
  minHours: "",
  minNotice: "24hours",
  availability: "",
  availabilityDays: [],
  startTime: "",
  endTime: "",
  instantBook: false,
  houseRules: "",
  listingTerms: "",
  wifi: false,
  size: "",
  naturalLight: false,
  restrooms: 1,
  refundPolicy: "moderate",
  sizeSQM: "",
  seatCapacity: "",
  extras: [],
  discounts: {
    newListing: false,
    lastMinute: false,
    weekly: false,
    monthly: false,
    extendedHours: 0,
  },
  bookingApproval: "approveFirstFive",
  blockedDates: [],
  leaseAgreement: null,
  icalUrl: "",
};

const formatCurrency = (value) =>
  `£${new Intl.NumberFormat("en-GB").format(Number(value) || 0)}`;

const formatBufferLabel = (minutes) => {
  if (!minutes) return "No buffer";
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  return `${minutes} min`;
};

const getCustomMinutes = (value, unit) => {
  const numeric = Number(value || 0);
  if (!numeric) return 0;
  return unit === "hours" ? numeric * 60 : numeric;
};

function StepIndicator({ step }) {
  return (
    <div className="sticky top-0 z-50 -mx-4 -mt-6 mb-8 border-b border-[#E5E7EB] bg-white px-4 py-4 sm:-mx-10 sm:-mt-10 sm:px-8">
      <div className="hidden items-start gap-3 md:flex">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = step > stepNumber;
          const isCurrent = step === stepNumber;

          return (
            <div key={label} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-[54px] flex-col items-center">
                <motion.div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                    isComplete
                      ? "border-[#0A1628] bg-[#0A1628] text-white"
                      : isCurrent
                      ? "border-[#305CDE] bg-[#305CDE] text-white"
                      : "border-[#E5E7EB] bg-white text-[#9CA3AF]"
                  }`}
                >
                  {isComplete ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check size={16} />
                    </motion.span>
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-center text-[12px] ${
                    isCurrent
                      ? "font-bold text-[#0A1628]"
                      : "font-medium text-[#6B7280]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 ? (
                <div
                  className={`mt-[15px] h-[2px] flex-1 ${
                    step > stepNumber ? "bg-[#0A1628]" : "bg-[#E5E7EB]"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="md:hidden">
        <p className="text-[13px] text-[#6B7280]">Step {step} of 14</p>
        <p className="mt-1 text-[18px] font-bold text-[#0A1628]">
          {STEP_LABELS[step - 1]}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-[28px] font-extrabold text-[#0A1628]">{title}</h2>
      <p className="mt-2 max-w-[560px] text-[15px] leading-7 text-[#6B7280]">
        {subtitle}
      </p>
    </div>
  );
}

function ProviderLogo({ providerId }) {
  if (providerId === "google") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.3 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.7 16 19.1 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.3 6.5 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.2 0-9.6-3.4-11.2-8H6.5C9.9 37.7 16.4 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.2 5.6l6.2 5.2C40.5 36.2 44 30.6 44 24c0-1.3-.1-2.6-.4-3.9z"
          />
        </svg>
      </div>
    );
  }

  if (providerId === "outlook") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#0078D4] text-[20px] font-bold text-white">
        O
      </div>
    );
  }

  if (providerId === "apple") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#555_0%,#333_100%)] text-white">
        <CalendarDays size={18} />
      </div>
    );
  }

  if (providerId === "calendly") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#006BFF] text-[20px] font-extrabold text-white">
        c
      </div>
    );
  }

  if (providerId === "calcom") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#111827] text-[13px] font-bold text-white">
        cal
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(10,22,40,0.06)] text-[#0A1628]">
      <LinkIcon size={18} />
    </div>
  );
}

function StepFrame({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-[720px] rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-10"
    >
      {children}
    </motion.div>
  );
}

export default function CreateSpace() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState(defaultState);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [entryPhase, setEntryPhase] = useState("loading"); // "loading" | "choice" | "wizard"
  const [draftsList, setDraftsList] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [draftActionLoading, setDraftActionLoading] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [beforeSelection, setBeforeSelection] = useState(0);
  const [afterSelection, setAfterSelection] = useState(0);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [customBefore, setCustomBefore] = useState("");
  const [customAfter, setCustomAfter] = useState("");
  const [customBeforeUnit, setCustomBeforeUnit] = useState("minutes");
  const [customAfterUnit, setCustomAfterUnit] = useState("minutes");
  const [connectingCalendar, setConnectingCalendar] = useState(null);
  const [hostCalendarStatus, setHostCalendarStatus] = useState({ google: null, outlook: null, calcom: null, calendly: null, apple: null });
  const [calcomApiKeyInput, setCalcomApiKeyInput] = useState("");
  const [connectingCalcom, setConnectingCalcom] = useState(false);
  const [appleUsernameInput, setAppleUsernameInput] = useState("");
  const [applePasswordInput, setApplePasswordInput] = useState("");
  const [connectingApple, setConnectingApple] = useState(false);
  const [calendarStatusLoading, setCalendarStatusLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSubcategoryNames, setSelectedSubcategoryNames] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState("");
  const locationInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        const data = await res.json();
        if (data.categories || Array.isArray(data)) {
          setCategories(data.categories || data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (step !== 2) return;
    if (!locationInputValue || locationInputValue.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const fetchPredictions = async () => {
      try {
        if (!window.google?.maps?.places) return;
        const service = new window.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: locationInputValue,
            types: ["establishment", "geocode"],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setLocationSuggestions(predictions.slice(0, 6));
              setShowLocationDropdown(true);
            } else {
              setLocationSuggestions([]);
              setShowLocationDropdown(false);
            }
          }
        );
      } catch (err) {
        setLocationSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(debounce);
  }, [locationInputValue, step]);

  useEffect(() => {
    const handler = (e) => {
      if (
        !e.target.closest("#location-search") &&
        !e.target.closest("[data-location-dropdown]")
      ) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (step !== 2) return;

    let cancelled = false;

    const waitForDomAndInit = () => {
      const mapDiv = document.getElementById("location-map");
      const input = document.getElementById("location-search");

      if (!mapDiv || !input) {
        if (!cancelled) window.setTimeout(waitForDomAndInit, 100);
        return;
      }

      const initMapAndAutocomplete = () => {
        if (cancelled) return;

        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: 51.5074, lng: -0.1278 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapRef.current = map;

        window.setTimeout(() => {
          window.google.maps.event.trigger(map, "resize");
          map.setCenter({ lat: 51.5074, lng: -0.1278 });
          setMapsLoaded(true);
        }, 100);

        // Note: intentionally not using google.maps.places.Autocomplete here —
        // as of March 2025 Google blocks that legacy widget for new API
        // projects/keys ("not available to new customers"), which is why it
        // silently produced no dropdown. The custom dropdown below (driven by
        // AutocompleteService + PlacesService, rendered in JSX) still works
        // and is what actually handles selection.
        const marker = new window.google.maps.Marker({ map });
        markerRef.current = marker;
      };

      if (window.google?.maps?.places) {
        // Maps already loaded (e.g. by the navbar's location picker on an
        // earlier page) — init immediately.
        initMapAndAutocomplete();
        return;
      }

      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        // Script tag exists but is still loading (common case: the navbar
        // kicks off this same load on every page mount). Wait for it instead
        // of silently doing nothing.
        existingScript.addEventListener("load", initMapAndAutocomplete);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = "google-maps-script";
      script.onload = initMapAndAutocomplete;
      document.head.appendChild(script);
    };

    waitForDomAndInit();

    return () => {
      cancelled = true;
    };
  }, [step]);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await apiFetch("/drafts");
        const data = await res.json();
        const list = data.drafts || [];
        setDraftsList(list);
        setEntryPhase(list.length > 0 ? "choice" : "wizard");
      } catch (err) {
        console.error("Failed to load drafts:", err);
        setEntryPhase("wizard");
      }
    };
    fetchDrafts();
  }, []);

  const continueDraft = async (id) => {
    setDraftActionLoading(id);
    try {
      const res = await apiFetch(`/drafts/${id}`);
      if (!res.ok) throw new Error("Failed to load draft");
      const data = await res.json();
      const savedForm = data.draft.formData || {};
      setForm({ ...defaultState, ...savedForm });
      if (savedForm.bufferBefore) setBufferBefore(savedForm.bufferBefore);
      if (savedForm.bufferAfter) setBufferAfter(savedForm.bufferAfter);
      setDraftId(data.draft._id);
      setStep(data.draft.step || 1);
      setEntryPhase("wizard");
    } catch (err) {
      console.error("Failed to load draft:", err);
      alert("Failed to load that draft. Please try again.");
    } finally {
      setDraftActionLoading(null);
    }
  };

  const deleteDraftFromList = async (id) => {
    if (!window.confirm("Delete this draft? This can't be undone.")) return;
    setDraftActionLoading(id);
    try {
      await apiFetch(`/drafts/${id}`, { method: "DELETE" });
      setDraftsList((current) => current.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Failed to delete draft:", err);
      alert("Failed to delete draft. Please try again.");
    } finally {
      setDraftActionLoading(null);
    }
  };

  const startNewSpace = () => {
    setDraftId(null);
    setForm(defaultState);
    setStep(1);
    setEntryPhase("wizard");
  };

  useEffect(() => {
    if (step !== 2 || !mapsLoaded || !mapRef.current || !window.google?.maps) return;

    const rawLat = form.lat ?? form.latitude;
    const rawLng = form.lng ?? form.longitude;

    if (rawLat === null || rawLat === undefined || rawLat === "") return;
    if (rawLng === null || rawLng === undefined || rawLng === "") return;

    const lat = Number(rawLat);
    const lng = Number(rawLng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const position = { lat, lng };
    const mapContainer = mapContainerRef.current;
    let map = mapRef.current;

    const mapAttachedToCurrentContainer =
      map &&
      typeof map.getDiv === "function" &&
      mapContainer &&
      map.getDiv() === mapContainer &&
      mapContainer.childElementCount > 0;

    if (!mapAttachedToCurrentContainer && mapContainer) {
      map = new window.google.maps.Map(mapContainer, {
        center: position,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;
      markerRef.current = new window.google.maps.Marker({ map, position });
      window.setTimeout(() => {
        window.google.maps.event.trigger(map, "resize");
        map.setCenter(position);
      }, 0);
      return;
    }

    window.google.maps.event.trigger(map, "resize");
    map.setCenter(position);
    map.setZoom(16);

    if (markerRef.current) {
      markerRef.current.setMap(map);
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new window.google.maps.Marker({
        map,
        position,
      });
    }
  }, [step, mapsLoaded, form.lat, form.lng, form.latitude, form.longitude]);

  useEffect(() => {
    if (step !== 13) return;
    let cancelled = false;

    const fetchCalendarStatus = async () => {
      try {
        const [googleRes, outlookRes, calcomRes, calendlyRes, appleRes] = await Promise.all([
          apiFetch("/calendar/google/status"),
          apiFetch("/calendar/outlook/status"),
          apiFetch("/calendar/calcom/status"),
          apiFetch("/calendar/calendly/status"),
          apiFetch("/calendar/apple/status"),
        ]);
        const google = await googleRes.json();
        const outlook = await outlookRes.json();
        const calcom = await calcomRes.json();
        const calendly = await calendlyRes.json();
        const apple = await appleRes.json();
        if (!cancelled) setHostCalendarStatus({ google, outlook, calcom, calendly, apple });
      } catch (err) {
        if (!cancelled) {
          setHostCalendarStatus({
            google: { connected: false },
            outlook: { connected: false },
            calcom: { connected: false },
            calendly: { connected: false },
            apple: { connected: false },
          });
        }
      } finally {
        if (!cancelled) setCalendarStatusLoading(false);
      }
    };

    fetchCalendarStatus();
    return () => {
      cancelled = true;
    };
  }, [step]);

  const effectiveBufferBefore =
    beforeSelection === "custom"
      ? getCustomMinutes(customBefore, customBeforeUnit)
      : bufferBefore;
  const effectiveBufferAfter =
    afterSelection === "custom"
      ? getCustomMinutes(customAfter, customAfterUnit)
      : bufferAfter;

  const previewCategory = useMemo(
    () =>
      form.categoryName ||
      CATEGORY_OPTIONS.find((category) => category.id === form.category)?.title ||
      "Category not selected",
    [form.category, form.categoryName]
  );
  const totalTimeline = Math.max(effectiveBufferBefore + effectiveBufferAfter + 120, 120);
  const beforeWidth = effectiveBufferBefore
    ? `${(effectiveBufferBefore / totalTimeline) * 100}%`
    : "12%";
  const bookingWidth = `${(120 / totalTimeline) * 100}%`;
  const afterWidth = effectiveBufferAfter
    ? `${(effectiveBufferAfter / totalTimeline) * 100}%`
    : "12%";

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleDay = (day) => {
    setForm((current) => ({
      ...current,
      availabilityDays: current.availabilityDays.includes(day)
        ? current.availabilityDays.filter((item) => item !== day)
        : [...current.availabilityDays, day],
    }));
  };

  const handleBufferSelect = (type, optionValue) => {
    if (type === "before") {
      setBeforeSelection(optionValue);
      if (optionValue !== "custom") setBufferBefore(optionValue);
      return;
    }

    setAfterSelection(optionValue);
    if (optionValue !== "custom") setBufferAfter(optionValue);
  };

  // Google/Outlook calendars connect at the host account level (one connection
  // syncs across all of a host's listings), so this step just reflects real
  // status from the same endpoints Settings.jsx uses, rather than faking a
  // per-listing "connected" toggle. Connecting from inside the wizard opens a
  // popup instead of redirecting the tab away, so wizard progress is never lost.
  const handleCalendarConnect = async (providerId) => {
    if (providerId !== "google" && providerId !== "outlook" && providerId !== "calendly") return;

    setConnectingCalendar(providerId);
    try {
      const res = await apiFetch(`/calendar/${providerId}/connect?popup=1`);
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to start connection");

      const popup = window.open(
        data.url,
        "vencome-calendar-connect",
        "width=520,height=650,menubar=no,toolbar=no,status=no"
      );
      if (!popup) {
        throw new Error("Please allow popups for VenCome to connect your calendar");
      }

      const apiOrigin = new URL(API).origin;
      let popupWatcher = null;

      const handleMessage = async (event) => {
        if (event.origin !== apiOrigin) return;
        if (event.data?.type !== "vencome-calendar" || event.data.provider !== providerId) return;

        window.removeEventListener("message", handleMessage);
        if (popupWatcher) window.clearInterval(popupWatcher);
        setConnectingCalendar(null);

        if (event.data.success) {
          try {
            const statusRes = await apiFetch(`/calendar/${providerId}/status`);
            const status = await statusRes.json();
            setHostCalendarStatus((current) => ({ ...current, [providerId]: status }));
          } catch (err) {
            console.error("Failed to refresh calendar status:", err);
          }
        } else {
          const providerLabel =
            providerId === "google" ? "Google Calendar" : providerId === "outlook" ? "Outlook" : "Calendly";
          setValidationError(`Failed to connect ${providerLabel}. Please try again.`);
        }
      };

      window.addEventListener("message", handleMessage);

      // If the host closes the popup without finishing, don't leave the
      // button stuck on "Connecting...".
      popupWatcher = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(popupWatcher);
          window.removeEventListener("message", handleMessage);
          setConnectingCalendar(null);
        }
      }, 500);
    } catch (err) {
      setConnectingCalendar(null);
      setValidationError(err.message || `Failed to connect ${providerId}`);
    }
  };

  // Cal.com connects via a pasted API key, not OAuth, so it doesn't need the
  // popup flow above — just a direct request.
  const handleCalcomConnect = async () => {
    if (!calcomApiKeyInput.trim()) {
      setValidationError("Paste your Cal.com API key first.");
      return;
    }
    setConnectingCalcom(true);
    try {
      const res = await apiFetch("/calendar/calcom/connect", {
        method: "POST",
        body: JSON.stringify({ apiKey: calcomApiKeyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      setHostCalendarStatus((current) => ({
        ...current,
        calcom: { connected: true, username: data.username },
      }));
      setCalcomApiKeyInput("");
    } catch (err) {
      setValidationError(err.message || "Couldn't verify that Cal.com API key.");
    } finally {
      setConnectingCalcom(false);
    }
  };

  // Apple Calendar connects via Apple ID + app-specific password, also a
  // direct request rather than the OAuth popup flow (Apple has no practical
  // OAuth flow for CalDAV).
  const handleAppleConnect = async () => {
    if (!appleUsernameInput.trim() || !applePasswordInput.trim()) {
      setValidationError("Enter your Apple ID and app-specific password first.");
      return;
    }
    setConnectingApple(true);
    try {
      const res = await apiFetch("/calendar/apple/connect", {
        method: "POST",
        body: JSON.stringify({
          username: appleUsernameInput.trim(),
          password: applePasswordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      setHostCalendarStatus((current) => ({
        ...current,
        apple: { connected: true, username: data.username },
      }));
      setAppleUsernameInput("");
      setApplePasswordInput("");
    } catch (err) {
      setValidationError(err.message || "Couldn't connect — check the Apple ID and app-specific password.");
    } finally {
      setConnectingApple(false);
    }
  };

  const buildWhatsIncluded = () => {
    const parts = [];
    if (form.wifi) parts.push("WiFi Access");
    if (form.restrooms > 0) {
      parts.push(`${form.restrooms} Restroom${form.restrooms > 1 ? "s" : ""}`);
    }
    if (form.sizeSQM) parts.push(`${form.sizeSQM} SQM`);
    if (form.seatCapacity) parts.push(`${form.seatCapacity} Seat Capacity`);
    (form.extras || []).forEach((extra) => {
      if (extra.name) parts.push(extra.name);
    });
    return parts.join(", ");
  };

  const nextStep = () => {
    setValidationError("");

    // Step 1 — Category required
    if (step === 1) {
      if (selectedCategoryIds.length === 0) {
        setValidationError("Please select at least one category before continuing.");
        return;
      }
    }

    // Step 2 — Location required
    if (step === 2) {
      if (!form.city || !form.country) {
        setValidationError("Please select a location before continuing.");
        return;
      }
    }

    // Step 3 — Title and description required
    if (step === 3) {
      if (!form.title?.trim()) {
        setValidationError("Please enter a listing title before continuing.");
        return;
      }
      if (!form.description?.trim()) {
        setValidationError("Please enter a description before continuing.");
        return;
      }
    }

    // Step 4 — At least one photo required
    if (step === 4) {
      if (!form.images || form.images.length === 0) {
        setValidationError("Please upload at least one photo before continuing.");
        return;
      }
    }

    // Step 6 — Pricing required
    if (step === 6) {
      const hasEnabledPricing = Object.values(form.pricing || {}).some(
        (pricing) => pricing.enabled && pricing.price
      );
      if (!hasEnabledPricing) {
        setValidationError("Please enable at least one pricing option with a price.");
        return;
      }
    }

    // Step 7 — Availability days required
    if (step === 7) {
      if (!form.availabilityDays || form.availabilityDays.length === 0) {
        setValidationError("Please select at least one available day before continuing.");
        return;
      }
      if (!form.startTime || !form.endTime) {
        setValidationError("Please set your open and close times before continuing.");
        return;
      }
    }

    setDirection(1);
    setStep((current) => Math.min(current + 1, 14));
  };
  const previousStep = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 1));
  };

  // Uploads a single File to R2 via the generic upload endpoint and returns
  // its URL. Used to resolve pending Files into serializable strings before
  // saving a draft — raw File objects can't survive JSON.stringify (they
  // silently become {} and crash the Photos/Lease steps on restore).
  const uploadFileToR2 = async (file) => {
    const body = new FormData();
    body.append("file", file);
    const res = await apiFetch("/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setIsPublishing(true);
    setError("");

    try {
      const formData = new FormData();
      const flatPricing = {};

      Object.entries(form.pricing || {}).forEach(([key, val]) => {
        if (val.enabled && val.price) {
          flatPricing[key] = parseFloat(val.price);
        }
      });

      if (form.customDayPricingEnabled && form.customDayPricing?.length > 0) {
        flatPricing.customDayPricing = form.customDayPricing;
      }

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("whatsIncluded", buildWhatsIncluded());
      if (form.listingTerms) {
        formData.append("listingTerms", form.listingTerms);
      }
      formData.append(
        "location",
        JSON.stringify({
          address: form.address,
          city: form.city,
          country: form.country,
        })
      );
      formData.append(
        "coordinates",
        JSON.stringify({
          lat: form.lat || form.latitude || 0,
          lng: form.lng || form.longitude || 0,
          latitude: form.lat || form.latitude || 0,
          longitude: form.lng || form.longitude || 0,
        })
      );
      formData.append(
        "pricing",
        JSON.stringify(flatPricing)
      );
      formData.append(
        "features",
        JSON.stringify({
          capacity: parseInt(form.capacity) || 0,
          amenities: form.amenities || [],
          houseRules: form.houseRules || "",
        })
      );
      formData.append(
        "bookingSettings",
        JSON.stringify({
          instantBook: form.instantBook || false,
          minNotice: form.minNotice || "24hours",
          approveAllBookings: !form.instantBook,
          refundPolicy: form.refundPolicy || "moderate",
          singleDayOnly: form.pricing.daily?.enabled ? !!form.singleDayOnly : false,
        })
      );
      // The server expects availability as a structured object
      // ({openDays, openTime, closeTime, minNotice}), matching what
      // EditSpace.jsx already sends -- this used to send a bare
      // JSON-stringified array of day names instead, which Mongoose
      // silently coerced to schema defaults (empty openDays/openTime/
      // closeTime) on every single listing ever created, despite the step
      // being required and shown correctly in the Preview step.
      formData.append(
        "availability",
        JSON.stringify({
          openDays: form.availabilityDays || [],
          openTime: form.startTime || "",
          closeTime: form.endTime || "",
          minNotice: form.minNotice || "24hours",
        })
      );
      formData.append("coverImageIndex", form.coverImageIndex ?? 0);
      formData.append("wifi", form.wifi || false);
      formData.append("restrooms", form.restrooms || 0);
      formData.append("sizeSQM", form.sizeSQM || "");
      formData.append("seatCapacity", form.seatCapacity || "");
      formData.append("extras", JSON.stringify(form.extras || []));
      formData.append("discounts", JSON.stringify(form.discounts || {}));
      formData.append("blockedDates", JSON.stringify(form.blockedDates || []));
      formData.append("bookingApproval", form.bookingApproval || "approveFirstFive");
      if (form.icalUrl) {
        formData.append("icalUrl", form.icalUrl);
      }

      if (form.leaseAgreement instanceof File) {
        // Field name must match the backend's multer config (upload.fields
        // expects "leaseFile", not "leaseAgreement" — this mismatch meant
        // lease uploads were silently dropped before).
        formData.append("leaseFile", form.leaseAgreement);
      } else if (typeof form.leaseAgreement === "string" && form.leaseAgreement) {
        // Already uploaded earlier (e.g. resumed from a draft) — pass its
        // URL through directly instead of re-uploading.
        formData.append("existingLeaseAgreement", form.leaseAgreement);
      }

      if (form.category) {
        formData.append("category", form.category);
      }

      if (selectedCategoryIds.length > 0) {
        formData.append("categories", JSON.stringify(selectedCategoryIds));
      }

      if (selectedSubcategoryNames.length > 0) {
        formData.append("subcategories", JSON.stringify(selectedSubcategoryNames));
      }

      if (form.images && form.images.length > 0) {
        const existingImageUrls = [];
        form.images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          } else if (typeof image === "string" && image) {
            // Already uploaded earlier (e.g. resumed from a draft).
            existingImageUrls.push(image);
          }
        });
        if (existingImageUrls.length > 0) {
          formData.append("existingImages", JSON.stringify(existingImageUrls));
        }
      }
      const res = await apiFetch("/properties", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to create listing");
        setIsLoading(false);
        setIsPublishing(false);
        return;
      }

      setPublishSuccess(true);
      if (draftId) {
        apiFetch(`/drafts/${draftId}`, { method: "DELETE" }).catch(() => {});
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      setIsPublishing(false);
    }
  };

  // `silent` is used by the autosave effect below — skips the blocking
  // alert() feedback and setSavingDraft spinner that make sense for the
  // manual "Save Draft" button but would be jarring if they fired on every
  // step change.
  const saveDraft = async (silent = false) => {
    if (!silent) setSavingDraft(true);
    try {
      // Raw File objects can't survive JSON.stringify (they silently become
      // {} and crash the Photos/Lease steps on restore) — upload anything
      // pending to R2 first and store the URLs instead. Also update local
      // state so re-saving the same draft doesn't re-upload duplicates.
      const resolvedImages = await Promise.all(
        (form.images || []).map((image) =>
          image instanceof File ? uploadFileToR2(image) : image
        )
      );
      const resolvedLease =
        form.leaseAgreement instanceof File
          ? await uploadFileToR2(form.leaseAgreement)
          : form.leaseAgreement;

      setForm((prev) => ({
        ...prev,
        images: resolvedImages,
        leaseAgreement: resolvedLease,
      }));

      const payload = {
        title: form.title || form.locationName || "Untitled space",
        step,
        coverImage: resolvedImages[0] || "",
        formData: {
          ...form,
          images: resolvedImages,
          leaseAgreement: resolvedLease,
          bufferBefore: effectiveBufferBefore,
          bufferAfter: effectiveBufferAfter,
        },
      };

      if (draftId) {
        await apiFetch(`/drafts/${draftId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        const res = await apiFetch("/drafts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setDraftId(data.draft._id);
      }
      if (!silent) alert("Draft saved! You can continue later from your dashboard.");
    } catch (err) {
      console.error("Failed to save draft:", err);
      if (!silent) alert("Failed to save draft. Please try again.");
    } finally {
      if (!silent) setSavingDraft(false);
    }
  };

  // Autosave — silently persists progress as a draft whenever the host
  // moves between steps, so leaving mid-flow (closed tab, lost connection,
  // etc.) never loses more than the current step's work. Starts from step 2
  // onward since step 1 alone (category only) isn't worth a draft yet, and
  // nextStep()'s validation means every step from 2 up already has at least
  // a location, title, or photo attached to it.
  const autoSaveTimerRef = useRef(null);
  useEffect(() => {
    if (entryPhase !== "wizard") return;
    if (step <= 1) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(true).catch((err) => console.error("Autosave failed:", err));
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, entryPhase]);

  // Exit guard — while actively filling in the wizard, no silent exits.
  // Sidebar/nav links are intercepted in DashboardLayout via navGuard; here
  // we register what "leave" actually does (save draft, then dashboard),
  // and separately guard the two exits DashboardLayout can't see: the
  // browser back button and closing/refreshing the tab.
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  useEffect(() => {
    if (entryPhase !== "wizard" || publishSuccess) {
      clearNavGuard();
      return;
    }
    setNavGuard(async () => {
      try {
        await saveDraftRef.current(true);
      } catch (err) {
        console.error("Failed to save draft before leaving:", err);
      }
      clearNavGuard();
      navigate("/dashboard");
    });
    return () => clearNavGuard();
  }, [entryPhase, publishSuccess, navigate]);

  useEffect(() => {
    if (entryPhase !== "wizard" || publishSuccess) return;

    window.history.pushState(null, "", window.location.pathname);
    const onPopState = () => {
      window.history.pushState(null, "", window.location.pathname);
      requestNavConfirm();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [entryPhase, publishSuccess]);

  useEffect(() => {
    if (entryPhase !== "wizard" || publishSuccess) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [entryPhase, publishSuccess]);

  if (entryPhase === "loading") {
    return (
      <DashboardLayout title="Create Space">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#305CDE]" />
        </div>
      </DashboardLayout>
    );
  }

  if (entryPhase === "choice") {
    return (
      <DashboardLayout title="Create Space">
        <div className="mx-auto max-w-[720px] px-4 py-10 sm:py-16">
          <h1 className="text-[26px] font-bold text-[#0A1628]">
            Continue where you left off?
          </h1>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            You have {draftsList.length} saved draft
            {draftsList.length === 1 ? "" : "s"}. Pick one to continue, or
            start a new space.
          </p>

          <div className="mt-8 space-y-3">
            {draftsList.map((draft) => (
              <div
                key={draft._id}
                className="flex items-center gap-4 rounded-[14px] border-[1.5px] border-[#E5E7EB] bg-white p-4"
              >
                {draft.coverImage ? (
                  <img
                    src={draft.coverImage}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F8F6F0] text-[#9CA3AF]">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-[#0A1628]">
                    {draft.title || "Untitled space"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#6B7280]">
                    Step {draft.step} of {STEP_LABELS.length} · Last saved{" "}
                    {new Date(draft.updatedAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDraftFromList(draft._id)}
                  disabled={draftActionLoading === draft._id}
                  className="shrink-0 text-[12px] text-[#DC2626] transition hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => continueDraft(draft._id)}
                  disabled={draftActionLoading === draft._id}
                  className="inline-flex shrink-0 items-center rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#254FC7] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {draftActionLoading === draft._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startNewSpace}
            className="mt-8 w-full rounded-[14px] border-[1.5px] border-dashed border-[#E5E7EB] bg-white py-4 text-[14px] font-semibold text-[#0A1628] transition hover:border-[#305CDE]"
          >
            + Start a New Space
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Space">
      <div className="bg-[#F8F6F0]">
        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          <StepFrame key={`${step}-${direction}`}>
            {step === 1 ? (
              <div>
                <SectionHeader
                  title="Choose a Category"
                  subtitle="Select the type of commercial space you want to list so guests can discover it more easily."
                />

                {loadingCategories ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 40,
                    }}
                  >
                    <Loader2 size={24} className="animate-spin text-[#305CDE]" />
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                        marginBottom: 24,
                      }}
                    >
                      {categories.filter(cat => cat.name !== 'Other / Custom').map((cat) => {
                        const selected = selectedCategoryIds.includes(cat._id);
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryIds((current) => {
                                const isSelected = current.includes(cat._id);
                                const next = isSelected
                                  ? current.filter((id) => id !== cat._id)
                                  : [...current, cat._id];

                                updateField("category", next[0] || "");
                                updateField(
                                  "categoryName",
                                  categories.find((c) => c._id === next[0])?.name || ""
                                );

                                return next;
                              });
                            }}
                            style={{
                              borderRadius: 12,
                              border: selected
                                ? "2px solid #0A1628"
                                : "1.5px solid #E5E7EB",
                              background: selected
                                ? "rgba(10,22,40,0.03)"
                                : "white",
                              padding: 16,
                              textAlign: "left",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                onError={e => {
                                  e.currentTarget.src = ' `https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400` '
                                  e.currentTarget.onerror = null
                                }}
                                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            ) : null}
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#0A1628",
                                margin: 0,
                              }}
                            >
                              {cat.name}
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                color: "#6B7280",
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {cat.description}
                            </p>
                            {selected &&
                            cat.subcategories &&
                            cat.subcategories.length > 0 ? (
                              <div
                                style={{
                                  marginTop: 8,
                                  borderTop: "1px solid #E5E7EB",
                                  paddingTop: 12,
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#6B7280",
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                    marginBottom: 8,
                                  }}
                                >
                                  Select subcategory
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                  }}
                                >
                                  {cat.subcategories.map((sub) => (
                                    <button
                                      key={sub._id || sub.name}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubcategoryNames((current) => {
                                          const next = current.includes(sub.name)
                                            ? current.filter((name) => name !== sub.name)
                                            : [...current, sub.name];
                                          updateField("subcategoryName", next[0] || "");
                                          return next;
                                        });
                                      }}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 9999,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        border: selectedSubcategoryNames.includes(sub.name)
                                          ? "1.5px solid #0A1628"
                                          : "1.5px solid #E5E7EB",
                                        background: selectedSubcategoryNames.includes(sub.name)
                                          ? "#0A1628"
                                          : "white",
                                        color: selectedSubcategoryNames.includes(sub.name)
                                          ? "white"
                                          : "#111827",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {sub.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {categories.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#6B7280",
                          fontSize: 14,
                        }}
                      >
                        No categories found. Please check your connection.
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <SectionHeader
                  title="Set the Location"
                  subtitle="Search your address using Google Maps. Select from the dropdown and the map will update automatically."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ position: "relative", zIndex: 1000 }}>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Search location
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <svg
                          style={{ position: "absolute", left: "14px", flexShrink: 0 }}
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            fill="#6B7280"
                          />
                        </svg>
                        <input
                          id="location-search"
                          ref={locationInputRef}
                          type="text"
                          placeholder="Search for your space address..."
                          value={locationInputValue}
                          onChange={(e) => {
                            setLocationInputValue(e.target.value);
                            updateField("locationName", e.target.value);
                            setShowLocationDropdown(true);
                          }}
                          onFocus={() => setShowLocationDropdown(true)}
                          style={{
                            width: "100%",
                            padding: "14px 16px 14px 44px",
                            borderRadius: "12px",
                            border: "1.5px solid #E5E7EB",
                            fontSize: "15px",
                            color: "#111827",
                            outline: "none",
                            boxSizing: "border-box",
                            background: "#fff",
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setShowLocationDropdown(false);
                          }}
                        />
                        {locationInputValue ? (
                          <button
                            type="button"
                            aria-label="Clear location search"
                            onClick={() => {
                              setLocationInputValue("");
                              setLocationSuggestions([]);
                              setShowLocationDropdown(false);
                              setForm((prev) => ({
                                ...prev,
                                locationName: "",
                                address: "",
                                city: "",
                                country: "",
                                postcode: "",
                                lat: null,
                                lng: null,
                                latitude: null,
                                longitude: null,
                              }));
                              if (markerRef.current) {
                                markerRef.current.setMap(null);
                                markerRef.current = new window.google.maps.Marker({
                                  map: mapRef.current || null,
                                });
                              }
                            }}
                            style={{
                              position: "absolute",
                              right: "14px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#6B7280",
                              fontSize: "18px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            x
                          </button>
                        ) : null}
                      </div>

                      {showLocationDropdown && locationSuggestions.length > 0 ? (
                        <div
                          data-location-dropdown
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: 0,
                            right: 0,
                            background: "#fff",
                            borderRadius: "16px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 8px 32px rgba(10,22,40,0.12)",
                            zIndex: 9999,
                            overflow: "hidden",
                          }}
                        >
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => {
                                setLocationInputValue(
                                  suggestion.structured_formatting?.main_text ||
                                    suggestion.description
                                );
                                setShowLocationDropdown(false);
                                setLocationSuggestions([]);

                                if (window.google?.maps?.places) {
                                  const placesService =
                                    new window.google.maps.places.PlacesService(
                                      document.getElementById("location-map") ||
                                        document.createElement("div")
                                    );
                                  placesService.getDetails(
                                    {
                                      placeId: suggestion.place_id,
                                      fields: [
                                        "geometry",
                                        "formatted_address",
                                        "address_components",
                                        "name",
                                      ],
                                    },
                                    (place, status) => {
                                      if (
                                        status ===
                                          window.google.maps.places.PlacesServiceStatus.OK &&
                                        place
                                      ) {
                                        let address = "";
                                        let city = "";
                                        let country = "";
                                        let postcode = "";

                                        place.address_components?.forEach((component) => {
                                          const types = component.types;
                                          if (
                                            types.includes("street_number") ||
                                            types.includes("route")
                                          ) {
                                            address += `${component.long_name} `;
                                          }
                                          if (
                                            types.includes("postal_town") ||
                                            types.includes("locality")
                                          ) {
                                            city = component.long_name;
                                          }
                                          if (types.includes("country")) {
                                            country = component.long_name;
                                          }
                                          if (types.includes("postal_code")) {
                                            postcode = component.long_name;
                                          }
                                        });

                                        const lat = place.geometry.location.lat();
                                        const lng = place.geometry.location.lng();

                                        setForm((prev) => ({
                                          ...prev,
                                          locationName:
                                            place.name ||
                                            place.formatted_address ||
                                            suggestion.description,
                                          address: address.trim() || place.formatted_address,
                                          city,
                                          country,
                                          postcode,
                                          lat,
                                          lng,
                                          latitude: lat,
                                          longitude: lng,
                                        }));

                                        if (mapRef.current) {
                                          mapRef.current.setCenter({ lat, lng });
                                          mapRef.current.setZoom(16);
                                        }
                                        if (markerRef.current) {
                                          markerRef.current.setPosition({ lat, lng });
                                        }
                                      }
                                    }
                                  );
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                width: "100%",
                                padding: "14px 16px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                borderBottom:
                                  index < locationSuggestions.length - 1
                                    ? "1px solid #F3F4F6"
                                    : "none",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#F8F6F0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "none";
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  background: "#F0F4FF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                    fill="#2E58EC"
                                  />
                                </svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#111827",
                                    marginBottom: "2px",
                                  }}
                                >
                                  {suggestion.structured_formatting?.main_text ||
                                    suggestion.description.split(",")[0]}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#6B7280",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {suggestion.structured_formatting?.secondary_text ||
                                    suggestion.description
                                      .split(",")
                                      .slice(1)
                                      .join(",")
                                      .trim()}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Address
                      </label>
                      <input
                        className={inputClassName}
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Full address"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        City
                      </label>
                      <input
                        className={inputClassName}
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Country
                    </label>
                    <input
                      className={inputClassName}
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="Country"
                    />
                  </div>

                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <div
                      id="location-map"
                      ref={mapContainerRef}
                      style={{
                        height: "300px",
                        width: "100%",
                        borderRadius: "12px",
                        display: "block",
                        backgroundColor: "#e5e7eb",
                      }}
                    />
                  </div>

                  {form.city ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "12px",
                        padding: "12px 16px",
                        background: "#F0FDF4",
                        borderRadius: "10px",
                        border: "1px solid #86EFAC",
                      }}
                    >
                      <Check size={16} color="#16A34A" />
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#15803D",
                          fontWeight: "500",
                        }}
                      >
                        {[form.address, form.city, form.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <SectionHeader
                  title="Add the Listing Details"
                  subtitle="Describe your space clearly so guests understand what makes it premium and how it works."
                />

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Listing title
                    </label>
                    <input
                      className={inputClassName}
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Description
                    </label>
                    <textarea
                      rows={6}
                      className={textareaClassName}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Capacity
                      </label>
                      <input
                        type="number"
                        className={inputClassName}
                        value={form.capacity}
                        onChange={(event) => updateField("capacity", event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Space Rules
                    </label>
                    <textarea
                      rows={5}
                      className={textareaClassName}
                      value={form.houseRules}
                      onChange={(event) => updateField("houseRules", event.target.value)}
                      placeholder="e.g. No smoking, No events after 10pm, All equipment must be returned after use"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Listing Terms (optional)
                    </label>
                    <p className="mb-2 text-[12px] text-[#6B7280]">
                      Your own terms for this specific space -- e.g. equipment handling,
                      cancellation nuances, access rules. Shown to customers as a "Read More"
                      on your listing, and they'll need to tick a box agreeing to it before
                      booking. This is separate from VenCome's platform Terms &amp; Conditions
                      and won't replace them. Leave blank if you don't need one.
                    </p>
                    <textarea
                      rows={6}
                      className={textareaClassName}
                      value={form.listingTerms}
                      onChange={(event) => updateField("listingTerms", event.target.value)}
                      placeholder="e.g. All bookings require a 20% refundable damage deposit, paid separately on arrival..."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <SectionHeader
                  title="Upload Photos"
                  subtitle="Upload high quality photos of your space. First photo will be the cover image. Maximum 10 photos."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    onClick={() => document.getElementById("photo-upload-input").click()}
                    style={{
                      border: "2px dashed #E5E7EB",
                      borderRadius: 16,
                      padding: "40px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "white",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#305CDE";
                      e.currentTarget.style.background = "rgba(48,92,222,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const current = form.images || [];
                        const combined = [...current, ...files].slice(0, 10);
                        updateField("images", combined);
                        e.target.value = "";
                      }}
                    />
                    <Upload size={32} color="#305CDE" style={{ margin: "0 auto 12px" }} />
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#0A1628",
                        margin: 0,
                      }}
                    >
                      Click to upload photos
                    </p>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>
                      JPEG, PNG, WebP up to 10MB each - maximum 10 photos
                    </p>
                  </div>

                  {form.images && form.images.length > 0 ? (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0A1628",
                          }}
                        >
                          {form.images.length} photo{form.images.length !== 1 ? "s" : ""}{" "}
                          selected
                        </p>
                        <button
                          type="button"
                          onClick={() => updateField("images", [])}
                          style={{
                            fontSize: 13,
                            color: "#DC2626",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Remove all
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {form.images.map((file, index) => {
                          const url = file instanceof File ? URL.createObjectURL(file) : file;
                          return (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                borderRadius: 12,
                                overflow: "hidden",
                                border: "1.5px solid #E5E7EB",
                              }}
                            >
                              <img
                                src={url}
                                alt={`Photo ${index + 1}`}
                                style={{
                                  width: "100%",
                                  height: 120,
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                              <button
                                type="button"
                                aria-label={`Remove photo ${index + 1}`}
                                onClick={() => {
                                  const updated = form.images.filter((_, i) => i !== index);
                                  updateField("images", updated);
                                }}
                                style={{
                                  position: "absolute",
                                  top: 6,
                                  right: 6,
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "rgba(0,0,0,0.6)",
                                  color: "white",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                }}
                              >
                                x
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {(form.images?.length > 0 || form.photoUrls?.length > 0) && (
                    <div style={{ marginTop: "28px" }}>
                      <p
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#0A1628",
                          marginBottom: "6px",
                        }}
                      >
                        Select Cover Image
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6B7280",
                          marginBottom: "16px",
                        }}
                      >
                        This is the main photo shown on your listing card. Click a photo to
                        set it as cover.
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {(form.images?.length > 0 ? form.images : form.photoUrls || []).map(
                          (photo, index) => {
                            const src =
                              typeof photo === "string"
                                ? photo
                                : photo instanceof File
                                ? URL.createObjectURL(photo)
                                : "";
                            const isSelected = (form.coverImageIndex ?? 0) === index;

                            return (
                              <div
                                key={index}
                                onClick={() => updateField("coverImageIndex", index)}
                                style={{
                                  position: "relative",
                                  width: "110px",
                                  height: "82px",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  border: `3px solid ${isSelected ? "#0A1628" : "#E5E7EB"}`,
                                  transition: "border-color 0.15s ease",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={src}
                                  alt={`Photo ${index + 1}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                {isSelected && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: "0",
                                      left: "0",
                                      right: "0",
                                      background: "rgba(10,22,40,0.75)",
                                      color: "#fff",
                                      fontSize: "10px",
                                      fontWeight: "700",
                                      padding: "4px",
                                      textAlign: "center",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    COVER
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      background: "rgba(48,92,222,0.05)",
                      border: "1px solid rgba(48,92,222,0.15)",
                      borderRadius: 12,
                      padding: "14px 16px",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <Lightbulb
                      size={16}
                      color="#305CDE"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      Tips: Use natural lighting, shoot from corners to show the full
                      space, include photos of amenities. Listings with 5+ photos get 3x
                      more enquiries.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <SectionHeader
                  title="Features & Extras"
                  subtitle="Tell guests what's included and add any optional extras they can add to their booking."
                />

                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-5">
                    <div>
                      <p className="text-[15px] font-bold text-[#0A1628]">WiFi Access</p>
                      <p className="text-[13px] text-[#6B7280]">
                        Guests get free internet connection
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Toggle WiFi Access"
                      onClick={() => updateField("wifi", !form.wifi)}
                      style={{
                        width: "52px",
                        height: "28px",
                        borderRadius: "9999px",
                        background: form.wifi ? "#0A1628" : "#E5E7EB",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: form.wifi ? "27px" : "3px",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s ease",
                        }}
                      />
                    </button>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] font-bold text-[#0A1628]">Restrooms</p>
                        <p className="text-[13px] text-[#6B7280]">
                          Number of restrooms guests can use
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button
                          type="button"
                          aria-label="Decrease restroom count"
                          onClick={() =>
                            updateField("restrooms", Math.max(0, (form.restrooms || 0) - 1))
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#F3F4F6",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            color: "#0A1628",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#0A1628",
                            minWidth: "24px",
                            textAlign: "center",
                          }}
                        >
                          {form.restrooms || 0}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase restroom count"
                          onClick={() =>
                            updateField("restrooms", (form.restrooms || 0) + 1)
                          }
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "#0A1628",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Size (SQM)
                      </label>
                      <input
                        type="number"
                        className={inputClassName}
                        value={form.sizeSQM || ""}
                        onChange={(e) => updateField("sizeSQM", e.target.value)}
                        placeholder="e.g. 45"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Seat Capacity
                      </label>
                      <input
                        type="number"
                        className={inputClassName}
                        value={form.seatCapacity || ""}
                        onChange={(e) => updateField("seatCapacity", e.target.value)}
                        placeholder="e.g. 12"
                      />
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <p className="text-[15px] font-bold text-[#0A1628]">Extras</p>
                        <p className="text-[13px] text-[#6B7280]">
                          Optional add-ons guests can include in their booking
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateField("extras", [...(form.extras || []), { name: "", price: "" }])
                        }
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "#0A1628",
                          color: "#fff",
                          border: "none",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        + Add Extra
                      </button>
                    </div>

                    {(form.extras || []).length === 0 ? (
                      <div
                        style={{
                          padding: "24px",
                          border: "1.5px dashed #E5E7EB",
                          borderRadius: "12px",
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontSize: "14px",
                        }}
                      >
                        No extras added yet. Click "Add Extra" to add optional add-ons.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(form.extras || []).map((extra, index) => (
                          <div
                            key={index}
                            style={{ display: "flex", gap: "12px", alignItems: "center" }}
                          >
                            <input
                              type="text"
                              placeholder="Extra name (e.g. Projector, Catering)"
                              value={extra.name}
                              onChange={(e) => {
                                const updated = [...form.extras];
                                updated[index] = { ...updated[index], name: e.target.value };
                                updateField("extras", updated);
                              }}
                              style={{
                                flex: 2,
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1.5px solid #E5E7EB",
                                fontSize: "14px",
                                outline: "none",
                              }}
                            />
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "#0A1628",
                                }}
                              >
                                £
                              </span>
                              <input
                                type="number"
                                placeholder="Price"
                                value={extra.price}
                                onChange={(e) => {
                                  const updated = [...form.extras];
                                  updated[index] = { ...updated[index], price: e.target.value };
                                  updateField("extras", updated);
                                }}
                                style={{
                                  width: "100px",
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  border: "1.5px solid #E5E7EB",
                                  fontSize: "14px",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              aria-label="Remove extra"
                              onClick={() => {
                                const updated = form.extras.filter((_, i) => i !== index);
                                updateField("extras", updated);
                              }}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "rgba(220,38,38,0.1)",
                                border: "none",
                                color: "#DC2626",
                                cursor: "pointer",
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#0A1628",
                      marginBottom: "8px",
                    }}
                  >
                    Set Your Pricing
                  </h2>
                  <p style={{ color: "#6B7280", marginBottom: "32px" }}>
                    Enable the duration types you want to offer and set a price
                    for each.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {[
                      {
                        key: "hourly",
                        label: "Per Hour",
                        description: "Ideal for meeting rooms and studios",
                        icon: Clock,
                        placeholder: "e.g. 85",
                        unit: "hour",
                      },
                      {
                        key: "daily",
                        label: "Per Day",
                        description: "Full day bookings",
                        icon: Calendar,
                        placeholder: "e.g. 450",
                        unit: "day",
                      },
                      {
                        key: "weekly",
                        label: "Per Week",
                        description: "Weekly arrangements",
                        icon: CalendarDays,
                        placeholder: "e.g. 1800",
                        unit: "week",
                      },
                      {
                        key: "monthly",
                        label: "Per Month",
                        description: "Monthly rolling agreements",
                        icon: CalendarRange,
                        placeholder: "e.g. 5500",
                        unit: "month",
                      },
                      {
                        key: "annual",
                        label: "Per Year",
                        description: "Annual or long-term leases",
                        icon: Building2,
                        placeholder: "e.g. 60000",
                        unit: "year",
                      },
                    ].map(({ key, label, description, icon: Icon, placeholder, unit }) => (
                      <div
                        key={key}
                        style={{
                          border: `2px solid ${
                            form.pricing[key]?.enabled ? "#0A1628" : "#E5E7EB"
                          }`,
                          borderRadius: "12px",
                          padding: "20px",
                          background: form.pricing[key]?.enabled
                            ? "rgba(10,22,40,0.02)"
                            : "#fff",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              [key]: {
                                ...prev.pricing[key],
                                enabled: !prev.pricing[key]?.enabled,
                              },
                            },
                          }))
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#0A1628",
                              }}
                            >
                              {Icon ? <Icon size={20} /> : null}
                            </span>
                            <div>
                              <p
                                style={{
                                  fontWeight: "700",
                                  color: "#0A1628",
                                  fontSize: "15px",
                                  margin: 0,
                                }}
                              >
                                {label}
                              </p>
                              <p
                                style={{
                                  color: "#6B7280",
                                  fontSize: "13px",
                                  margin: 0,
                                }}
                              >
                                {description}
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: `2px solid ${
                                form.pricing[key]?.enabled ? "#0A1628" : "#D1D5DB"
                              }`,
                              background: form.pricing[key]?.enabled
                                ? "#0A1628"
                                : "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {form.pricing[key]?.enabled && (
                              <Check size={14} color="#fff" />
                            )}
                          </div>
                        </div>

                        {form.pricing[key]?.enabled && (
                          <div
                            style={{ marginTop: "16px" }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "700",
                                  color: "#0A1628",
                                }}
                              >
                                £
                              </span>
                              <input
                                type="number"
                                placeholder={placeholder}
                                value={form.pricing[key]?.price || ""}
                                onChange={(event) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    pricing: {
                                      ...prev.pricing,
                                      [key]: {
                                        ...prev.pricing[key],
                                        price: event.target.value,
                                      },
                                    },
                                  }))
                                }
                                style={{
                                  flex: 1,
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  border: "1.5px solid #E5E7EB",
                                  fontSize: "16px",
                                  fontWeight: "600",
                                  color: "#0A1628",
                                  outline: "none",
                                }}
                                min="0"
                              />
                              <span
                                style={{
                                  color: "#6B7280",
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                / {unit}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(form.pricing.hourly?.enabled || form.pricing.daily?.enabled) && (
                    <DayOfWeekPricing
                      enabled={form.customDayPricingEnabled}
                      customDayPricing={form.customDayPricing}
                      onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                    />
                  )}

                  {form.pricing.daily?.enabled && (
                    <div
                      style={{ marginTop: "24px", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                      onClick={() => setForm((prev) => ({ ...prev, singleDayOnly: !prev.singleDayOnly }))}
                    >
                      <div>
                        <p style={{ fontWeight: "700", color: "#0A1628", fontSize: "15px", margin: 0 }}>
                          Single-day bookings only
                        </p>
                        <p style={{ color: "#6B7280", fontSize: "13px", margin: "2px 0 0" }}>
                          Like a one-way flight — guests can only book one calendar day at a time, not a multi-night stay
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={form.singleDayOnly ? "Disable single-day-only bookings" : "Enable single-day-only bookings"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev) => ({ ...prev, singleDayOnly: !prev.singleDayOnly }));
                        }}
                        style={{
                          width: "48px", height: "26px", borderRadius: "9999px",
                          background: form.singleDayOnly ? "#0A1628" : "#E5E7EB",
                          border: "none", cursor: "pointer", position: "relative",
                          transition: "background 0.2s ease", flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            position: "absolute", top: "3px",
                            left: form.singleDayOnly ? "25px" : "3px",
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: "#fff", transition: "left 0.2s ease",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          }}
                        />
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "24px",
                      padding: "16px",
                      background: "#F8F6F0",
                      borderRadius: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6B7280",
                        margin: 0,
                      }}
                    >
                      You must enable at least one pricing option to publish your
                      listing.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 7 ? (
              <div>
                <SectionHeader
                  title="Availability"
                  subtitle="Define when your listing can be booked and how much notice guests need before checkout."
                />

                <div className="space-y-6">
                  <div>
                    <h3 className={sectionTitleClassName}>Open Days</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {DAYS.map((day) => {
                        const selected = form.availabilityDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`rounded-xl border-[1.5px] px-4 py-3 text-[14px] transition ${
                              selected
                                ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)] font-semibold text-[#0A1628]"
                                : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#305CDE]"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Start time
                      </label>
                      <input
                        type="time"
                        className={inputClassName}
                        value={form.startTime}
                        onChange={(event) => updateField("startTime", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        End time
                      </label>
                      <input
                        type="time"
                        className={inputClassName}
                        value={form.endTime}
                        onChange={(event) => updateField("endTime", event.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <label
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0A1628",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Minimum Notice Period
                    </label>
                    <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>
                      How much notice do you need before a booking starts?
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {[
                        { value: "none", label: "No minimum" },
                        { value: "1hour", label: "1 hour" },
                        { value: "2hours", label: "2 hours" },
                        { value: "6hours", label: "6 hours" },
                        { value: "12hours", label: "12 hours" },
                        { value: "24hours", label: "24 hours" },
                        { value: "48hours", label: "48 hours" },
                        { value: "72hours", label: "3 days" },
                        { value: "7days", label: "7 days" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField("minNotice", option.value)}
                          style={{
                            padding: "10px 18px",
                            borderRadius: "9999px",
                            border: `2px solid ${
                              form.minNotice === option.value ? "#0A1628" : "#E5E7EB"
                            }`,
                            background: form.minNotice === option.value ? "#0A1628" : "#fff",
                            color: form.minNotice === option.value ? "#fff" : "#0A1628",
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
                  </div>

                </div>
              </div>
            ) : null}

            {step === 10 ? (
              <div>
                <SectionHeader
                  title="Buffer Time"
                  subtitle="Add automatic gap time before and after each booking to give yourself time to prepare or clean the space."
                />

                <div className="space-y-8">
                  <div>
                    <p className="mb-3 text-[13px] font-bold text-[#0A1628]">
                      Before each booking
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {BUFFER_OPTIONS.map((option) => {
                        const selected = beforeSelection === option.value;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => handleBufferSelect("before", option.value)}
                            className={`min-h-[44px] min-w-[calc(33%-8px)] rounded-xl border-[1.5px] px-4 py-3 text-[14px] transition sm:min-w-0 sm:px-5 ${
                              selected
                                ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)] font-semibold text-[#0A1628]"
                                : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#305CDE]"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    {beforeSelection === "custom" ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <input
                          type="number"
                          className="h-11 w-20 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-center text-[15px] outline-none focus:border-[#0A1628]"
                          value={customBefore}
                          onChange={(event) => setCustomBefore(event.target.value)}
                        />
                        <select
                          className="h-11 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#0A1628]"
                          value={customBeforeUnit}
                          onChange={(event) => setCustomBeforeUnit(event.target.value)}
                        >
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                        </select>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="mb-3 text-[13px] font-bold text-[#0A1628]">
                      After each booking
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {BUFFER_OPTIONS.map((option) => {
                        const selected = afterSelection === option.value;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => handleBufferSelect("after", option.value)}
                            className={`min-h-[44px] min-w-[calc(33%-8px)] rounded-xl border-[1.5px] px-4 py-3 text-[14px] transition sm:min-w-0 sm:px-5 ${
                              selected
                                ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)] font-semibold text-[#0A1628]"
                                : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#305CDE]"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    {afterSelection === "custom" ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <input
                          type="number"
                          className="h-11 w-20 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-center text-[15px] outline-none focus:border-[#0A1628]"
                          value={customAfter}
                          onChange={(event) => setCustomAfter(event.target.value)}
                        />
                        <select
                          className="h-11 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#0A1628]"
                          value={customAfterUnit}
                          onChange={(event) => setCustomAfterUnit(event.target.value)}
                        >
                          <option value="minutes">minutes</option>
                          <option value="hours">hours</option>
                        </select>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F6F0] p-5">
                    <div className="flex items-stretch overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                      <motion.div
                        animate={{ width: beforeWidth }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[72px] border border-dashed border-[#305CDE] bg-[rgba(48,92,222,0.2)]"
                      />
                      <motion.div
                        animate={{ width: bookingWidth }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[72px] bg-[#0A1628]"
                      />
                      <motion.div
                        animate={{ width: afterWidth }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[72px] border border-dashed border-[#305CDE] bg-[rgba(48,92,222,0.2)]"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-center text-[12px] text-[#6B7280]">
                      <p>{formatBufferLabel(effectiveBufferBefore)}</p>
                      <p className="font-semibold text-[#0A1628]">Booking</p>
                      <p>{formatBufferLabel(effectiveBufferAfter)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-[rgba(48,92,222,0.2)] bg-[rgba(48,92,222,0.05)] px-4 py-4">
                    <Lightbulb size={16} className="mt-1 shrink-0 text-[#305CDE]" />
                    <p className="text-[13px] leading-6 text-[#6B7280]">
                      Buffer time slots are automatically blocked on your calendar.
                      Guests cannot book during buffer periods. You can change
                      this at any time from your listing settings.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 8 ? (
              <div>
                <SectionHeader
                  title="Set Up Discounts"
                  subtitle="Encourage more bookings with automatic discounts. You can change these anytime."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    {
                      key: "newListing",
                      title: "New Listing Promotion (20%)",
                      description:
                        "Get noticed faster with an automatic 20% discount on your first few bookings.",
                    },
                    {
                      key: "lastMinute",
                      title: "Last Minute Discount (1%)",
                      description:
                        "Offer small savings for guests booking within a few days of arrival.",
                    },
                    {
                      key: "weekly",
                      title: "Weekly Discount (10%)",
                      description: "Reward guests who stay for 7 days or more.",
                    },
                    {
                      key: "monthly",
                      title: "Monthly Discount (20%)",
                      description:
                        "Attract long-term stays with generous monthly savings.",
                    },
                  ].map((discount) => {
                    const enabled = form.discounts?.[discount.key] || false;
                    return (
                      <div
                        key={discount.key}
                        onClick={() =>
                          updateField("discounts", {
                            ...form.discounts,
                            [discount.key]: !enabled,
                          })
                        }
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "16px",
                          padding: "20px",
                          borderRadius: "12px",
                          border: `2px solid ${enabled ? "#0A1628" : "#E5E7EB"}`,
                          background: enabled ? "rgba(10,22,40,0.02)" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "#0A1628",
                              margin: "0 0 4px",
                            }}
                          >
                            {discount.title}
                          </p>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#6B7280",
                              margin: 0,
                              lineHeight: "1.5",
                            }}
                          >
                            {discount.description}
                          </p>
                        </div>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            flexShrink: 0,
                            border: `2px solid ${enabled ? "#0A1628" : "#D1D5DB"}`,
                            background: enabled ? "#0A1628" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {enabled && <Check size={14} color="#fff" />}
                        </div>
                      </div>
                    );
                  })}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      padding: "20px",
                      borderRadius: "12px",
                      border: `2px solid ${Number(form.discounts?.extendedHours) > 0 ? "#0A1628" : "#E5E7EB"}`,
                      background: Number(form.discounts?.extendedHours) > 0 ? "rgba(10,22,40,0.02)" : "#fff",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "0 0 4px" }}>
                        Extended Hours Discount
                      </p>
                      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>
                        Offer your own discount for hourly bookings longer than 3 hours. Set to 0 to disable.
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.discounts?.extendedHours || ""}
                        onChange={(e) =>
                          updateField("discounts", {
                            ...form.discounts,
                            extendedHours: e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                        placeholder="0"
                        style={{
                          width: "64px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "1.5px solid #E5E7EB",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0A1628",
                          textAlign: "center",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: "#6B7280" }}>%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 9 ? (
              <div>
                <SectionHeader
                  title="Booking Settings"
                  subtitle="Choose how you want to handle incoming bookings."
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    {
                      key: "approveFirstFive",
                      title: "Approve first 5 bookings",
                      badge: "Recommended",
                      description:
                        "You'll manually approve your first 5 bookings. After that, bookings can be automatic.",
                    },
                    {
                      key: "instantBook",
                      title: "Instant Book",
                      badge: null,
                      description:
                        "Guests can book instantly without needing your approval.",
                    },
                    {
                      key: "approveAll",
                      title: "Approve All Bookings",
                      badge: null,
                      description:
                        "You'll manually approve all your bookings. You cannot receive any booking unless you approve it.",
                    },
                  ].map((option) => {
                    const selected = form.bookingApproval === option.key;
                    return (
                      <div
                        key={option.key}
                        onClick={() => {
                          updateField("bookingApproval", option.key);
                          updateField("instantBook", option.key === "instantBook");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "16px",
                          padding: "20px",
                          borderRadius: "12px",
                          border: `2px solid ${selected ? "#0A1628" : "#E5E7EB"}`,
                          background: selected ? "rgba(10,22,40,0.02)" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "4px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "15px",
                                fontWeight: "700",
                                color: "#0A1628",
                                margin: 0,
                              }}
                            >
                              {option.title}
                            </p>
                            {option.badge && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                  background: "rgba(46,88,236,0.1)",
                                  color: "#2E58EC",
                                  border: "1px solid rgba(46,88,236,0.2)",
                                }}
                              >
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#6B7280",
                              margin: 0,
                              lineHeight: "1.5",
                            }}
                          >
                            {option.description}
                          </p>
                        </div>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            border: `2px solid ${selected ? "#0A1628" : "#D1D5DB"}`,
                            background: selected ? "#0A1628" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "2px",
                          }}
                        >
                          {selected && <Check size={12} color="#fff" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 11 ? (
              <div>
                <SectionHeader
                  title="Block Dates"
                  subtitle="Click dates to mark them as unavailable. Guests cannot book these dates."
                />
                <BlockDatesEditor
                  blockedDates={form.blockedDates}
                  onChange={(next) => updateField("blockedDates", next)}
                />
              </div>
            ) : null}


            {step === 12 ? (
              <div>
                <SectionHeader
                  title="Upload Lease Agreement"
                  subtitle="Upload your standard lease agreement. Guests will be required to review and e-sign this before booking. This is optional and can be added later."
                />

                <div
                  style={{
                    background: "rgba(255,193,7,0.1)",
                    border: "1px solid rgba(255,193,7,0.3)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "24px",
                    fontSize: "13px",
                    color: "#92400E",
                  }}
                >
                  Accepted formats: PDF, DOC, DOCX. Max 10MB. This is optional for now and can
                  be added later.
                </div>

                {!form.leaseAgreement ? (
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "48px 24px",
                      border: "2px dashed #E5E7EB",
                      borderRadius: "16px",
                      cursor: "pointer",
                      background: "#fff",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.borderColor = "#2E58EC";
                      event.currentTarget.style.background = "rgba(46,88,236,0.02)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.borderColor = "#E5E7EB";
                      event.currentTarget.style.background = "#fff";
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) updateField("leaseAgreement", file);
                      }}
                    />
                    <Upload size={32} color="#2E58EC" style={{ marginBottom: "12px" }} />
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0A1628",
                        margin: "0 0 6px",
                      }}
                    >
                      Click to upload lease agreement
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                      PDF, DOC or DOCX up to 10MB
                    </p>
                  </label>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      border: "1.5px solid #86EFAC",
                      borderRadius: "12px",
                      background: "#F0FDF4",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#DCFCE7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={20} color="#16A34A" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0A1628",
                            margin: "0 0 2px",
                          }}
                        >
                          {form.leaseAgreement instanceof File
                            ? form.leaseAgreement.name
                            : "Lease agreement uploaded"}
                        </p>
                        <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                          {form.leaseAgreement instanceof File
                            ? `${(form.leaseAgreement.size / 1024).toFixed(1)} KB`
                            : "Saved from your draft"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField("leaseAgreement", null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#DC2626",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep(13)}
                  style={{
                    marginTop: "24px",
                    background: "none",
                    border: "none",
                    color: "#6B7280",
                    fontSize: "13px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Skip for now — add later from listings settings
                </button>
              </div>
            ) : null}

            {step === 13 ? (
              <div>
                <SectionHeader
                  title="Connect Your Calendar"
                  subtitle="Sync your VenCome availability with your existing calendar. When you receive a booking elsewhere, it automatically blocks on VenCome and vice versa."
                />

                <button
                  type="button"
                  onClick={() => setStep(14)}
                  className="mb-8 text-[13px] font-medium text-[#305CDE] transition hover:underline"
                >
                  Skip for now — set up later in settings
                </button>

                <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-[#F8F6F0] p-5">
                  <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:text-left">
                    {["VenCome Booking", "Auto-syncs", "Your Calendar"].map(
                      (item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-4 md:flex-1 md:justify-center"
                        >
                          <div className="flex flex-col items-center">
                            <span className="block h-2 w-2 rounded-full bg-[#0A1628]" />
                            <span className="mt-2 text-[12px] text-[#6B7280]">
                              {item}
                            </span>
                          </div>
                          {index < 2 ? (
                            <div className="hidden h-[2px] w-14 bg-[#E5E7EB] md:block" />
                          ) : null}
                        </div>
                      )
                    )}
                  </div>
                  <p className="mt-4 text-center text-[13px] text-[#6B7280]">
                    Changes sync in real time. Cancellations and modifications
                    update automatically on both platforms.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {CALENDAR_PROVIDERS.map((provider) => {
                    const status =
                      provider.id === "google"
                        ? hostCalendarStatus.google
                        : provider.id === "outlook"
                        ? hostCalendarStatus.outlook
                        : provider.id === "calcom"
                        ? hostCalendarStatus.calcom
                        : provider.id === "calendly"
                        ? hostCalendarStatus.calendly
                        : provider.id === "apple"
                        ? hostCalendarStatus.apple
                        : null;
                    // iCal Feed is per-listing (saved on this property, not the
                    // host account), so its "connected" state comes from the
                    // wizard's own form data rather than hostCalendarStatus.
                    const connected =
                      provider.id === "ical" ? Boolean(form.icalUrl) : Boolean(status?.connected);
                    const loading = connectingCalendar === provider.id;
                    const statusLabel = status?.email || status?.username;

                    return (
                      <motion.div
                        key={provider.id}
                        layout
                        className={`rounded-[14px] border-[1.5px] bg-white p-5 ${
                          connected
                            ? "border-[#16A34A]"
                            : "border-[#E5E7EB] hover:border-[#305CDE]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <ProviderLogo providerId={provider.id} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-bold text-[#0A1628]">
                              {provider.name}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                              {provider.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          {provider.comingSoon ? (
                            <span className="inline-flex items-center rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-[12px] font-semibold text-[#6B7280]">
                              Coming soon
                            </span>
                          ) : provider.type === "ical" ? (
                            <div>
                              <input
                                type="url"
                                value={form.icalUrl}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, icalUrl: e.target.value }))
                                }
                                placeholder="https://.../calendar.ics"
                                className="h-10 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
                              />
                              {connected ? (
                                <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#16A34A]">
                                  <Check size={12} />
                                  Saved — will sync after this listing is published
                                </span>
                              ) : null}
                            </div>
                          ) : connected ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] px-3.5 py-1.5 text-[12px] font-semibold text-[#16A34A]">
                                <Check size={12} />
                                Connected{statusLabel ? ` as ${statusLabel}` : ""}
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => navigate("/settings")}
                                  className="mt-2 text-[12px] text-[#305CDE] transition hover:underline"
                                >
                                  Manage in Settings
                                </button>
                              </div>
                            </div>
                          ) : provider.type === "apikey" ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                type="text"
                                value={calcomApiKeyInput}
                                onChange={(e) => setCalcomApiKeyInput(e.target.value)}
                                placeholder="cal_live_..."
                                className="h-10 flex-1 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
                              />
                              <button
                                type="button"
                                disabled={connectingCalcom}
                                onClick={handleCalcomConnect}
                                className="inline-flex items-center justify-center rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#254FC7] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {connectingCalcom ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  "Connect"
                                )}
                              </button>
                            </div>
                          ) : provider.type === "credentials" ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={appleUsernameInput}
                                onChange={(e) => setAppleUsernameInput(e.target.value)}
                                placeholder="Apple ID email"
                                className="h-10 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
                              />
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                  type="password"
                                  value={applePasswordInput}
                                  onChange={(e) => setApplePasswordInput(e.target.value)}
                                  placeholder="App-specific password"
                                  className="h-10 flex-1 rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[13px] outline-none focus:border-[#0A1628]"
                                />
                                <button
                                  type="button"
                                  disabled={connectingApple}
                                  onClick={handleAppleConnect}
                                  className="inline-flex items-center justify-center rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#254FC7] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {connectingApple ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    "Connect"
                                  )}
                                </button>
                              </div>
                              <p className="text-[11px] text-[#9CA3AF]">
                                Generate one at appleid.apple.com → Sign-In and Security → App-Specific Passwords.
                              </p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={loading || calendarStatusLoading}
                              onClick={() => handleCalendarConnect(provider.id)}
                              className="inline-flex items-center rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#254FC7] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {loading ? (
                                <>
                                  <Loader2 size={14} className="mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {hostCalendarStatus.google?.connected ||
                  hostCalendarStatus.outlook?.connected ||
                  hostCalendarStatus.calcom?.connected ||
                  hostCalendarStatus.calendly?.connected ||
                  hostCalendarStatus.apple?.connected ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-6 rounded-xl border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.06)] px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 text-[#16A34A]"
                        />
                        <div>
                          <p className="text-[15px] font-semibold text-[#16A34A]">
                            {[hostCalendarStatus.google?.connected, hostCalendarStatus.outlook?.connected, hostCalendarStatus.calcom?.connected, hostCalendarStatus.calendly?.connected, hostCalendarStatus.apple?.connected].filter(Boolean).length} calendar connected
                          </p>
                          <p className="mt-1 text-[13px] text-[#6B7280]">
                            Your VenCome availability will now sync automatically.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}

            {step === 14 ? (
              <div>
                <SectionHeader
                  title="Preview Your Listing"
                  subtitle="Review the core information before you publish your space to VenCome."
                />

                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
                    <img
                      src={
                        form.photoUrls?.[0] ||
                        (form.images?.[0]
                          ? form.images[0] instanceof File
                            ? URL.createObjectURL(form.images[0])
                            : form.images[0]
                          : "/placeholder.jpg")
                      }
                      alt={form.title}
                      className="h-64 w-full object-cover"
                    />
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#0A1628] px-3 py-1 text-[12px] font-semibold text-white">
                          {previewCategory}
                        </span>
                        {form.instantBook ? (
                          <span className="rounded-full bg-[rgba(22,163,74,0.1)] px-3 py-1 text-[12px] font-semibold text-[#16A34A]">
                            Instant Book
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-[26px] font-extrabold text-[#0A1628]">
                        {form.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[14px] text-[#6B7280]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />
                          {form.locationName}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {form.startTime} - {form.endTime}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {form.availabilityDays.length} days open
                        </span>
                      </div>

                      <p className="mt-4 text-[15px] leading-7 text-[#374151]">
                        {form.description}
                      </p>

                      {(form.photoUrls?.length || form.images?.length) > 0 ? (
                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {(form.photoUrls?.length ? form.photoUrls : form.images || []).map(
                            (image, index) => (
                              <img
                                key={index}
                                src={
                                  image instanceof File
                                    ? URL.createObjectURL(image)
                                    : image
                                }
                                alt={`Photo ${index + 1}`}
                                className="h-24 w-full rounded-xl object-cover"
                              />
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(form.pricing || {})
                      .filter(([, pricing]) => pricing.enabled && pricing.price)
                      .map(([key, pricing]) => ({
                        label: key.charAt(0).toUpperCase() + key.slice(1),
                        value: formatCurrency(pricing.price),
                      }))
                      .map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[#E5E7EB] bg-white p-5"
                      >
                        <p className="text-[13px] font-bold text-[#6B7280]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-[24px] font-extrabold text-[#0A1628]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                    <h3 className={sectionTitleClassName}>Operational Settings</h3>
                    <div className="mt-4 grid gap-3 text-[14px] text-[#374151]">
                      <p>
                        Buffer before:{" "}
                        <span className="font-semibold text-[#0A1628]">
                          {formatBufferLabel(effectiveBufferBefore)}
                        </span>
                      </p>
                      <p>
                        Buffer after:{" "}
                        <span className="font-semibold text-[#0A1628]">
                          {formatBufferLabel(effectiveBufferAfter)}
                        </span>
                      </p>
                      <p>
                        Connected calendars:{" "}
                        <span className="font-semibold text-[#0A1628]">
                          {[hostCalendarStatus.google?.connected, hostCalendarStatus.outlook?.connected, hostCalendarStatus.calcom?.connected, hostCalendarStatus.calendly?.connected, hostCalendarStatus.apple?.connected].filter(Boolean).length}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </StepFrame>
        </AnimatePresence>

        {validationError && (
          <div
            style={{
              position: "fixed",
              bottom: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0A1628",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              zIndex: 9999,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              maxWidth: "480px",
              width: "90%",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              !
            </span>
            {validationError}
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setValidationError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: "0 4px",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="sticky bottom-0 z-50 -mx-4 mt-8 border-t border-[#E5E7EB] bg-white px-4 py-3 sm:-mx-10 sm:px-8 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-h-[48px] items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827] transition hover:border-[#0A1628] sm:w-auto sm:flex-none"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => saveDraft(false)}
                disabled={savingDraft}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #E5E7EB",
                  background: "#fff",
                  color: "#6B7280",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: savingDraft ? "not-allowed" : "pointer",
                  opacity: savingDraft ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {savingDraft ? <Loader2 size={14} className="animate-spin" /> : null}
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>
              <p className="text-center text-[13px] text-[#6B7280]">
                Step {step} of 14
              </p>
            </div>

            {step < 14 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7] sm:w-auto sm:flex-none"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <div className="w-full sm:w-auto">
                {error && (
                  <div
                    style={{
                      color: "#DC2626",
                      fontSize: 14,
                      marginBottom: 12,
                      padding: "10px 16px",
                      background: "rgba(220,38,38,0.08)",
                      borderRadius: 8,
                    }}
                  >
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  disabled={isLoading || isPublishing}
                  onClick={handlePublish}
                  className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7] disabled:opacity-70 sm:w-auto sm:flex-none"
                >
                  {isLoading || isPublishing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Publish Listing
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        {publishSuccess && (
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
                borderRadius: "16px",
                padding: "48px 40px",
                maxWidth: "480px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <CheckCircle2 size={64} color="#16A34A" style={{ margin: "0 auto" }} />
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0A1628",
                  marginBottom: "12px",
                }}
              >
                Your listing is live!
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "#6B7280",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                }}
              >
                {form.title || "Your listing"} has been published successfully.
                Tenants can now discover and book your space.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/host/listings")}
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
                  View My Listings
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/create-space";
                  }}
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
                  Add Another Space
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
