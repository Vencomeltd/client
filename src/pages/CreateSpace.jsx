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
  "Pricing",
  "Availability",
  "Buffer Time",
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
    description: "Connect any CalDAV compatible calendar",
    type: "oauth",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Sync via Calendly webhook & API",
    type: "oauth",
  },
  {
    id: "calcom",
    name: "Cal.com",
    description: "Open-source scheduling via Cal.com API",
    type: "oauth",
  },
  {
    id: "ical",
    name: "iCal Feed (URL)",
    description: "Paste any .ics calendar feed URL",
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
  minHours: "",
  minNotice: "24hours",
  availability: "",
  availabilityDays: [],
  startTime: "",
  endTime: "",
  instantBook: false,
  houseRules: "",
  wifi: false,
  size: "",
  naturalLight: false,
  restrooms: "",
  refundPolicy: "moderate",
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
        <p className="text-[13px] text-[#6B7280]">Step {step} of 9</p>
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
  const [beforeSelection, setBeforeSelection] = useState(0);
  const [afterSelection, setAfterSelection] = useState(0);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [customBefore, setCustomBefore] = useState("");
  const [customAfter, setCustomAfter] = useState("");
  const [customBeforeUnit, setCustomBeforeUnit] = useState("minutes");
  const [customAfterUnit, setCustomAfterUnit] = useState("minutes");
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [connectingCalendar, setConnectingCalendar] = useState(null);
  const [icalUrl, setIcalUrl] = useState("");
  const [showIcalInput, setShowIcalInput] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationInputValue, setLocationInputValue] = useState("");
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
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

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = "google-maps-script";

      script.onload = () => {
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

        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ["establishment", "geocode"],
          fields: ["formatted_address", "geometry", "name", "address_components"],
        });

        autocompleteRef.current = autocomplete;

        const marker = new window.google.maps.Marker({ map });
        markerRef.current = marker;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;

          map.setCenter(place.geometry.location);
          map.setZoom(16);
          marker.setPosition(place.geometry.location);

          let address = "";
          let city = "";
          let country = "";
          let postcode = "";

          place.address_components?.forEach((component) => {
            const types = component.types;
            if (types.includes("street_number") || types.includes("route")) {
              address += `${component.long_name} `;
            }
            if (types.includes("postal_town") || types.includes("locality")) {
              city = component.long_name;
            }
            if (types.includes("country")) {
              country = component.long_name;
            }
            if (types.includes("postal_code")) {
              postcode = component.long_name;
            }
          });

          setForm((prev) => ({
            ...prev,
            locationName: place.name || place.formatted_address || prev.locationName,
            address: address.trim() || place.formatted_address || "",
            city,
            country,
            postcode,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          }));
          setLocationInputValue(
            place.name || place.formatted_address || place.formatted_address || ""
          );
          setLocationSuggestions([]);
          setShowLocationDropdown(false);
        });
      };

      if (!document.getElementById("google-maps-script") && !window.google?.maps) {
        document.head.appendChild(script);
      } else if (window.google?.maps) {
        script.onload();
      }
    };

    waitForDomAndInit();

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

  const handleCalendarConnect = (providerId) => {
    setConnectingCalendar(providerId);

    window.setTimeout(() => {
      setConnectedCalendars((current) =>
        current.includes(providerId) ? current : [...current, providerId]
      );
      setConnectingCalendar(null);
      if (providerId === "ical") setShowIcalInput(false);
    }, 2000);
  };

  const disconnectCalendar = (providerId) => {
    setConnectedCalendars((current) => current.filter((item) => item !== providerId));
  };

  const nextStep = () => {
    if (step === 5) {
      const hasEnabledPricing = Object.values(form.pricing || {}).some(
        (pricing) => pricing.enabled && pricing.price
      );
      if (!hasEnabledPricing) {
        alert("Please enable at least one pricing option with a price.");
        return;
      }
    }

    setDirection(1);
    setStep((current) => Math.min(current + 1, 9));
  };
  const previousStep = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 1));
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

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("whatsIncluded", form.whatsIncluded || "");
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
        })
      );
      formData.append(
        "availability",
        form.availability || JSON.stringify(form.availabilityDays || []) || "all"
      );
      formData.append("coverImageIndex", form.coverImageIndex ?? 0);

      if (form.category) {
        formData.append("category", form.category);
      }

      if (form.images && form.images.length > 0) {
        form.images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
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
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      setIsPublishing(false);
    }
  };

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
                        const selected = form.category === cat._id;
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              updateField("category", cat._id);
                              updateField("categoryName", cat.name);
                              setSelectedSubcategory("");
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
                                        setSelectedSubcategory(sub.name);
                                        updateField("subcategoryName", sub.name);
                                      }}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 9999,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        border:
                                          selectedSubcategory === sub.name
                                            ? "1.5px solid #0A1628"
                                            : "1.5px solid #E5E7EB",
                                        background:
                                          selectedSubcategory === sub.name
                                            ? "#0A1628"
                                            : "white",
                                        color:
                                          selectedSubcategory === sub.name
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
                      What's Included
                    </label>
                    <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "10px" }}>
                      List everything tenants get with this space - WiFi, parking, AV
                      equipment, kitchen access, reception etc.
                    </p>
                    <textarea
                      value={form.whatsIncluded || ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, whatsIncluded: e.target.value }))
                      }
                      placeholder="e.g. High-speed WiFi, Parking for 2 cars, 65-inch screen, Whiteboard, Kitchen access, Dedicated reception"
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #E5E7EB",
                        fontSize: "14px",
                        color: "#111827",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        lineHeight: "1.6",
                        boxSizing: "border-box",
                      }}
                    />
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
                              typeof photo === "string" ? photo : URL.createObjectURL(photo);
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

            {step === 6 ? (
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

                  <div className={`${optionCardClassName} p-5`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={sectionTitleClassName}>Booking Type</h3>
                        <p className="mt-2 text-[14px] text-[#6B7280]">
                          Let guests book instantly or approve requests manually.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateField("instantBook", !form.instantBook)
                        }
                        className={`relative h-7 w-14 rounded-full transition ${
                          form.instantBook ? "bg-[#0A1628]" : "bg-[#E5E7EB]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            form.instantBook ? "left-8" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : null}

            {step === 7 ? (
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
                  title="Connect Your Calendar"
                  subtitle="Sync your VenCome availability with your existing calendar. When you receive a booking elsewhere, it automatically blocks on VenCome and vice versa."
                />

                <button
                  type="button"
                  onClick={() => setStep(9)}
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
                    const connected = connectedCalendars.includes(provider.id);
                    const loading = connectingCalendar === provider.id;

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
                          {connected ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] px-3.5 py-1.5 text-[12px] font-semibold text-[#16A34A]">
                                <Check size={12} />
                                Connected
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => disconnectCalendar(provider.id)}
                                  className="mt-2 text-[12px] text-[#DC2626] transition hover:underline"
                                >
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          ) : provider.type === "ical" ? (
                            <div>
                              <button
                                type="button"
                                onClick={() => setShowIcalInput((current) => !current)}
                                className="rounded-lg border-[1.5px] border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#111827] transition hover:border-[#0A1628]"
                              >
                                Add URL
                              </button>

                              <AnimatePresence initial={false}>
                                {showIcalInput ? (
                                  <motion.div
                                    key="ical-input"
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 flex flex-col gap-3">
                                      <input
                                        className="h-11 rounded-lg border-[1.5px] border-[#E5E7EB] px-4 text-[14px] outline-none focus:border-[#0A1628]"
                                        placeholder="Paste your .ics feed URL"
                                        value={icalUrl}
                                        onChange={(event) =>
                                          setIcalUrl(event.target.value)
                                        }
                                      />
                                      <button
                                        type="button"
                                        disabled={!icalUrl || loading}
                                        onClick={() => handleCalendarConnect("ical")}
                                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#305CDE] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#254FC7] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                                      >
                                        {loading ? (
                                          <>
                                            <Loader2
                                              size={14}
                                              className="mr-2 animate-spin"
                                            />
                                            Connecting...
                                          </>
                                        ) : (
                                          "Add Calendar"
                                        )}
                                      </button>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={loading}
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
                  {connectedCalendars.length > 0 ? (
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
                            {connectedCalendars.length} calendar connected
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

            {step === 9 ? (
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
                          {connectedCalendars.length || 0}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </StepFrame>
        </AnimatePresence>

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

            <p className="text-center text-[13px] text-[#6B7280]">
              Step {step} of 9
            </p>

            {step < 9 ? (
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
