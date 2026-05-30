import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CalendarOff,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  PoundSterling,
  RefreshCw,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

const MOCK_LISTING = {
  id: 1,
  title: "The Shard Executive Suite",
  location: "London Bridge, London",
  category: "Office Space",
  image:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&q=80",
  defaultCheckIn: "09:00",
  defaultCheckOut: "18:00",
  minNotice: 24,
  maxAdvanceBooking: 365,
  instantBook: true,
};

const MOCK_BOOKINGS = [
  {
    id: 1,
    startDate: "2026-05-19",
    endDate: "2026-05-19",
    startTime: "09:00",
    endTime: "13:00",
    guest: "Sarah Mitchell",
    status: "confirmed",
    price: 340,
    ref: "VC-2026-001",
  },
  {
    id: 2,
    startDate: "2026-05-23",
    endDate: "2026-05-23",
    startTime: "09:00",
    endTime: "18:00",
    guest: "Ahmed Khalid",
    status: "confirmed",
    price: 580,
    ref: "VC-2026-002",
  },
  {
    id: 3,
    startDate: "2026-05-27",
    endDate: "2026-05-27",
    startTime: "14:00",
    endTime: "17:00",
    guest: "Priya Sharma",
    status: "pending",
    price: 255,
    ref: "VC-2026-003",
  },
  {
    id: 4,
    startDate: "2026-06-02",
    endDate: "2026-06-04",
    startTime: "09:00",
    endTime: "18:00",
    guest: "TechCorp Ltd",
    status: "confirmed",
    price: 1740,
    ref: "VC-2026-004",
  },
  {
    id: 5,
    startDate: "2026-06-10",
    endDate: "2026-06-10",
    startTime: "10:00",
    endTime: "16:00",
    guest: "James Okafor",
    status: "confirmed",
    price: 510,
    ref: "VC-2026-005",
  },
];

const MOCK_BLOCKED = [
  { id: 1, startDate: "2026-05-30", endDate: "2026-05-31", reason: "Personal use" },
  { id: 2, startDate: "2026-06-15", endDate: "2026-06-18", reason: "Renovation work" },
];

const MOCK_CONNECTED_CALENDARS = [
  {
    id: 1,
    provider: "Google Calendar",
    email: "james@thorntonproperties.co.uk",
    status: "connected",
    lastSynced: "2 minutes ago",
    color: "#4285F4",
  },
];

const QUICK_REASONS = ["Personal use", "Maintenance", "Renovation", "Other"];
const BUFFER_OPTIONS = [
  { label: "None", value: 0 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "4 hours", value: 240 },
  { label: "Custom", value: "custom" },
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEK_HOURS = Array.from({ length: 12 }, (_, index) => 9 + index);
const ADD_CALENDAR_OPTIONS = [
  { id: "google", label: "Google", provider: "Google Calendar", color: "#4285F4" },
  { id: "outlook", label: "Outlook", provider: "Microsoft Outlook", color: "#0078D4" },
  { id: "apple", label: "Apple", provider: "Apple iCal / CalDAV", color: "#555555" },
  { id: "calendly", label: "Calendly", provider: "Calendly", color: "#006BFF" },
  { id: "calcom", label: "Cal.com", provider: "Cal.com", color: "#111827" },
];

// Get all days in a month as Date objects
function getDaysInMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let index = 0; index < firstDay; index += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) days.push(new Date(year, month, day));
  return days;
}

// Check if a date string (YYYY-MM-DD) falls on a given Date
function dateMatchesString(date, str) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return localDate.toISOString().slice(0, 10) === str;
}

// Get events for a specific day
function getEventsForDay(date, bookings, blocked) {
  const dateStr = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
  const dayBookings = bookings.filter(
    (booking) => booking.startDate <= dateStr && booking.endDate >= dateStr
  );
  const dayBlocked = blocked.filter(
    (block) => block.startDate <= dateStr && block.endDate >= dateStr
  );
  return { bookings: dayBookings, blocked: dayBlocked };
}

// Format time: "09:00" → "9:00am"
function formatTime(timeStr) {
  const [hourValue, minuteValue] = timeStr.split(":").map(Number);
  const ampm = hourValue >= 12 ? "pm" : "am";
  const hour = hourValue % 12 || 12;
  return `${hour}:${minuteValue.toString().padStart(2, "0")}${ampm}`;
}

// Format date: Date → "Mon 19 May 2026"
function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Get week days for week view
function getWeekDays(date) {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return next;
  });
}

function toDateKey(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .slice(0, 10);
}

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getEventSpan(event, dayDate) {
  const dayStr = toDateKey(dayDate);
  if (event.startDate > dayStr || event.endDate < dayStr) return null;
  if (event.startDate === event.endDate) return "single";
  if (event.startDate === dayStr) return "start";
  if (event.endDate === dayStr) return "end";
  return "middle";
}

function formatCurrency(value) {
  return `£${new Intl.NumberFormat("en-GB").format(value)}`;
}

function getDurationHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour + endMinute / 60 - (startHour + startMinute / 60);
}

