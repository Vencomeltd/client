// Property.minBookingHours: a whole number of hours (0-24) an HOURLY booking
// must at least last. Unset/empty means no minimum.

// Form value -> what CreateSpace/EditSpace send: "" for no minimum,
// otherwise a whole number clamped to 0-24.
export function minBookingHoursPayload(value) {
  if (value === "" || value === null || value === undefined) return "";
  const hours = Number(value);
  if (!Number.isFinite(hours)) return "";
  return String(Math.min(24, Math.max(0, Math.round(hours))));
}

// The listing's minimum in hours, or 0 when it has none.
export function minBookingHoursOf(property) {
  const hours = Number(property?.minBookingHours);
  return Number.isInteger(hours) && hours > 0 ? hours : 0;
}

// True when any of the picked { checkIn, checkOut } ranges is shorter than
// the minimum (0 = no minimum).
export function rangeShorterThanMinimum(ranges, minHours) {
  if (!minHours) return false;
  return ranges.some(({ checkIn, checkOut }) => (new Date(checkOut) - new Date(checkIn)) / 3600000 < minHours);
}
