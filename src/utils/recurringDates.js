// Recurring bookings: which days are booked, and when on each day. Used by
// both the booking form's preview and submitBooking (PropertyDetails.jsx),
// so the guest sees exactly what gets booked. The server repeats the same
// day logic (vencome-server/utils/recurrence.js) and rejects any mismatch --
// keep the two in step.
//
// Days are UK calendar days ("YYYY-MM-DD"); times are UK wall-clock times,
// whatever timezone the guest's browser is in.

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Hourly listings book their opening hours; these apply when none are set.
export const STANDARD_HOURS = { open: "09:00", close: "17:00" };

const parseYmd = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const toYmd = (ms) => new Date(ms).toISOString().slice(0, 10);
const addDays = (ymd, n) => toYmd(parseYmd(ymd) + n * DAY_MS);
const weekdayOf = (ymd) => new Date(parseYmd(ymd)).getUTCDay();

// openDays: the listing's availability.openDays ("Monday", ...); empty = every day.
export const isOpenDay = (ymd, openDays = []) => !openDays.length || openDays.includes(DAY_NAMES[weekdayOf(ymd)]);
export const openWeekdays = (openDays = []) =>
  [0, 1, 2, 3, 4, 5, 6].filter((day) => !openDays.length || openDays.includes(DAY_NAMES[day]));

// The days booked, sorted. The start date is always the first day. Weekly
// and fortnightly: `count` calendar weeks from the start date, with the
// weekdays in each week (every 2 weeks = the 1st, 3rd, ... of those weeks).
// Monthly: the start date's day number for `count` months (the last day of
// a shorter month). Closed days after the start date are skipped.
export function recurringDays({ startDate, frequency, count, weekdays = [], openDays = [] }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !(count > 0)) return [];
  const days = new Set([startDate]);

  if (frequency === "monthly") {
    const start = new Date(parseYmd(startDate));
    for (let i = 1; i < count; i += 1) {
      const year = start.getUTCFullYear();
      const month = start.getUTCMonth() + i;
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      days.add(toYmd(Date.UTC(year, month, Math.min(start.getUTCDate(), lastDay))));
    }
  } else {
    const step = frequency === "biweekly" ? 14 : 7;
    for (let offset = 0; offset < count * 7; offset += step) {
      for (let d = 0; d < 7; d += 1) {
        const day = addDays(startDate, offset + d);
        if (weekdays.includes(weekdayOf(day))) days.add(day);
      }
    }
  }

  return [...days].filter((day) => day === startDate || isOpenDay(day, openDays)).sort();
}

// A UK wall-clock time as a Date ("24:00" = midnight at the end of the day).
export function ukTime(ymd, hhmm) {
  if (hhmm === "24:00") return ukTime(addDays(ymd, 1), "00:00");
  const [y, m, d] = ymd.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(guess)
      .map((p) => [p.type, p.value])
  );
  const shownInUk = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess - (shownInUk - guess));
}

// The space's opening hours on a day (same rules as the server's
// resolveDayHours), or null when the host hasn't set any.
export function openingHours(ymd, availability = {}) {
  let source = availability;
  if (availability.hoursMode === "custom") {
    const entry = (availability.dayHours || []).find((d) => d.day === DAY_NAMES[weekdayOf(ymd)]);
    if (entry) source = entry;
  }
  if (source.is24Hours) return { open: "00:00", close: "24:00" };
  return source.openTime && source.closeTime ? { open: source.openTime, close: source.closeTime } : null;
}

// Check-in/check-out for each day. Hourly listings book the opening hours;
// daily books the day; week/month/year run from that day for one unit.
export function recurringBookings(days, durationUnit, availability) {
  return days.map((day) => {
    if (durationUnit === "hour") {
      const hours = openingHours(day, availability) || STANDARD_HOURS;
      return { day, checkIn: ukTime(day, hours.open), checkOut: ukTime(day, hours.close), hours };
    }
    const checkIn = ukTime(day, "09:00");
    if (durationUnit === "week") return { day, checkIn, checkOut: ukTime(addDays(day, 7), "09:00") };
    if (durationUnit === "month" || durationUnit === "year") {
      const end = new Date(parseYmd(day));
      if (durationUnit === "month") end.setUTCMonth(end.getUTCMonth() + 1);
      else end.setUTCFullYear(end.getUTCFullYear() + 1);
      return { day, checkIn, checkOut: ukTime(toYmd(end.getTime()), "09:00") };
    }
    return { day, checkIn, checkOut: ukTime(day, "18:00") };
  });
}

// "Wed 28 Oct, 10:00–13:00" (hourly), "Wed 28 Oct" (daily), otherwise
// "28 Oct – 4 Nov". UK time.
export function formatOccurrence({ checkIn, checkOut }, durationUnit) {
  const zone = { timeZone: "Europe/London" };
  const day = (date, weekday = true) =>
    date.toLocaleDateString("en-GB", { ...zone, ...(weekday && { weekday: "short" }), day: "numeric", month: "short" });
  const time = (date) => date.toLocaleTimeString("en-GB", { ...zone, hour: "2-digit", minute: "2-digit" });
  if (durationUnit === "hour") return `${day(checkIn)}, ${time(checkIn)}–${time(checkOut)}`;
  if (durationUnit === "day") return day(checkIn);
  const lastDay = new Date(checkOut.getTime() - DAY_MS);
  return `${day(checkIn, false)} – ${day(lastDay, false)}`;
}
