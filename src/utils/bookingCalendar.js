// Helpers for the post-payment confirmation page (pages/BookingConfirmed.jsx).
// Pure functions so they can be checked outside React.

// £120 for whole pounds, £120.50 when there are pence. Uses the stored
// booking total as-is -- never recomputed from rates.
export function formatPaidAmount(pounds) {
  const value = Number(pounds) || 0;
  const hasPence = Math.round(value * 100) % 100 !== 0;
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

const toCalendarDate = (date) =>
  new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

export function propertyAddress(property) {
  const loc = property?.location || {};
  return [loc.address, loc.city, loc.postcode, loc.country].filter(Boolean).join(", ");
}

// Google Calendar "add event" link built from the booking's own dates.
export function googleCalendarUrl({ title, checkIn, checkOut, location, details }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalendarDate(checkIn)}/${toCalendarDate(checkOut)}`,
  });
  if (location) params.set("location", location);
  if (details) params.set("details", details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Minimal .ics (RFC 5545) for Apple Calendar / Outlook, used when the
// server's calendar.ics endpoint isn't available.
export function buildIcs({ uid, title, checkIn, checkOut, location, details }) {
  const escapeText = (text) =>
    String(text || "").replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VenCome//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@vencome.com`,
    `DTSTAMP:${toCalendarDate(new Date())}`,
    `DTSTART:${toCalendarDate(checkIn)}`,
    `DTEND:${toCalendarDate(checkOut)}`,
    `SUMMARY:${escapeText(title)}`,
    location ? `LOCATION:${escapeText(location)}` : null,
    details ? `DESCRIPTION:${escapeText(details)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
