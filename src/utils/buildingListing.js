// Building/site listings: one "building" listing with several "unit" rooms
// under it. A room is a full listing of its own (own price, availability,
// booking settings, optional photos) that guests book directly. Pure helpers
// shared by CreateSpace, EditSpace, PropertyCard and PropertyDetails -- the
// room payload mapping and the display strings.

import { quote } from "./vatPricing";

export const MAX_UNITS = 100;

// Form fields a building listing never sends: they describe a bookable
// space, and a building's rooms carry their own pricing, discounts, booking
// settings and calendar. (A building keeps its availability: the days and
// opening hours of the site.)
export const BUILDING_SKIPPED_FIELDS = [
  "pricing", "bookingSettings", "deposit", "depositPolicy", "minBookingHours",
  "unitsCount", "extras", "discounts", "blockedDates", "bookingApproval", "icalUrl",
];

// Form fields a room never sends: it inherits the building's location,
// category and lease agreement.
export const ROOM_SKIPPED_FIELDS = [
  "location", "coordinates", "category", "categories", "subcategories", "subcategory",
  "leaseFile", "existingLeaseAgreement", "video", "existingVideo",
];

export const isBuilding = (property) => property?.listingType === "building";

// Whole pounds stay whole (£650); anything with pence shows both digits
// (£869.40). Same rule as PropertyCard's formatPrice, from integer pence.
export const formatPence = (pence) => {
  const value = (Number(pence) || 0) / 100;
  return `£${new Intl.NumberFormat("en-GB", Number.isInteger(value) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
};

// ---- Building card -------------------------------------------------------

export const unitsAvailableText = (count) => {
  const n = Number(count) || 0;
  if (n === 0) return "No units available";
  return `${n} ${n === 1 ? "unit" : "units"} available`;
};

// "From £869.40/month" pieces, or null when no unit has a price.
export const fromPrice = (building) => {
  const pence = Number(building?.fromPricePence);
  if (!(pence > 0)) return null;
  return { price: formatPence(pence), unit: "/month" };
};

// ---- Unit card -----------------------------------------------------------

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

// { key, label } for a unit's availability badge. A date that has already
// passed reads as available now.
export const unitAvailability = (unitDetails, now = new Date()) => {
  const availability = unitDetails?.availability || {};
  if (availability.status === "let") return { key: "let", label: "Let" };
  if (availability.status === "available_from" && availability.availableFrom) {
    const from = new Date(availability.availableFrom);
    if (!Number.isNaN(from.getTime()) && from.getTime() > now.getTime()) {
      return { key: "available_from", label: `Available from ${formatDate(from)}` };
    }
  }
  return { key: "available", label: "Available now" };
};

// What a room card shows for its price: the monthly price when it has one
// (rooms are mostly let monthly), else its cheapest-period price. The total
// is what the customer pays (the server's quote when present), plus the
// ex-VAT line.
const PRICE_PERIODS = [["monthly", "month"], ["weekly", "week"], ["daily", "day"], ["hourly", "hour"]];

export const unitPriceDisplay = (unit) => {
  const pricing = unit?.pricing || {};
  const [period, periodLabel] = PRICE_PERIODS.find(([key]) => Number(pricing[key]) > 0) || PRICE_PERIODS[0];
  const q = quote({ corePence: Math.round((Number(pricing[period]) || 0) * 100), quantity: 1, tax: pricing.vat?.[period] });
  const totalPence = period === "monthly" && Number(unit?.quote?.totalPence) > 0 ? unit.quote.totalPence : q.totalPence;
  const hasVat = q.vatRatePct > 0;
  return {
    price: formatPence(totalPence),
    suffix: `/${periodLabel}${hasVat ? " inc. VAT" : ""}${q.utilitiesPence > 0 ? " incl. utilities" : ""}`,
    note: hasVat ? `${formatPence(q.corePence + q.utilitiesPence)} ex VAT` : "No VAT charged on this room",
    minimumTermMonths: period === "monthly" ? Number(pricing.minimumTermMonths) || 0 : 0,
  };
};

// ---- Room (unit) form <-> API -------------------------------------------

export const splitFeatures = (text) =>
  [...new Set(String(text || "").split(/[,\n]/).map((item) => item.trim()).filter(Boolean))];

const positiveNumber = (value) => {
  const n = Number(value);
  return n > 0 ? n : undefined;
};

// First problem with a room's key-features text, or "".
export const roomFeaturesProblem = (text) => {
  const features = splitFeatures(text);
  if (features.length > 20) return "List at most 20 key features.";
  if (features.some((feature) => feature.length > 60)) return "Keep each key feature under 60 characters.";
  return "";
};

// The `unitDetails` of a room, from the room flow's / EditSpace's form fields.
// A room is otherwise a normal listing (its title is the room name).
export const roomUnitDetails = ({ title, sizeSqFt, capacity, unitFeatures, unitStatus, unitAvailableFrom }) => ({
  label: String(title || "").trim(),
  sizeSqFt: positiveNumber(sizeSqFt),
  capacity: positiveNumber(capacity),
  features: splitFeatures(unitFeatures),
  availability: {
    status: unitStatus || "available",
    availableFrom: unitStatus === "available_from" ? unitAvailableFrom : undefined,
  },
});
