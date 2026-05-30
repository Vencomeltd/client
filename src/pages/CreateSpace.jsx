import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  category: "office",
  locationName: "London Bridge, London",
  address: "The Shard, 32 London Bridge Street",
  city: "London",
  country: "United Kingdom",
  title: "The Shard Executive Suite",
  description:
    "Premium boardroom and executive suite with skyline views, concierge reception, and AV-ready setup for leadership meetings, workshops, and client presentations.",
  capacity: 24,
  photos: PHOTO_LIBRARY.slice(0, 3),
  pricingHour: "85",
  pricingDay: "580",
  pricingMonth: "7800",
  minNotice: "24 hours",
  availabilityDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "09:00",
  endTime: "18:00",
  instantBook: true,
  houseRules:
    "No smoking. Respect building reception policies. Catering requests require 48 hours notice.",
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
      CATEGORY_OPTIONS.find((category) => category.id === form.category)?.title ||
      "Office Space",
    [form.category]
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
    setDirection(1);
    setStep((current) => Math.min(current + 1, 9));
  };
  const previousStep = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 1));
  };

  const publishListing = () => {
    setIsPublishing(true);
    window.setTimeout(() => navigate("/host/listings"), 1200);
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

                <div className="grid gap-4 md:grid-cols-2">
                  {CATEGORY_OPTIONS.map((option) => {
                    const selected = form.category === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateField("category", option.id)}
                        className={`${optionCardClassName} ${
                          selected
                            ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)]"
                            : ""
                        }`}
                      >
                        <p className="text-[16px] font-bold text-[#0A1628]">
                          {option.title}
                        </p>
                        <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <SectionHeader
                  title="Set the Location"
                  subtitle="Tell guests where your space is based and how they will find it."
                />

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      Search location
                    </label>
                    <input
                      className={inputClassName}
                      value={form.locationName}
                      onChange={(event) =>
                        updateField("locationName", event.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Address
                      </label>
                      <input
                        className={inputClassName}
                        value={form.address}
                        onChange={(event) => updateField("address", event.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        City
                      </label>
                      <input
                        className={inputClassName}
                        value={form.city}
                        onChange={(event) => updateField("city", event.target.value)}
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
                      onChange={(event) => updateField("country", event.target.value)}
                    />
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
                    <div className="flex h-[240px] flex-col items-center justify-center bg-[#0A1628] text-center text-white">
                      <MapPin size={34} className="text-[#305CDE]" />
                      <p className="mt-4 text-[18px] font-bold">{form.locationName}</p>
                      <p className="mt-2 max-w-sm text-[13px] leading-6 text-white/70">
                        Map preview placeholder for the location pin and nearby transport.
                      </p>
                    </div>
                  </div>
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

                  <div className="grid gap-5 md:grid-cols-2">
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

                    <div>
                      <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                        Minimum notice
                      </label>
                      <select
                        className={inputClassName}
                        value={form.minNotice}
                        onChange={(event) => updateField("minNotice", event.target.value)}
                      >
                        <option>24 hours</option>
                        <option>48 hours</option>
                        <option>72 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <SectionHeader
                  title="Upload Photos"
                  subtitle="Use polished imagery to build trust and help guests picture the experience before they book."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {PHOTO_LIBRARY.map((photo) => {
                    const selected = form.photos.includes(photo);
                    return (
                      <button
                        key={photo}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            photos: selected
                              ? current.photos.filter((item) => item !== photo)
                              : [...current.photos, photo],
                          }))
                        }
                        className={`overflow-hidden rounded-xl border-[1.5px] transition hover:border-[#305CDE] ${
                          selected
                            ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)]"
                            : "border-[#E5E7EB]"
                        }`}
                      >
                        <img
                          src={photo}
                          alt="Space"
                          className="h-44 w-full object-cover"
                        />
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-[14px] font-medium text-[#111827]">
                            Hero photo option
                          </span>
                          {selected ? (
                            <CheckCircle2 size={18} className="text-[#0A1628]" />
                          ) : (
                            <ImageIcon size={18} className="text-[#6B7280]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <SectionHeader
                  title="Set Your Pricing"
                  subtitle="Add flexible pricing tiers so guests can book by the hour, day, or month."
                />

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "Hourly Rate",
                      key: "pricingHour",
                      value: form.pricingHour,
                    },
                    {
                      label: "Daily Rate",
                      key: "pricingDay",
                      value: form.pricingDay,
                    },
                    {
                      label: "Monthly Rate",
                      key: "pricingMonth",
                      value: form.pricingMonth,
                    },
                  ].map((field) => (
                    <div key={field.key} className={`${optionCardClassName} p-5`}>
                      <p className="text-[13px] font-bold text-[#0A1628]">
                        {field.label}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] border-[1.5px] border-[#E5E7EB] text-[#0A1628]">
                          <PoundSterling size={18} />
                        </div>
                        <input
                          type="number"
                          className={inputClassName}
                          value={field.value}
                          onChange={(event) =>
                            updateField(field.key, event.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <SectionHeader
                  title="Availability & House Rules"
                  subtitle="Define when your listing can be booked and share the key rules guests should know before checkout."
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

                  <div>
                    <label className="mb-2 block text-[13px] font-bold text-[#0A1628]">
                      House rules
                    </label>
                    <textarea
                      rows={5}
                      className={textareaClassName}
                      value={form.houseRules}
                      onChange={(event) => updateField("houseRules", event.target.value)}
                    />
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
                      src={form.photos[0] || PHOTO_LIBRARY[0]}
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
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        label: "Hourly",
                        value: formatCurrency(form.pricingHour),
                      },
                      {
                        label: "Daily",
                        value: formatCurrency(form.pricingDay),
                      },
                      {
                        label: "Monthly",
                        value: formatCurrency(form.pricingMonth),
                      },
                    ].map((item) => (
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
              <button
                type="button"
                disabled={isPublishing}
                onClick={publishListing}
                className="inline-flex min-h-[44px] w-full flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7] disabled:opacity-70 sm:w-auto sm:flex-none"
              >
                {isPublishing ? (
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