function getDurationDays(startDate, endDate) {
  return (
    Math.round((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / 86400000) + 1
  );
}

function formatRangeLabel(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const startLabel = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endLabel = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return startDate === endDate ? endLabel : `${startLabel} - ${endLabel}`;
}

function formatCompactBookingLabel(booking) {
  return `${booking.guest.split(" ").slice(0, 2).join(" ")} · ${formatTime(
    booking.startTime
  ).replace(":00", "")}-${formatTime(booking.endTime).replace(":00", "")}`;
}

function getBufferDays(bookings, bufferBefore, bufferAfter) {
  const result = {};

  bookings.forEach((booking) => {
    if (bufferBefore > 0) {
      const dayBefore = addDays(parseDate(booking.startDate), -1);
      const key = toDateKey(dayBefore);
      if (!result[key]) result[key] = [];
      result[key].push({ id: `before-${booking.id}` });
    }

    if (bufferAfter > 0) {
      const dayAfter = addDays(parseDate(booking.endDate), 1);
      const key = toDateKey(dayAfter);
      if (!result[key]) result[key] = [];
      result[key].push({ id: `after-${booking.id}` });
    }
  });

  return result;
}

function formatBufferValue(minutes) {
  if (!minutes) return "No buffer";
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${minutes} minutes`;
}

function getProviderInitial(provider) {
  if (provider === "Google Calendar") return "G";
  if (provider === "Microsoft Outlook") return "O";
  if (provider === "Apple iCal / CalDAV") return "A";
  if (provider === "Calendly") return "C";
  if (provider === "Cal.com") return "cal";
  return "iCal";
}

function ToggleSwitch({ enabled, onChange, size = "md" }) {
  const width = size === "sm" ? 36 : 44;
  const height = size === "sm" ? 20 : 24;
  const circleSize = size === "sm" ? 16 : 20;
  const translateX = size === "sm" ? 16 : 20;

  return (
    <motion.div
      onClick={() => onChange(!enabled)}
      style={{
        width,
        height,
        borderRadius: height / 2,
        background: enabled ? "#0A1628" : "#E5E7EB",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: "2px",
        flexShrink: 0,
      }}
      animate={{ background: enabled ? "#0A1628" : "#E5E7EB" }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
        animate={{ x: enabled ? translateX : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "confirmed"
      ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
      : "border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.1)] text-[#D97706]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold ${styles}`}>
      {status === "confirmed" ? "Confirmed" : "Pending"}
    </span>
  );
}

