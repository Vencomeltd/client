import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  pending: { bg: "rgba(217,119,6,0.12)", text: "#D97706", dot: "#D97706" },
  confirmed: { bg: "rgba(22,163,74,0.12)", text: "#16A34A", dot: "#16A34A" },
  completed: { bg: "rgba(48,92,222,0.12)", text: "#305CDE", dot: "#305CDE" },
};

const EXTERNAL_DOT = "#9CA3AF";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

// Local calendar-day key (YYYY-MM-DD) — deliberately not toISOString(),
// which would shift dates across midnight in non-UTC timezones.
const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

// Every calendar day between a booking/block's start and end (inclusive of
// the start day, exclusive of the checkout day itself — matches how the
// rest of the app treats checkIn/checkOut ranges).
function daysInRange(start, end) {
  const keys = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor < last) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  if (keys.length === 0) keys.push(dayKey(cursor)); // same-day booking
  return keys;
}

export default function HostCalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [externalBlocks, setExternalBlocks] = useState([]);
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(() => dayKey(new Date()));

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/host-calendar`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load calendar");
        const data = await res.json();
        setBookings(data.bookings || []);
        setExternalBlocks(data.externalBlocks || []);
      } catch (err) {
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // Day -> events map, built once per data load (not per render of the grid).
  const eventsByDay = useMemo(() => {
    const map = {};
    const addEvent = (key, event) => {
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    bookings.forEach((booking) => {
      daysInRange(new Date(booking.checkIn), new Date(booking.checkOut)).forEach((key) =>
        addEvent(key, { type: "booking", data: booking })
      );
    });

    externalBlocks.forEach((block) => {
      daysInRange(new Date(block.start), new Date(block.end)).forEach((key) =>
        addEvent(key, { type: "external", data: block })
      );
    });

    return map;
  }, [bookings, externalBlocks]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const gridCells = useMemo(() => {
    const firstDayOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
    return cells;
  }, [year, month]);

  const todayKey = dayKey(new Date());
  const selectedEvents = eventsByDay[selectedDayKey] || [];

  const goToMonth = (delta) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDayKey(dayKey(today));
  };

  return (
    <DashboardLayout title="Calendar">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#0A1628]">Calendar</h2>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            A visual schedule of your VenCome bookings and synced external calendar
            events. To approve, decline, or manage a request, use{" "}
            <Link to="/host/bookings" className="text-[#305CDE] hover:underline">
              My Bookings
            </Link>
            .
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#305CDE]" />
        </div>
      ) : error ? (
        <div className="rounded-[20px] border border-[#E5E7EB] bg-white px-6 py-16 text-center text-[#EF4444]">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          {/* Calendar grid */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#E5E7EB] text-[#111827] transition hover:border-[#0A1628]"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#E5E7EB] text-[#111827] transition hover:border-[#0A1628]"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
                <p className="ml-2 text-[16px] font-bold text-[#0A1628]">{monthLabel}</p>
              </div>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-lg border-[1.5px] border-[#E5E7EB] px-3.5 py-1.5 text-[13px] font-medium text-[#111827] transition hover:border-[#0A1628]"
              >
                Today
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-[#9CA3AF]">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="pb-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {gridCells.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} />;
                const key = dayKey(date);
                const events = eventsByDay[key] || [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDayKey;
                const bookingEvents = events.filter((e) => e.type === "booking");
                const externalEvents = events.filter((e) => e.type === "external");

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDayKey(key)}
                    className={`flex min-h-[76px] flex-col items-start rounded-lg border-[1.5px] p-1.5 text-left transition ${
                      isSelected
                        ? "border-[#305CDE] bg-[rgba(48,92,222,0.06)]"
                        : "border-[#F3F4F6] hover:border-[#E5E7EB]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold ${
                        isToday ? "bg-[#0A1628] text-white" : "text-[#111827]"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="mt-1 flex w-full flex-col gap-0.5">
                      {bookingEvents.slice(0, 2).map((event) => {
                        const colors = STATUS_COLORS[event.data.status] || STATUS_COLORS.confirmed;
                        return (
                          <span
                            key={event.data._id}
                            className="truncate rounded px-1 py-[1px] text-[10px] font-medium"
                            style={{ background: colors.bg, color: colors.text }}
                          >
                            {event.data.property?.title || "Booking"}
                          </span>
                        );
                      })}
                      {externalEvents.length > 0 ? (
                        <span
                          className="truncate rounded px-1 py-[1px] text-[10px] font-medium"
                          style={{ background: "rgba(156,163,175,0.16)", color: "#6B7280" }}
                        >
                          {externalEvents.length} external
                        </span>
                      ) : null}
                      {bookingEvents.length > 2 ? (
                        <span className="text-[10px] text-[#9CA3AF]">
                          +{bookingEvents.length - 2} more
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#F3F4F6] pt-4 text-[12px] text-[#6B7280]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS.pending.dot }} />
                Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS.confirmed.dot }} />
                Confirmed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS.completed.dot }} />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: EXTERNAL_DOT }} />
                External calendar
              </span>
            </div>
          </div>

          {/* Selected day detail panel */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
            <p className="mb-4 text-[15px] font-bold text-[#0A1628]">
              {(() => {
                // new Date("YYYY-MM-DD") parses as UTC midnight, which can
                // display as the wrong day for users west of UTC -- build
                // it from local components instead.
                const [y, m, d] = selectedDayKey.split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
              })()}
            </p>

            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CalendarDays size={28} className="mb-2 text-[#D1D5DB]" />
                <p className="text-[13px] text-[#6B7280]">Nothing scheduled this day.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedEvents.map((event, index) =>
                  event.type === "booking" ? (
                    <Link
                      key={`booking-${event.data._id}-${index}`}
                      to={`/bookings/${event.data._id}`}
                      className="block rounded-xl border border-[#E5E7EB] p-3.5 transition hover:border-[#305CDE]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {event.data.property?.coverImage ? (
                            <img
                              src={event.data.property.coverImage}
                              alt=""
                              className="h-9 w-9 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F6F0] text-[#6B7280]">
                              <Building2 size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#0A1628]">
                              {event.data.property?.title || "Listing"}
                            </p>
                            <p className="truncate text-[12px] text-[#6B7280]">
                              {event.data.guest?.name || "Guest"}
                            </p>
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                          style={{
                            background: (STATUS_COLORS[event.data.status] || STATUS_COLORS.confirmed).bg,
                            color: (STATUS_COLORS[event.data.status] || STATUS_COLORS.confirmed).text,
                          }}
                        >
                          {event.data.status}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-3 border-t border-[#F3F4F6] pt-2.5 text-[11px] text-[#6B7280]">
                        <span>
                          <span className="font-semibold text-[#111827]">Check-in </span>
                          {formatTime(event.data.checkIn)}
                        </span>
                        <span>
                          <span className="font-semibold text-[#111827]">Check-out </span>
                          {formatTime(event.data.checkOut)}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={`external-${index}`}
                      className="rounded-xl border border-dashed border-[#E5E7EB] p-3.5"
                    >
                      <p className="text-[13px] font-semibold text-[#0A1628]">
                        {event.data.propertyTitle || "Listing"}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#6B7280]">
                        Blocked via {event.data.source}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
