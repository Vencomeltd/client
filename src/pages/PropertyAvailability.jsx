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
  MessageSquare,
  PoundSterling,
  RefreshCw,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

const REASON_OPTIONS = [
  { value: "personal", label: "Personal use" },
  { value: "maintenance", label: "Maintenance" },
];
const REASON_LABELS = {
  personal: "Personal use",
  maintenance: "Maintenance",
  external: "External calendar",
  booked: "Booked",
};
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

function combineDateAndTime(date, timeStr) {
  const [hour, minute] = (timeStr || "00:00").split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hour || 0, minute || 0, 0, 0);
  return combined;
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
  return `£${new Intl.NumberFormat("en-GB").format(Math.round(value || 0))}`;
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
  const token = localStorage.getItem("vencome_token");
  const apiBase = import.meta.env.VITE_API_URL;

  const today = useMemo(() => new Date(), []);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [property, setProperty] = useState(null);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calView, setCalView] = useState("month");
  const [direction, setDirection] = useState(1);

  const [rawBookings, setRawBookings] = useState([]);
  const [rawBlockedDates, setRawBlockedDates] = useState([]);
  const [savingBlocks, setSavingBlocks] = useState(false);

  const [sidebarPanel, setSidebarPanel] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectStart, setSelectStart] = useState(null);
  const [selectEnd, setSelectEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const [bufferExpanded, setBufferExpanded] = useState(false);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [savingBuffer, setSavingBuffer] = useState(false);

  const [instantBook, setInstantBook] = useState(false);
  const [weekendAvailable, setWeekendAvailable] = useState(true);
  const [minNotice, setMinNotice] = useState("No minimum");
  const [maxAdvance, setMaxAdvance] = useState("No limit");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [sameDayCutoff, setSameDayCutoff] = useState("No cutoff");
  const [savingSettings, setSavingSettings] = useState(false);

  const [calendarUrl, setCalendarUrl] = useState("");
  const [calendarSavedUrl, setCalendarSavedUrl] = useState("");
  const [calendarLastSynced, setCalendarLastSynced] = useState(null);
  const [calendarSyncError, setCalendarSyncError] = useState(null);
  const [savingCalendar, setSavingCalendar] = useState(false);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState("");

  const [toastMessage, setToastMessage] = useState(null);
  const [blockReason, setBlockReason] = useState("personal");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("18:00");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [seasonalTooltip, setSeasonalTooltip] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [propRes, availRes, bookingsRes] = await Promise.all([
          fetch(`${apiBase}/properties/${listingId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch(`${apiBase}/properties/${listingId}/availability`),
          fetch(`${apiBase}/bookings/host`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!propRes.ok) throw new Error("Listing not found");
        const propData = await propRes.json();
        const p = propData.property || propData;

        const availData = availRes.ok ? await availRes.json() : {};
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : [];

        if (cancelled) return;

        setProperty(p);
        setRawBlockedDates(availData.blockedDates || p.blockedDates || []);
        setRawBookings(
          (Array.isArray(bookingsData) ? bookingsData : []).filter(
            (b) => String(b.property?._id || b.property) === String(listingId)
          )
        );

        setBufferBefore(p.bookingSettings?.bufferBefore || 0);
        setBufferAfter(p.bookingSettings?.bufferAfter || 0);
        setInstantBook(!!p.bookingSettings?.instantBook);
        setWeekendAvailable(p.availability?.weekendAvailable !== false);
        setMinNotice(p.availability?.minNotice || "No minimum");
        setMaxAdvance(p.availability?.maxAdvance || "No limit");
        setOpenTime(p.availability?.openTime || "09:00");
        setCloseTime(p.availability?.closeTime || "18:00");
        setSameDayCutoff(p.availability?.sameDayCutoff || "No cutoff");
        setBlockStartTime(p.availability?.openTime || "09:00");
        setBlockEndTime(p.availability?.closeTime || "18:00");

        setCalendarUrl(p.icalUrl || "");
        setCalendarSavedUrl(p.icalUrl || "");
        setCalendarLastSynced(p.icalLastSyncedAt || null);
        setCalendarSyncError(p.icalLastSyncError || null);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || "Failed to load listing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (listingId) load();
    return () => {
      cancelled = true;
    };
  }, [listingId, apiBase, token]);

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

  const bookings = useMemo(
    () =>
      rawBookings
        .filter((b) => ["pending", "confirmed"].includes(b.status))
        .map((b) => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          return {
            id: b._id,
            startDate: toDateKey(checkIn),
            endDate: toDateKey(checkOut),
            startTime: checkIn.toTimeString().slice(0, 5),
            endTime: checkOut.toTimeString().slice(0, 5),
            guest: b.guest?.name || b.guest?.displayName || "Guest",
            status: b.status,
            price: b.totalPrice || 0,
            ref: `VC-${String(b._id).slice(-8).toUpperCase()}`,
          };
        }),
    [rawBookings]
  );

  const blockedDates = useMemo(
    () =>
      rawBlockedDates
        .filter((b) => !b.bookingId)
        .map((b) => ({
          id: b._id,
          startDate: toDateKey(new Date(b.start)),
          endDate: toDateKey(new Date(b.end)),
          reason: REASON_LABELS[b.reason] || "Blocked",
          rawReason: b.reason,
          isExternal: b.reason === "external",
        })),
    [rawBlockedDates]
  );

  const bufferDays = useMemo(
    () => getBufferDays(bookings, bufferBefore, bufferAfter),
    [bookings, bufferBefore, bufferAfter]
  );

  const monthLabel = visibleDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const stats = useMemo(() => {
    const monthBookings = bookings.filter((b) => {
      const d = parseDate(b.startDate);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
    const confirmedRevenue = monthBookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let bookedDayCount = 0;
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayKey = toDateKey(new Date(viewYear, viewMonth, day));
      const hasEvent =
        bookings.some(
          (b) => b.status === "confirmed" && b.startDate <= dayKey && b.endDate >= dayKey
        ) || blockedDates.some((b) => b.startDate <= dayKey && b.endDate >= dayKey);
      if (hasEvent) bookedDayCount += 1;
    }
    const occupancy = daysInMonth ? Math.round((bookedDayCount / daysInMonth) * 100) : 0;

    return {
      bookings: String(monthBookings.length),
      revenue: formatCurrency(confirmedRevenue),
      occupancy: `${occupancy}%`,
      rating: property?.rating ? property.rating.toFixed(2) : "—",
    };
  }, [bookings, blockedDates, viewYear, viewMonth, property]);

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
    setSelectedEvent({ ...blocked, draftReason: blocked.rawReason || "personal" });
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
    setBlockReason("personal");
    setBlockAllDay(true);
    setBlockStartTime(openTime);
    setBlockEndTime(closeTime);
  };

  const persistBlockedDates = async (nextRaw) => {
    setSavingBlocks(true);
    try {
      const res = await fetch(`${apiBase}/properties/${listingId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ blockedDates: nextRaw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update blocked dates");
      setRawBlockedDates(data.blockedDates || nextRaw);
      return true;
    } catch (err) {
      showToast(err.message || "Failed to update blocked dates");
      return false;
    } finally {
      setSavingBlocks(false);
    }
  };

  const handleBlockDates = async () => {
    if (!selectedRange) return;

    const start = blockAllDay
      ? selectedRange.start
      : combineDateAndTime(selectedRange.start, blockStartTime);
    const end = blockAllDay
      ? selectedRange.end
      : combineDateAndTime(selectedRange.end, blockEndTime);

    const nextRaw = [
      ...rawBlockedDates,
      { start: start.toISOString(), end: end.toISOString(), reason: blockReason || "personal" },
    ];

    const ok = await persistBlockedDates(nextRaw);
    setSelectStart(null);
    setSelectEnd(null);
    setHoverDate(null);
    setSidebarPanel(null);
    if (ok) showToast("Dates blocked successfully");
  };

  const handleUpdateBlock = async () => {
    const nextRaw = rawBlockedDates.map((b) =>
      String(b._id) === String(selectedEvent.id)
        ? { ...b, reason: selectedEvent.draftReason || "personal" }
        : b
    );
    const ok = await persistBlockedDates(nextRaw);
    clearContextPanel();
    if (ok) showToast("Blocked period updated");
  };

  const handleRemoveBlock = async () => {
    const nextRaw = rawBlockedDates.filter((b) => String(b._id) !== String(selectedEvent.id));
    const ok = await persistBlockedDates(nextRaw);
    clearContextPanel();
    if (ok) showToast("Blocked period removed");
  };

  const handleQuickBlock = () => {
    setSelectStart(today);
    setSelectEnd(addDays(today, 6));
    setSidebarPanel("new-block");
    setBlockReason("personal");
    setBlockAllDay(true);
  };

  const handleSaveAvailabilitySettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${apiBase}/properties/${listingId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          availability: { minNotice, maxAdvance, openTime, closeTime, sameDayCutoff, weekendAvailable },
          bookingSettings: { instantBook },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      showToast("Availability settings saved");
    } catch (err) {
      showToast(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveBuffer = async () => {
    setSavingBuffer(true);
    try {
      const res = await fetch(`${apiBase}/properties/${listingId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingSettings: { bufferBefore, bufferAfter } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save buffer settings");
      setBufferExpanded(false);
      showToast("Buffer settings saved");
    } catch (err) {
      showToast(err.message || "Failed to save buffer settings");
    } finally {
      setSavingBuffer(false);
    }
  };

  const handleSaveCalendarUrl = async () => {
    setSavingCalendar(true);
    setCalendarMessage("");
    try {
      const res = await fetch(`${apiBase}/properties/${listingId}/calendar-sync`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ icalUrl: calendarUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCalendarMessage(data.error || "Failed to save calendar URL");
        return;
      }
      setCalendarSavedUrl(data.icalUrl || "");
      setCalendarLastSynced(null);
      setCalendarSyncError(null);
      setCalendarMessage(data.icalUrl ? "Calendar connected" : "Calendar disconnected");
    } catch {
      setCalendarMessage("Failed to save calendar URL");
    } finally {
      setSavingCalendar(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncingCalendar(true);
    setCalendarMessage("");
    try {
      const res = await fetch(`${apiBase}/properties/${listingId}/calendar-sync/run`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCalendarSyncError(data.error || "Sync failed");
        setCalendarMessage(data.error || "Sync failed");
        return;
      }
      setCalendarLastSynced(data.lastSyncedAt);
      setCalendarSyncError(null);
      setCalendarMessage(`Synced — ${data.synced ?? 0} event(s) blocked`);

      const availRes = await fetch(`${apiBase}/properties/${listingId}/availability`);
      if (availRes.ok) {
        const availData = await availRes.json();
        setRawBlockedDates(availData.blockedDates || []);
      }
    } catch {
      setCalendarMessage("Sync failed");
    } finally {
      setSyncingCalendar(false);
    }
  };

  const handleApproveBooking = async () => {
    try {
      const res = await fetch(`${apiBase}/bookings/${selectedEvent.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to approve booking");
      setRawBookings((current) =>
        current.map((b) =>
          String(b._id) === String(selectedEvent.id) ? { ...b, status: "confirmed" } : b
        )
      );
      setSelectedEvent((current) => ({ ...current, status: "confirmed" }));
      showToast("Booking approved");
    } catch (err) {
      showToast(err.message || "Failed to approve booking");
    }
  };

  const handleDeclineBooking = async () => {
    try {
      const res = await fetch(`${apiBase}/bookings/${selectedEvent.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "declined" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to decline booking");
      setRawBookings((current) =>
        current.filter((b) => String(b._id) !== String(selectedEvent.id))
      );
      clearContextPanel();
      showToast("Booking declined");
    } catch (err) {
      showToast(err.message || "Failed to decline booking");
    }
  };

  const handleExportIcs = () => {
    const escapeIcs = (str) =>
      String(str || "")
        .replace(/[\\;,]/g, (m) => `\\${m}`)
        .replace(/\n/g, "\\n");
    const toIcsDate = (dateStr, timeStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hour, minute] = (timeStr || "00:00").split(":").map(Number);
      const d = new Date(year, month - 1, day, hour, minute);
      return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
    };

    const events = [
      ...bookings.map((b) => ({
        uid: `booking-${b.id}@vencome`,
        summary: `${property?.title || "Booking"} — ${b.guest}`,
        start: toIcsDate(b.startDate, b.startTime),
        end: toIcsDate(b.endDate, b.endTime),
      })),
      ...blockedDates.map((b) => ({
        uid: `block-${b.id}@vencome`,
        summary: `Blocked — ${b.reason}`,
        start: toIcsDate(b.startDate, "00:00"),
        end: toIcsDate(b.endDate, "23:59"),
      })),
    ];

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VenCome//Availability//EN",
      ...events.flatMap((event) => [
        "BEGIN:VEVENT",
        `UID:${event.uid}`,
        `DTSTAMP:${toIcsDate(toDateKey(today), "00:00")}`,
        `DTSTART:${event.start}`,
        `DTEND:${event.end}`,
        `SUMMARY:${escapeIcs(event.summary)}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ];

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(property?.title || "listing").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-calendar.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Calendar exported");
  };

  const monthGridDays = useMemo(() => {
    const totalCells = [...monthDays];
    while (totalCells.length % 7 !== 0) totalCells.push(null);
    return totalCells;
  }, [monthDays]);

  if (loading) {
    return (
      <DashboardLayout title="Availability & Calendar">
        <div className="flex items-center justify-center py-24 text-[14px] text-[#6B7280]">
          Loading listing…
        </div>
      </DashboardLayout>
    );
  }

  if (loadError || !property) {
    return (
      <DashboardLayout title="Availability & Calendar">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="text-[14px] text-[#DC2626]">{loadError || "Listing not found"}</p>
          <button
            type="button"
            onClick={() => navigate("/host/listings")}
            className="mt-4 text-[13px] text-[#305CDE] hover:underline"
          >
            Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Availability & Calendar">
      <div className="mb-6 flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white px-5 py-4 lg:flex-row lg:items-center">
        <img
          src={
            property.coverImage ||
            property.images?.[0] ||
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&q=80"
          }
          alt={property.title}
          className="h-14 w-14 rounded-[10px] object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#0A1628]">{property.title}</h2>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold ${
                property.isActive
                  ? "border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] text-[#16A34A]"
                  : "border-[rgba(107,114,128,0.2)] bg-[rgba(107,114,128,0.1)] text-[#6B7280]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${property.isActive ? "bg-[#16A34A]" : "bg-[#6B7280]"}`}
              />
              {property.isActive ? "Live" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {[property.location?.address, property.location?.city, property.location?.country]
              .filter(Boolean)
              .join(", ")}
          </p>
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
            onClick={() => window.open(`/property/${listingId}`, "_blank", "noopener,noreferrer")}
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
                                {showLabel ? formatCompactBookingLabel(booking) : " "}
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
                                {showLabel ? `Blocked · ${blocked.reason}` : " "}
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
                            selectedEvent.price * 0.9
                          )})`,
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
                        onClick={() => navigate("/dashboard/messages")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827] transition hover:border-[#0A1628]"
                      >
                        <MessageSquare size={16} />
                        Message Guest
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/bookings/${selectedEvent.id}`)}
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

                    {selectedEvent.isExternal ? (
                      <p className="mt-4 rounded-xl bg-[#F8F6F0] px-4 py-3 text-[13px] text-[#6B7280]">
                        Synced from your connected calendar. Disconnect the calendar to remove this block.
                      </p>
                    ) : (
                      <>
                        <div className="mt-4">
                          <label className="mb-2 block text-[13px] font-semibold text-[#111827]">
                            Reason
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {REASON_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  setSelectedEvent((current) => ({ ...current, draftReason: option.value }))
                                }
                                className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                                  selectedEvent.draftReason === option.value
                                    ? "border-[#0A1628] bg-[rgba(10,22,40,0.05)] font-semibold text-[#0A1628]"
                                    : "border-[#E5E7EB] text-[#374151] hover:border-[#305CDE]"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 space-y-2">
                          <button
                            type="button"
                            onClick={handleUpdateBlock}
                            disabled={savingBlocks}
                            className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
                          >
                            {savingBlocks ? "Saving..." : "Update"}
                          </button>

                          {showRemoveConfirm ? (
                            <div className="rounded-xl bg-[#F8F6F0] px-4 py-3 text-center">
                              <p className="text-[13px] text-[#111827]">Remove this blocked period?</p>
                              <div className="mt-2 flex items-center justify-center gap-4">
                                <button
                                  type="button"
                                  onClick={handleRemoveBlock}
                                  disabled={savingBlocks}
                                  className="text-[13px] font-semibold text-[#DC2626] hover:underline disabled:opacity-60"
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
                      </>
                    )}
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
                        Reason
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {REASON_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setBlockReason(option.value)}
                            className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                              blockReason === option.value
                                ? "border-[#0A1628] bg-[rgba(10,22,40,0.05)] font-semibold text-[#0A1628]"
                                : "border-[#E5E7EB] text-[#374151] hover:border-[#305CDE]"
                            }`}
                          >
                            {option.label}
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
                        disabled={savingBlocks}
                        className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
                      >
                        {savingBlocks ? "Blocking..." : "Block These Dates"}
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
                  onClick={handleSaveBuffer}
                  disabled={savingBuffer}
                  className="w-full rounded-[10px] bg-[#305CDE] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {savingBuffer ? "Saving..." : "Save Buffer Settings"}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#0A1628]">Connected Calendar</h3>
              {calendarSavedUrl ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(22,163,74,0.2)] bg-[rgba(22,163,74,0.1)] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                  <CheckCircle size={12} />
                  Connected
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-[12px] text-[#6B7280]">
              Sync an external calendar (Google, Outlook, Apple, Calendly, Cal.com, or any .ics feed)
              to automatically block these dates.
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={calendarUrl}
                onChange={(event) => setCalendarUrl(event.target.value)}
                placeholder="Paste your .ics calendar URL"
                className="h-11 w-full rounded-lg border-[1.5px] border-[#E5E7EB] px-3 text-[14px] outline-none focus:border-[#0A1628]"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveCalendarUrl}
                  disabled={savingCalendar}
                  className="rounded-[10px] bg-[#305CDE] px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                >
                  {savingCalendar ? "Saving..." : "Save"}
                </button>
                {calendarSavedUrl ? (
                  <button
                    type="button"
                    onClick={handleSyncNow}
                    disabled={syncingCalendar}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-medium text-[#111827] disabled:opacity-60"
                  >
                    <motion.span
                      animate={syncingCalendar ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 1, ease: "linear", repeat: syncingCalendar ? Infinity : 0 }}
                    >
                      <RefreshCw size={14} />
                    </motion.span>
                    {syncingCalendar ? "Syncing..." : "Sync Now"}
                  </button>
                ) : null}
              </div>
              {calendarMessage ? <p className="text-[12px] text-[#6B7280]">{calendarMessage}</p> : null}
              {calendarSyncError ? (
                <p className="text-[12px] text-[#DC2626]">Last sync error: {calendarSyncError}</p>
              ) : null}
              {calendarLastSynced ? (
                <p className="text-[11px] text-[#9CA3AF]">
                  Last synced: {new Date(calendarLastSynced).toLocaleString("en-GB")}
                </p>
              ) : null}
            </div>
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
                onClick={() => setSeasonalTooltip("Coming soon in Phase 2")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#E5E7EB] px-4 py-3 text-[14px] font-medium text-[#111827]"
              >
                <Tag size={16} />
                Set Seasonal Price
              </button>
              <button
                type="button"
                onClick={handleExportIcs}
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
            disabled={savingSettings}
            className="rounded-[10px] bg-[#305CDE] px-7 py-3 text-[15px] font-semibold text-white transition hover:bg-[#254FC7] disabled:opacity-60"
          >
            {savingSettings ? "Saving..." : "Save Availability Settings"}
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