function BufferOptionsRow({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUFFER_OPTIONS.filter((option) => option.value !== "custom").map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl border px-3 py-2 text-[12px] transition ${
            value === option.value
              ? "border-[#0A1628] bg-[rgba(10,22,40,0.03)] font-semibold text-[#0A1628]"
              : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#305CDE]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function PropertyAvailability() {
  const navigate = useNavigate();
  const { listingId } = useParams();

  const today = new Date(2026, 4, 18);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calView, setCalView] = useState("month");
  const [direction, setDirection] = useState(1);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [blockedDates, setBlockedDates] = useState(MOCK_BLOCKED);
  const [sidebarPanel, setSidebarPanel] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectStart, setSelectStart] = useState(null);
  const [selectEnd, setSelectEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [bufferExpanded, setBufferExpanded] = useState(false);
  const [bufferBefore, setBufferBefore] = useState(60);
  const [bufferAfter, setBufferAfter] = useState(60);
  const [connectedCalendars, setConnectedCalendars] = useState(MOCK_CONNECTED_CALENDARS);
  const [connectingCalendar, setConnectingCalendar] = useState(null);
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const [instantBook, setInstantBook] = useState(MOCK_LISTING.instantBook);
  const [weekendAvailable, setWeekendAvailable] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncingCalendarId, setSyncingCalendarId] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState(MOCK_LISTING.defaultCheckIn);
  const [blockEndTime, setBlockEndTime] = useState(MOCK_LISTING.defaultCheckOut);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [openCalendarMenu, setOpenCalendarMenu] = useState(null);
  const [icalUrl, setIcalUrl] = useState("");
  const [showIcalInput, setShowIcalInput] = useState(false);
  const [seasonalTooltip, setSeasonalTooltip] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Settings
  const [minNotice, setMinNotice] = useState("24 hours");
  const [maxAdvance, setMaxAdvance] = useState("1 year");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [sameDayCutoff, setSameDayCutoff] = useState("No cutoff");

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const variants = {
    enter: (dir) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir * -60, opacity: 0 }),
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectStart(null);
        setSelectEnd(null);
        setHoverDate(null);
        if (sidebarPanel === "new-block") setSidebarPanel(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarPanel]);

  useEffect(() => {
    if (!seasonalTooltip) return undefined;
    const timeout = setTimeout(() => setSeasonalTooltip(""), 2200);
    return () => clearTimeout(timeout);
  }, [seasonalTooltip]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateMobile = () => {
      setIsMobile(media.matches);
      if (media.matches) setCalView("month");
    };
    updateMobile();
    media.addEventListener("change", updateMobile);
    return () => media.removeEventListener("change", updateMobile);
  }, []);

  const visibleDate = useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
  const monthKey = `${viewYear}-${viewMonth}`;
  const monthDays = useMemo(() => getDaysInMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = useMemo(
    () => getWeekDays(new Date(viewYear, viewMonth, today.getDate())),
    [viewYear, viewMonth, today]
  );
  const bufferDays = useMemo(
    () => getBufferDays(bookings, bufferBefore, bufferAfter),
    [bookings, bufferBefore, bufferAfter]
  );

  const monthLabel = visibleDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const stats = useMemo(
    () => ({
      bookings: "5",
      revenue: "£2,425",
      occupancy: "72%",
      rating: "4.92",
    }),
    []
  );

  const selectedRange = useMemo(() => {
    if (!selectStart) return null;
    const endDate = selectEnd || hoverDate || selectStart;
    const start = parseDate(toDateKey(selectStart));
    const end = parseDate(toDateKey(endDate));
    return start <= end ? { start, end } : { start: end, end: start };
  }, [hoverDate, selectEnd, selectStart]);

  const currentWeek = getWeekDays(today);
  const isViewingCurrentWeek =
    calView === "week" && weekDays.every((day, index) => toDateKey(day) === toDateKey(currentWeek[index]));

  const currentTimePosition = useMemo(() => {
    if (!isViewingCurrentWeek) return null;
    const now = today;
    const hourPosition = now.getHours() + now.getMinutes() / 60;
    if (hourPosition < 9 || hourPosition > 21) return null;
    return (hourPosition - 9) * 64;
  }, [isViewingCurrentWeek, today]);

  const changeMonth = (amount) => {
    setDirection(amount > 0 ? 1 : -1);
    const next = new Date(viewYear, viewMonth + amount, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goToToday = () => {
    setDirection(1);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const isPastDate = (date) => toDateKey(date) < toDateKey(today);

  const isSelectableDay = (date) => {
    const dateKey = toDateKey(date);
    const dayEvents = getEventsForDay(date, bookings, blockedDates);
    return (
      !isPastDate(date) &&
      date.getMonth() === viewMonth &&
      !dayEvents.bookings.length &&
      !dayEvents.blocked.length &&
      !bufferDays[dateKey]
    );
  };

  const openBookingDetail = (booking) => {
    setSelectedEvent(booking);
    setSidebarPanel("booking-detail");
  };

  const openBlockedEditor = (blocked) => {
    setSelectedEvent({ ...blocked, draftReason: blocked.reason || "" });
    setShowRemoveConfirm(false);
    setSidebarPanel("block-editor");
  };

  const clearContextPanel = () => {
    setSidebarPanel(null);
    setSelectedEvent(null);
    setShowRemoveConfirm(false);
  };

  const handleDayClick = (date) => {
    if (!isSelectableDay(date)) return;

    if (!selectStart || selectEnd) {
      setSelectStart(date);
      setSelectEnd(null);
      setHoverDate(null);
      setSidebarPanel(null);
      return;
    }

    setSelectEnd(date);
    setSidebarPanel("new-block");
    setBlockReason("");
    setBlockAllDay(true);
    setBlockStartTime(openTime);
    setBlockEndTime(closeTime);
  };

  const handleBlockDates = () => {
    if (!selectedRange) return;

    const newBlock = {
      id: Date.now(),
      startDate: toDateKey(selectedRange.start),
      endDate: toDateKey(selectedRange.end),
      reason: blockReason || "Blocked",
      startTime: blockAllDay ? null : blockStartTime,
      endTime: blockAllDay ? null : blockEndTime,
    };

    setBlockedDates((current) => [...current, newBlock]);
    setSelectStart(null);
    setSelectEnd(null);
    setHoverDate(null);
    setSidebarPanel(null);
    showToast("Dates blocked successfully");
  };

  const handleUpdateBlock = () => {
    setBlockedDates((current) =>
      current.map((block) =>
        block.id === selectedEvent.id
          ? { ...block, reason: selectedEvent.draftReason || "Blocked" }
          : block
      )
    );
    clearContextPanel();
    showToast("Blocked period updated");
  };

  const handleRemoveBlock = () => {
    setBlockedDates((current) => current.filter((block) => block.id !== selectedEvent.id));
    clearContextPanel();
    showToast("Blocked period removed");
  };

  const handleQuickBlock = () => {
    setSelectStart(today);
    setSelectEnd(addDays(today, 6));
    setSidebarPanel("new-block");
    setBlockReason("");
    setBlockAllDay(true);
  };

  const handleSaveAvailabilitySettings = () => {
    showToast("Availability settings saved");
  };

  const handleConnectCalendar = (provider) => {
    setConnectingCalendar(provider.id);
    setTimeout(() => {
      setConnectedCalendars((current) => [
        ...current,
        {
          id: Date.now(),
          provider: provider.provider,
          email:
            provider.id === "apple"
              ? "calendar@icloud.example"
              : `james+${provider.id}@thorntonproperties.co.uk`,
          status: "connected",
          lastSynced: "just now",
          color: provider.color,
        },
      ]);
      setConnectingCalendar(null);
      setShowAddCalendar(false);
      setShowIcalInput(false);
      setIcalUrl("");
      showToast(`${provider.provider} connected`);
    }, 2000);
  };

  const handleConnectIcal = () => {
    if (!icalUrl) return;
    setConnectingCalendar("ical");
    setTimeout(() => {
      setConnectedCalendars((current) => [
        ...current,
        {
          id: Date.now(),
          provider: "iCal Feed",
          email: icalUrl.replace(/^https?:\/\//, ""),
          status: "connected",
          lastSynced: "just now",
          color: "#6B7280",
        },
      ]);
      setConnectingCalendar(null);
      setShowAddCalendar(false);
      setShowIcalInput(false);
      setIcalUrl("");
      showToast("iCal calendar connected");
    }, 2000);
  };

  const handleSyncCalendar = (calendarId) => {
    setSyncing(true);
    setSyncingCalendarId(calendarId);
    setTimeout(() => {
      setConnectedCalendars((current) =>
        current.map((calendar) =>
          calendar.id === calendarId ? { ...calendar, lastSynced: "just now" } : calendar
        )
      );
      setSyncing(false);
      setSyncingCalendarId(null);
      showToast("Calendar synced");
    }, 1500);
  };

  const handleDisconnectCalendar = (calendarId) => {
    setConnectedCalendars((current) => current.filter((calendar) => calendar.id !== calendarId));
    setOpenCalendarMenu(null);
    showToast("Calendar disconnected");
  };

  const handleApproveBooking = () => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === selectedEvent.id ? { ...booking, status: "confirmed" } : booking
      )
    );
    setSelectedEvent((current) => ({ ...current, status: "confirmed" }));
    showToast("Booking approved");
  };

  const handleDeclineBooking = () => {
    setBookings((current) => current.filter((booking) => booking.id !== selectedEvent.id));
    clearContextPanel();
    showToast("Booking declined");
  };

  const monthGridDays = useMemo(() => {
    const totalCells = [...monthDays];
    while (totalCells.length % 7 !== 0) totalCells.push(null);
    return totalCells;
  }, [monthDays]);

  return (
    <DashboardLayout title="Availability & Calendar">
      <div className="mb-6 flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4 lg:flex-row lg:items-center">
        <img
          src={MOCK_LISTING.image}
          alt={MOCK_LISTING.title}
          className="h-14 w-14 rounded-[10px] object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#0A1628]">{MOCK_LISTING.title}</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] px-3 py-1 text-[12px] font-semibold text-[#16A34A]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              Live
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#6B7280]">{MOCK_LISTING.location}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[13px]">
          <button
            type="button"
            onClick={() => navigate("/host/listings")}
            className="inline-flex items-center gap-1.5 text-[#6B7280] transition hover:text-[#111827]"
          >
            <ChevronLeft size={14} />
            Back to Listings
          </button>
          <button
            type="button"
            onClick={() =>
              window.open(`/property/${listingId || MOCK_LISTING.id}`, "_blank", "noopener,noreferrer")
            }
            className="inline-flex items-center gap-1.5 text-[#305CDE] transition hover:underline"
          >
            View Public Listing
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-[1.5] rounded-[20px] border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-[20px] font-extrabold text-[#0A1628]">{monthLabel}</h3>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {["month", ...(isMobile ? [] : ["week"])].map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setCalView(view)}
                    className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition ${
                      calView === view
                        ? "bg-[#0A1628] text-white"
                        : "border border-[#E5E7EB] bg-white text-[#111827]"
                    }`}
                  >
                    {view === "month" ? "Month" : "Week"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#111827] transition hover:bg-[#F8F6F0]"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#111827] transition hover:bg-[#F8F6F0]"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-[13px] text-[#111827] transition hover:bg-[#F8F6F0]"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            {[
              { label: "Available", color: "#16A34A" },
              { label: "Booked", color: "#EF4444" },
              { label: "Pending", color: "#D97706" },
              { label: "Blocked", color: "#6B7280" },
              { label: "Buffer Time", color: "#F59E0B" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[12px] text-[#374151]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {calView === "month" ? (
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#E5E7EB]">
              <div className="grid grid-cols-7 gap-px bg-[#E5E7EB]">
                {DAY_HEADERS.map((label) => (
                  <div
                    key={label}
                    className="bg-[#F8F6F0] px-1 py-2 text-center text-[12px] font-bold uppercase tracking-[0.04em] text-[#6B7280]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={monthKey}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22 }}
                  className="grid grid-cols-7 gap-px bg-[#E5E7EB]"
                >
                  {monthGridDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${monthKey}-${index}`} className="min-h-[80px] bg-[#FAFAFA] md:min-h-[100px]" />;
                    }

                    const dayKey = toDateKey(date);
                    const { bookings: dayBookings, blocked: dayBlocked } = getEventsForDay(
                      date,
                      bookings,
                      blockedDates
                    );
                    const dayBuffer = bufferDays[dayKey] || [];
                    const todayCell = dateMatchesString(date, toDateKey(today));
                    const pastDate = isPastDate(date);
                    const selectable = isSelectableDay(date);
                    const inSelectedRange =
                      selectedRange &&
                      toDateKey(date) >= toDateKey(selectedRange.start) &&
                      toDateKey(date) <= toDateKey(selectedRange.end);

                    return (
                      <motion.div
                        key={dayKey}
                        whileHover={
                          selectable ? { backgroundColor: "rgba(48,92,222,0.05)" } : undefined
                        }
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => {
                          if (selectStart && !selectEnd) setHoverDate(date);
                        }}
                        className={`min-h-[80px] min-w-0 bg-white p-1 md:min-h-[100px] md:p-1.5 transition ${
                          pastDate ? "bg-[#FAFAFA]" : ""
                        } ${inSelectedRange ? "bg-[rgba(48,92,222,0.1)]" : ""} ${
                          selectable ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <span
                          className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] font-semibold ${
                            todayCell
                              ? "bg-[#0A1628] text-white"
                              : pastDate
                              ? "text-[#D1D5DB]"
                              : "text-[#111827]"
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        <div className="mt-1 space-y-1">
                          {dayBookings.map((booking) => {
                            const span = getEventSpan(booking, date);
                            const showLabel = span === "single" || span === "start";
                            const isPending = booking.status === "pending";

                            return (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                key={`${booking.id}-${dayKey}`}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openBookingDetail(booking);
                                }}
                                whileTap={{ scale: 0.97 }}
                                className={`block w-full overflow-hidden text-ellipsis whitespace-nowrap border-l-[3px] px-1 py-0.5 text-left text-[10px] font-medium md:px-1.5 md:text-[11px] ${
                                  isPending
                                    ? "border-[#D97706] bg-[rgba(217,119,6,0.1)] text-[#D97706]"
                                    : "border-[#EF4444] bg-[rgba(239,68,68,0.1)] text-[#DC2626]"
                                } ${
                                  span === "single" || span === "start" ? "rounded-l-[4px]" : ""
                                } ${
                                  span === "single" || span === "end" ? "rounded-r-[4px]" : ""
                                }`}
                              >
                                {showLabel ? formatCompactBookingLabel(booking) : "\u00A0"}
                              </motion.button>
                            );
                          })}

                          {dayBlocked.map((blocked) => {
                            const span = getEventSpan(blocked, date);
                            const showLabel = span === "single" || span === "start";

                            return (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                key={`${blocked.id}-${dayKey}`}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openBlockedEditor(blocked);
                                }}
                                whileTap={{ scale: 0.97 }}
                                className={`block w-full overflow-hidden text-ellipsis whitespace-nowrap border-l-[3px] border-[#6B7280] bg-[rgba(107,114,128,0.1)] px-1 py-0.5 text-left text-[10px] font-medium text-[#6B7280] md:px-1.5 md:text-[11px] ${
                                  span === "single" || span === "start" ? "rounded-l-[4px]" : ""
                                } ${
                                  span === "single" || span === "end" ? "rounded-r-[4px]" : ""
                                }`}
                              >
                                {showLabel ? `Blocked · ${blocked.reason}` : "\u00A0"}
                              </motion.button>
                            );
                          })}

                          {dayBuffer.map((entry) => (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              key={entry.id}
                              className="rounded-[4px] border-l-[3px] border-[#F59E0B] bg-[rgba(245,158,11,0.1)] px-1 py-0.5 text-[10px] font-medium text-[#D97706] md:px-1.5 md:text-[11px]"
                            >
                              Buffer time
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[50px_repeat(7,minmax(110px,1fr))] border-b border-[#E5E7EB]">
                  <div />
                  {weekDays.map((day) => (
                    <div
                      key={toDateKey(day)}
                      className="px-2 pb-3 text-center text-[13px] font-semibold text-[#0A1628]"
                    >
                      {day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                    </div>
                  ))}
                </div>

                <div className="relative grid grid-cols-[50px_repeat(7,minmax(110px,1fr))]">
                  <div className="relative">
                    {WEEK_HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="flex h-16 items-start justify-end border-b border-[#F3F4F6] pr-2 pt-1 text-[11px] text-[#6B7280]"
                      >
                        {`${hour}`.padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {weekDays.map((day) => {
                    const dayKey = toDateKey(day);
                    const dayEvents = [
                      ...bookings.filter(
                        (booking) => booking.startDate <= dayKey && booking.endDate >= dayKey
                      ),
                      ...blockedDates
                        .filter((block) => block.startDate <= dayKey && block.endDate >= dayKey)
                        .map((block) => ({
                          ...block,
                          startTime: block.startTime || openTime,
                          endTime: block.endTime || closeTime,
                          blocked: true,
                        })),
                    ];

                    return (
                      <div key={dayKey} className="relative border-l border-[#F3F4F6]">
                        {WEEK_HOURS.map((hour) => (
                          <div key={`${dayKey}-${hour}`} className="h-16 border-b border-[#F3F4F6]" />
                        ))}

                        {dayEvents.map((event) => {
                          const [startHour, startMinute] = event.startTime.split(":").map(Number);
                          const top = (startHour + startMinute / 60 - 9) * 64;
                          const height = Math.max(
                            getDurationHours(event.startTime, event.endTime) * 64,
                            32
                          );
                          const pending = event.status === "pending";

                          return (
                            <motion.button
                              key={`${event.id}-${dayKey}`}
                              initial={{ scaleY: 0, originY: 0 }}
                              animate={{ scaleY: 1 }}
                              type="button"
                              onClick={() =>
                                event.blocked ? openBlockedEditor(event) : openBookingDetail(event)
                              }
                              className={`absolute left-1 right-1 overflow-hidden rounded-r-md border-l-[3px] px-2 py-1 text-left text-[12px] font-medium ${
                                event.blocked
                                  ? "border-[#6B7280] bg-[rgba(107,114,128,0.15)] text-[#6B7280]"
                                  : pending
                                  ? "border-[#D97706] bg-[rgba(217,119,6,0.15)] text-[#D97706]"
                                  : "border-[#EF4444] bg-[rgba(239,68,68,0.15)] text-[#DC2626]"
                              }`}
                              style={{ top, height }}
                            >
                              <p className="truncate">{event.blocked ? event.reason : event.guest}</p>
                              <p className="mt-1 truncate text-[11px] opacity-80">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </p>
                            </motion.button>
                          );
                        })}

                        {currentTimePosition !== null && dateMatchesString(day, toDateKey(today)) ? (
                          <div className="absolute left-0 right-0 z-10" style={{ top: currentTimePosition }}>
                            <div className="absolute -left-1.5 top-[-4px] h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                            <div className="h-[2px] bg-[#EF4444]" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 xl:max-w-[420px]">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-[14px] font-bold text-[#0A1628]">This Month</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: CalendarDays, value: stats.bookings, label: "Bookings" },
                { icon: PoundSterling, value: stats.revenue, label: "Revenue" },
                { icon: Clock, value: stats.occupancy, label: "Occupancy" },
                { icon: Star, value: stats.rating, label: "Avg Rating" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[10px] bg-[#F8F6F0] px-3 py-3 text-center">
                    <Icon size={16} className="mx-auto text-[#305CDE]" />
                    <p className="mt-2 text-[20px] font-extrabold text-[#0A1628]">{item.value}</p>
                    <p className="text-[11px] text-[#6B7280]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {sidebarPanel ? (
              <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={clearContextPanel}
                className="fixed inset-0 z-40 bg-black/30 xl:hidden"
                aria-label="Close context panel"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-[20px] bg-[#F8F6F0] p-4 xl:static xl:max-h-none xl:overflow-visible xl:rounded-none xl:bg-transparent xl:p-0"
              >
                {sidebarPanel === "booking-detail" && selectedEvent ? (
                  <div className="rounded-2xl border-[1.5px] border-[#EF4444] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-[#0A1628]">Booking Details</h3>
                      <button
                        type="button"
                        onClick={clearContextPanel}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280]"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mt-4">
                      <StatusBadge status={selectedEvent.status} />
                      <p className="mt-3 text-[16px] font-bold text-[#0A1628]">{selectedEvent.guest}</p>
                      <p className="mt-1 text-[12px] text-[#6B7280]">{selectedEvent.ref}</p>
                    </div>

                    <div className="my-4 border-t border-[#F3F4F6]" />

                    <div className="space-y-1">
                      {[
                        {
                          icon: CalendarDays,
                          label: "Date",
                          value: formatDate(parseDate(selectedEvent.startDate)),
                        },
                        {
                          icon: Clock,
                          label: "Time",
                          value: `${formatTime(selectedEvent.startTime)} - ${formatTime(
                            selectedEvent.endTime
                          )} (${getDurationHours(selectedEvent.startTime, selectedEvent.endTime)} hours)`,
                        },
                        {
                          icon: PoundSterling,
                          label: "Revenue",
                          value: `${formatCurrency(selectedEvent.price)} (after 10% commission: ${formatCurrency(
                            Math.round(selectedEvent.price * 0.9)
                          )})`,
                        },
                        {
                          icon: MessageSquare,
                          label: "Messages",
                          value: "2 unread from guest",
                        },
                      ].map((row) => {
                        const Icon = row.icon;
                        return (
                          <div key={row.label} className="flex items-center gap-3 border-b border-[#F3F4F6] py-2">
                            <Icon size={16} className="text-[#305CDE]" />
                            <p className="min-w-[80px] text-[12px] text-[#6B7280]">{row.label}</p>
                            <p className="text-[13px] font-medium text-[#111827]">{row.value}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827] transition hover:border-[#0A1628]"
                      >
                        <MessageSquare size={16} />
                        Message Guest
                      </button>
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0A1628] px-4 py-3 text-[14px] font-semibold text-white"
                      >
                        <ExternalLink size={16} />
                        View Full Booking
                      </button>
                      {selectedEvent.status === "pending" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleApproveBooking}
                            className="rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={handleDeclineBooking}
                            className="rounded-[10px] border border-[#DC2626] px-4 py-3 text-[14px] font-semibold text-[#DC2626]"
                          >
                            Decline
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {sidebarPanel === "block-editor" && selectedEvent ? (
                  <div className="rounded-2xl border-[1.5px] border-[#6B7280] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-[#0A1628]">Blocked Period</h3>
                      <button
                        type="button"
                        onClick={clearContextPanel}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280]"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <p className="mt-4 text-[16px] font-semibold text-[#111827]">
                      {formatRangeLabel(selectedEvent.startDate, selectedEvent.endDate)}
                    </p>
                    <p className="mt-1 text-[13px] text-[#6B7280]">
                      {getDurationDays(selectedEvent.startDate, selectedEvent.endDate)} days
                    </p>

                    <div className="mt-4">
                      <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
                        Reason (optional)
                      </label>
                      <input
                        value={selectedEvent.draftReason || ""}
                        onChange={(event) =>
                          setSelectedEvent((current) => ({
                            ...current,
                            draftReason: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {QUICK_REASONS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() =>
                              setSelectedEvent((current) => ({ ...current, draftReason: reason }))
                            }
                            className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#374151] transition hover:border-[#305CDE]"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={handleUpdateBlock}
                        className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white"
                      >
                        Update
                      </button>

                      {showRemoveConfirm ? (
                        <div className="rounded-xl bg-[#F8F6F0] px-4 py-3 text-center">
                          <p className="text-[13px] text-[#111827]">Remove this blocked period?</p>
                          <div className="mt-2 flex items-center justify-center gap-4">
                            <button
                              type="button"
                              onClick={handleRemoveBlock}
                              className="text-[13px] font-semibold text-[#DC2626] hover:underline"
                            >
                              Yes, remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRemoveConfirm(false)}
                              className="text-[13px] text-[#6B7280] hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRemoveConfirm(true)}
                          className="inline-flex w-full items-center justify-center gap-2 text-[14px] text-[#DC2626]"
                        >
                          <Trash2 size={16} />
                          Remove Block
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}

                {sidebarPanel === "new-block" && selectedRange ? (
                  <div className="rounded-2xl border-[1.5px] border-[#305CDE] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-bold text-[#0A1628]">Block Dates</h3>
                      <button
                        type="button"
                        onClick={clearContextPanel}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280]"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[16px] font-semibold text-[#111827]">
                          {formatRangeLabel(toDateKey(selectedRange.start), toDateKey(selectedRange.end))}
                        </p>
                        <p className="mt-1 text-[13px] text-[#6B7280]">
                          {getDurationDays(toDateKey(selectedRange.start), toDateKey(selectedRange.end))} days blocked
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSidebarPanel(null);
                          setSelectStart(null);
                          setSelectEnd(null);
                        }}
                        className="text-[13px] text-[#305CDE] transition hover:underline"
                      >
                        Edit dates
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
                        Reason (optional)
                      </label>
                      <input
                        value={blockReason}
                        onChange={(event) => setBlockReason(event.target.value)}
                        className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {QUICK_REASONS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => setBlockReason(reason)}
                            className="rounded-full border border-[#E5E7EB] px-3 py-1.5 text-[12px] text-[#374151] transition hover:border-[#305CDE]"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-[14px] font-medium text-[#111827]">All day</p>
                      <ToggleSwitch enabled={blockAllDay} onChange={setBlockAllDay} />
                    </div>

                    {!blockAllDay ? (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-2 block text-[12px] font-semibold text-[#6B7280]">
                            Start time
                          </label>
                          <input
                            type="time"
                            value={blockStartTime}
                            onChange={(event) => setBlockStartTime(event.target.value)}
                            className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[12px] font-semibold text-[#6B7280]">
                            End time
                          </label>
                          <input
                            type="time"
                            value={blockEndTime}
                            onChange={(event) => setBlockEndTime(event.target.value)}
                            className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 space-y-2">
                      <button
                        type="button"
                        onClick={handleBlockDates}
                        className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white"
                      >
                        Block These Dates
                      </button>
                      <button
                        type="button"
                        onClick={clearContextPanel}
                        className="w-full text-[14px] text-[#6B7280]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
              </>
            ) : null}
          </AnimatePresence>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#0A1628]">Buffer Time</h3>
              <button
                type="button"
                onClick={() => setBufferExpanded((current) => !current)}
                className="text-[13px] text-[#305CDE] hover:underline"
              >
                Edit
              </button>
            </div>

            <p className="mt-4 text-[13px] text-[#374151]">
              {formatBufferValue(bufferBefore)} before each booking
            </p>
            <p className="mt-1 text-[13px] text-[#374151]">
              {formatBufferValue(bufferAfter)} after each booking
            </p>
            <p className="mt-2 text-[12px] text-[#6B7280]">
              Buffer slots are shown in amber on the calendar
            </p>

            <motion.div
              initial={false}
              animate={{ height: bufferExpanded ? "auto" : 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-[#0A1628]">Before buffer</p>
                  <BufferOptionsRow value={bufferBefore} onChange={setBufferBefore} />
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-[#0A1628]">After buffer</p>
                  <BufferOptionsRow value={bufferAfter} onChange={setBufferAfter} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBufferExpanded(false);
                    showToast("Buffer settings saved");
                  }}
                  className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white"
                >
                  Save Buffer Settings
                </button>
              </div>
            </motion.div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#0A1628]">Connected Calendars</h3>
              <button
                type="button"
                onClick={() => setShowAddCalendar((current) => !current)}
                className="rounded-lg border border-[rgba(48,92,222,0.3)] px-3 py-1 text-[13px] text-[#305CDE] transition hover:bg-[rgba(48,92,222,0.08)]"
              >
                + Add
              </button>
            </div>

            {connectedCalendars.length === 0 ? (
              <div className="py-8 text-center">
                <LinkIcon size={24} className="mx-auto text-[#9CA3AF]" />
                <p className="mt-3 text-[13px] text-[#6B7280]">No calendars connected</p>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">
                  Connect a calendar to prevent double bookings
                </p>
              </div>
            ) : (
              <div className="mt-3">
                {connectedCalendars.map((calendar, index) => (
                  <div
                    key={calendar.id}
                    className={`flex items-start gap-3 py-3 ${
                      index < connectedCalendars.length - 1 ? "border-b border-[#F3F4F6]" : ""
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
                      style={{ backgroundColor: calendar.color }}
                    >
                      {getProviderInitial(calendar.provider)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#0A1628]">{calendar.provider}</p>
                      <p className="truncate text-[11px] text-[#6B7280]">{calendar.email}</p>
                      <p className="text-[11px] text-[#6B7280]">
                        Last synced: {calendar.lastSynced}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                        <CheckCircle size={12} />
                        Syncing
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSyncCalendar(calendar.id)}
                        className="text-[#6B7280]"
                      >
                        <motion.div
                          animate={
                            syncing && syncingCalendarId === calendar.id
                              ? { rotate: 360 }
                              : { rotate: 0 }
                          }
                          transition={{
                            duration: 1,
                            ease: "linear",
                            repeat: syncing && syncingCalendarId === calendar.id ? Infinity : 0,
                          }}
                        >
                          <RefreshCw size={14} />
                        </motion.div>
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCalendarMenu((current) =>
                              current === calendar.id ? null : calendar.id
                            )
                          }
                          className="text-[#6B7280]"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <AnimatePresence>
                          {openCalendarMenu === calendar.id ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -6 }}
                              className="absolute right-0 top-6 z-20 min-w-[120px] rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg"
                            >
                              <button
                                type="button"
                                onClick={() => handleDisconnectCalendar(calendar.id)}
                                className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-[#DC2626] transition hover:bg-[#F8F6F0]"
                              >
                                Disconnect
                              </button>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence initial={false}>
              {showAddCalendar ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-[#F3F4F6] pt-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {ADD_CALENDAR_OPTIONS.map((provider) => (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => handleConnectCalendar(provider)}
                          disabled={connectingCalendar === provider.id}
                          className="rounded-[10px] border border-[#E5E7EB] px-2 py-3 text-center transition hover:border-[#305CDE] disabled:opacity-70"
                        >
                          <div
                            className="mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                            style={{ backgroundColor: provider.color }}
                          >
                            {provider.label.slice(0, 1)}
                          </div>
                          <p className="mt-2 text-[12px] font-medium text-[#111827]">
                            {connectingCalendar === provider.id ? "Connecting..." : provider.label}
                          </p>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowIcalInput((current) => !current)}
                      className="mt-4 text-[13px] text-[#305CDE] hover:underline"
                    >
                      Connect via iCal URL
                    </button>

                    <AnimatePresence initial={false}>
                      {showIcalInput ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            <input
                              value={icalUrl}
                              onChange={(event) => setIcalUrl(event.target.value)}
                              placeholder="Paste your .ics calendar URL"
                              className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                            />
                            <button
                              type="button"
                              disabled={!icalUrl || connectingCalendar === "ical"}
                              onClick={handleConnectIcal}
                              className="rounded-[10px] bg-[#305CDE] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                            >
                              {connectingCalendar === "ical" ? "Connecting..." : "Connect iCal"}
                            </button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="text-[14px] font-bold text-[#0A1628]">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleQuickBlock}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#D97706]"
              >
                <CalendarOff size={16} />
                Block Next 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("seasonal pricing");
                  setSeasonalTooltip("Coming soon in Phase 2");
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827]"
              >
                <Tag size={16} />
                Set Seasonal Price
              </button>
              <button
                type="button"
                onClick={() => console.log("export ics")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827]"
              >
                <Download size={16} />
                Download Calendar (.ics)
              </button>
            </div>
            {seasonalTooltip ? (
              <p className="mt-3 text-[12px] text-[#6B7280]">{seasonalTooltip}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-[#E5E7EB] bg-white p-7">
        <h3 className="text-[18px] font-bold text-[#0A1628]">Availability Settings</h3>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <p className="text-[13px] font-semibold text-[#0A1628]">Minimum Notice Period</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
              How much notice do you need before a booking starts?
            </p>
            <select
              value={minNotice}
              onChange={(event) => setMinNotice(event.target.value)}
              className="mt-4 h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
            >
              {[
                "No minimum",
                "1 hour",
                "2 hours",
                "6 hours",
                "12 hours",
                "24 hours",
                "48 hours",
                "72 hours",
              ].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <p className="text-[13px] font-semibold text-[#0A1628]">Maximum Advance Booking</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
              How far in advance can guests book?
            </p>
            <select
              value={maxAdvance}
              onChange={(event) => setMaxAdvance(event.target.value)}
              className="mt-4 h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
            >
              {["1 month", "2 months", "3 months", "6 months", "1 year", "No limit"].map(
                (option) => (
                  <option key={option}>{option}</option>
                )
              )}
            </select>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <p className="text-[13px] font-semibold text-[#0A1628]">Default Hours</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
              Your standard opening hours for this space
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#6B7280]">Opens</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(event) => setOpenTime(event.target.value)}
                  className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#6B7280]">Closes</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(event) => setCloseTime(event.target.value)}
                  className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#0A1628]">Instant Book</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                  Allow guests to book without your approval
                </p>
              </div>
              <ToggleSwitch enabled={instantBook} onChange={setInstantBook} />
            </div>
            <p className={`mt-4 text-[12px] ${instantBook ? "text-[#16A34A]" : "text-[#D97706]"}`}>
              {instantBook
                ? "Guests can book immediately. You'll still be notified."
                : "You'll need to approve each booking request within 24 hours."}
            </p>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#0A1628]">Weekend Availability</p>
                <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
                  Is this space available on weekends?
                </p>
              </div>
              <ToggleSwitch enabled={weekendAvailable} onChange={setWeekendAvailable} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#FCFCFC] p-5">
            <p className="text-[13px] font-semibold text-[#0A1628]">Same-Day Cutoff Time</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
              Stop accepting same-day bookings after this time
            </p>
            <select
              value={sameDayCutoff}
              onChange={(event) => setSameDayCutoff(event.target.value)}
              className="mt-4 h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
            >
              {["No cutoff", "12:00 noon", "14:00", "16:00", "18:00"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAvailabilitySettings}
            className="rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7]"
          >
            Save Availability Settings
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0A1628",
              color: "white",
              borderRadius: 10,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 1000,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            <CheckCircle size={16} color="#16A34A" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
