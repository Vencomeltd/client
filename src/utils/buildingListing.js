// Building/site listings: one "building" listing with several "unit" rooms
// under it. Pure helpers shared by CreateSpace, EditSpace, PropertyCard and
// PropertyDetails -- the unit form <-> API payload mapping and the display
// strings. Units are monthly-priced and enquiry-only (v1).

import { quote } from "./vatPricing";
import { vatPayload, minimumTermPayload, vatFormState } from "./vatForm";

export const MAX_UNITS = 100;

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

// "From £869.40/month inc. VAT" pieces, or null when no unit has a price.
export const fromPrice = (building) => {
  const pence = Number(building?.fromPricePence);
  if (!(pence > 0)) return null;
  return { price: formatPence(pence), unit: "/month inc. VAT" };
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

// What a unit card shows for the monthly price: the total the customer pays
// (the server's quote when present), plus the ex-VAT line.
export const unitPriceDisplay = (unit) => {
  const pricing = unit?.pricing || {};
  const q = quote({ corePence: Math.round((Number(pricing.monthly) || 0) * 100), quantity: 1, tax: pricing.vat?.monthly });
  const totalPence = Number(unit?.quote?.totalPence) > 0 ? unit.quote.totalPence : q.totalPence;
  const hasVat = q.vatRatePct > 0;
  return {
    price: formatPence(totalPence),
    suffix: `/month${hasVat ? " inc. VAT" : ""}${q.utilitiesPence > 0 ? " incl. utilities" : ""}`,
    note: hasVat ? `${formatPence(q.corePence + q.utilitiesPence)} ex VAT` : "No VAT charged on this unit",
    minimumTermMonths: Number(pricing.minimumTermMonths) || 0,
  };
};

// ---- Unit form <-> API ---------------------------------------------------

let localCounter = 0;
export const emptyUnit = () => ({
  localId: `u${Date.now().toString(36)}${localCounter++}`,
  label: "",
  price: "",
  vatStatus: "",
  vatRate: 20,
  utilitiesAmount: "",
  utilitiesPer: "unit",
  utilitiesVatable: true,
  minimumTermMonths: "",
  sizeSqFt: "",
  capacity: "",
  features: "",
  availStatus: "available",
  availableFrom: "",
});

const splitFeatures = (text) =>
  [...new Set(String(text || "").split(/[,\n]/).map((item) => item.trim()).filter(Boolean))];

const positiveNumber = (value) => {
  const n = Number(value);
  return n > 0 ? n : undefined;
};

// First problem with a unit form, or "" when it can be saved.
export const validateUnit = (unit) => {
  const name = unit.label?.trim() || "This room";
  if (!unit.label?.trim()) return "Give each room a name or number, e.g. Unit 1.04.";
  if (!(Number(unit.price) > 0)) return `${name}: add a monthly price.`;
  if (!unit.vatStatus) return `${name}: choose a VAT status for the price.`;
  if (unit.availStatus === "available_from" && !unit.availableFrom) return `${name}: choose the date it becomes available.`;
  return "";
};

// The body of POST /properties/:buildingId/units and PUT /properties/units/:id.
export const unitToPayload = (unit) => {
  const label = unit.label.trim();
  const pricing = { monthly: parseFloat(unit.price) };
  const vat = vatPayload(unit);
  if (vat) pricing.vat = { monthly: vat };
  const minimumTermMonths = minimumTermPayload(unit);
  if (minimumTermMonths) pricing.minimumTermMonths = minimumTermMonths;
  return {
    title: label,
    pricing,
    unitDetails: {
      label,
      sizeSqFt: positiveNumber(unit.sizeSqFt),
      capacity: positiveNumber(unit.capacity),
      features: splitFeatures(unit.features),
      availability: {
        status: unit.availStatus,
        availableFrom: unit.availStatus === "available_from" ? unit.availableFrom : undefined,
      },
    },
  };
};

// Form state for editing a saved unit from GET /properties/:id's units[].
export const unitToForm = (unit) => {
  const details = unit.unitDetails || {};
  const saved = vatFormState(unit.pricing?.vat?.monthly);
  return {
    ...emptyUnit(),
    ...saved,
    _id: unit._id,
    label: details.label || unit.title || "",
    price: saved.price ?? (unit.pricing?.monthly ? String(unit.pricing.monthly) : ""),
    minimumTermMonths: unit.pricing?.minimumTermMonths ? String(unit.pricing.minimumTermMonths) : "",
    sizeSqFt: details.sizeSqFt ? String(details.sizeSqFt) : "",
    capacity: details.capacity ? String(details.capacity) : "",
    features: (details.features || []).join(", "),
    availStatus: details.availability?.status || "available",
    availableFrom: details.availability?.availableFrom ? String(details.availability.availableFrom).slice(0, 10) : "",
  };
};
