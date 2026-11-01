// Listing-form state <-> the pricing.vat entry the server stores, for one
// price option. Used by PriceTaxFields, CreateSpace and EditSpace.

const toPence = (pounds) => Math.round((parseFloat(pounds) || 0) * 100);

// The pricing.vat entry the server expects for this option (or nothing).
export function vatPayload(option) {
  if (!option?.vatStatus || !(toPence(option.price) > 0)) return undefined;
  return {
    enteredPence: toPence(option.price),
    status: option.vatStatus,
    ratePct: option.vatStatus === "none" ? 0 : Number(option.vatRate ?? 20),
    utilities: {
      amountPence: toPence(option.utilitiesAmount),
      per: option.utilitiesPer === "booking" ? "booking" : "unit",
      vatable: option.utilitiesVatable !== false,
    },
  };
}

// Form state for an option from a saved listing's pricing.vat[unit].
// The monthly option's minimum term, as Property.pricing.minimumTermMonths
// (2-36 months), or undefined for none.
export function minimumTermPayload(option) {
  const months = parseInt(option?.minimumTermMonths, 10);
  return months >= 2 && months <= 36 ? months : undefined;
}

export function vatFormState(saved) {
  if (!saved?.status) return {};
  return {
    price: saved.enteredPence ? String(saved.enteredPence / 100) : undefined,
    vatStatus: saved.status,
    vatRate: saved.ratePct ?? 20,
    utilitiesAmount: saved.utilities?.amountPence ? String(saved.utilities.amountPence / 100) : "",
    utilitiesPer: saved.utilities?.per || "unit",
    utilitiesVatable: saved.utilities?.vatable !== false,
  };
}
