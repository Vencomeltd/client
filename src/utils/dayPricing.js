// Mirrors vencome-server/utils/pricing.js exactly, so the price shown here
// before booking matches what the server will actually charge. Keep both
// files in sync if this logic ever changes.

// Resolves the rate for a single calendar day, applying a customDayPricing
// override for that day-of-week if one exists. Uses local Date methods
// (not UTC), matching the calendar-day-boundary convention already used
// throughout this page.
function resolveDayRate(date, baseRate, customDayPricing) {
  const day = date.getDay(); // 0=Sunday..6=Saturday
  const override = (customDayPricing || []).find((d) => d.day === day);
  return override ? override.rate : baseRate;
}

// DAILY pricing: walks each night of the stay (checkOutDate exclusive),
// applying any customDayPricing override per night.
export function calculateDailyPriceWithBreakdown(
  checkInDate,
  totalNights,
  baseRate,
  customDayPricing
) {
  const checkInDay = new Date(
    checkInDate.getFullYear(),
    checkInDate.getMonth(),
    checkInDate.getDate()
  );

  const breakdown = [];
  let totalPrice = 0;

  for (let i = 0; i < totalNights; i++) {
    const date = new Date(checkInDay);
    date.setDate(date.getDate() + i);
    const rate = resolveDayRate(date, baseRate, customDayPricing);
    breakdown.push({ date, rate });
    totalPrice += rate;
  }

  return { totalPrice, breakdown };
}

// HOURLY pricing: a single slot is billed as one lump sum for its whole
// duration, so this looks up just the check-in date's day-of-week rather
// than looping like the DAILY case.
export function calculateHourlyPriceWithBreakdown(
  checkInDate,
  totalHours,
  baseRate,
  customDayPricing
) {
  const rate = resolveDayRate(checkInDate, baseRate, customDayPricing);
  const totalPrice = Math.round(totalHours * rate * 100) / 100;
  return { totalPrice, breakdown: [{ date: checkInDate, rate }] };
}

// Cheapest possible night/hour across the week for a listing with
// customDayPricing active -- either the base rate (an un-overridden day) or
// one of the overrides, whichever is lower. Used for "From £X" listing
// price displays so they don't imply every night costs the same.
export function getLowestWeeklyRate(baseRate, customDayPricing) {
  if (!customDayPricing || customDayPricing.length === 0) return baseRate;
  return Math.min(baseRate, ...customDayPricing.map((d) => d.rate));
}
