// The dates a recurring booking covers. Used by both the booking form's
// preview and submitBooking (PropertyDetails.jsx), so the guest sees exactly
// what gets booked.
//
// frequency: "weekly" | "biweekly" | "monthly"; periods: how many weeks,
// fortnights or months. weekdays (0=Sun..6=Sat, weekly/biweekly only) are the
// days booked in each period -- empty means the start date's own weekday.
// Hourly bookings run startTime-endTime ("HH:MM") on each date; any other
// unit runs from midnight for one day/week/month/year.
export function buildRecurringDates({ startDate, frequency, periods, weekdays = [], durationUnit, startTime, endTime }) {
  if (!startDate || !periods) return [];
  const [year, month, day] = startDate.split("-").map(Number);
  const first = new Date(year, month - 1, day);

  let startMinutes;
  let endMinutes;
  if (durationUnit === "hour") {
    const toMinutes = (time) => (/^\d\d:\d\d$/.test(time || "") ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN);
    startMinutes = toMinutes(startTime);
    endMinutes = toMinutes(endTime);
    if (!(endMinutes > startMinutes)) return [];
  }

  const days = [];
  for (let period = 0; period < periods; period += 1) {
    if (frequency === "monthly") {
      const date = new Date(first);
      date.setMonth(first.getMonth() + period);
      days.push(date);
      continue;
    }
    const periodStart = new Date(first);
    periodStart.setDate(first.getDate() + period * (frequency === "biweekly" ? 14 : 7));
    for (const weekday of weekdays.length ? weekdays : [first.getDay()]) {
      const date = new Date(periodStart);
      date.setDate(periodStart.getDate() + ((weekday - first.getDay() + 7) % 7));
      days.push(date);
    }
  }
  days.sort((a, b) => a - b);

  return days.map((date) => {
    const checkIn = new Date(date);
    const checkOut = new Date(date);
    if (durationUnit === "hour") {
      checkIn.setHours(0, startMinutes, 0, 0);
      checkOut.setHours(0, endMinutes, 0, 0);
    } else if (durationUnit === "week") checkOut.setDate(checkOut.getDate() + 7);
    else if (durationUnit === "month") checkOut.setMonth(checkOut.getMonth() + 1);
    else if (durationUnit === "year") checkOut.setFullYear(checkOut.getFullYear() + 1);
    else checkOut.setDate(checkOut.getDate() + 1);
    return { checkIn, checkOut };
  });
}

// "Wed 28 Oct, 10:00–13:00" (hourly), "Wed 28 Oct" (daily), otherwise
// "28 Oct – 4 Nov".
export function formatOccurrence({ checkIn, checkOut }, durationUnit) {
  const day = (date, weekday = true) =>
    date.toLocaleDateString("en-GB", { ...(weekday && { weekday: "short" }), day: "numeric", month: "short" });
  const time = (date) => date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (durationUnit === "hour") return `${day(checkIn)}, ${time(checkIn)}–${time(checkOut)}`;
  if (durationUnit === "day") return day(checkIn);
  const lastDay = new Date(checkOut);
  lastDay.setDate(lastDay.getDate() - 1);
  return `${day(checkIn, false)} – ${day(lastDay, false)}`;
}
