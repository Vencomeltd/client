import { Check, Ruler, Users } from "lucide-react";
import { fromPrice, unitAvailability, unitPriceDisplay, unitsAvailableText } from "../utils/buildingListing";

// The "Available units" part of a building listing page: a card per room with
// its price, size, capacity, key features and availability. Rooms have no
// photos. Layout and styling follow the approved mock-up
// (pages/BuildingListingPreview.jsx). v1 rooms are enquiry-only.

const BADGE_STYLES = {
  available: "bg-[#DCFCE7] text-[#166534]",
  available_from: "bg-[rgba(48,92,222,0.1)] text-[#305CDE]",
  let: "bg-[#FEF3C7] text-[#92400E]",
};

function UnitCard({ unit, onEnquire }) {
  const details = unit.unitDetails || {};
  const availability = unitAvailability(details);
  const price = unitPriceDisplay(unit);
  const isLet = availability.key === "let";

  return (
    <div
      className={`flex h-full flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ${isLet ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[18px] font-extrabold text-[#0A1628]">{details.label || unit.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${BADGE_STYLES[availability.key]}`}>
          {availability.label}
        </span>
      </div>

      <p className="mt-3">
        <span className="text-[22px] font-extrabold text-[#111827]">{price.price}</span>
        <span className="text-[13px] text-[#6B7280]">{price.suffix}</span>
      </p>
      <p className="text-[12px] text-[#6B7280]">{price.note}</p>
      {price.minimumTermMonths > 0 ? (
        <p className="text-[12px] text-[#6B7280]">Minimum term {price.minimumTermMonths} months</p>
      ) : null}

      {details.sizeSqFt || details.capacity ? (
        <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-[#374151]">
          {details.sizeSqFt ? (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#F8F9FB] px-3 py-2">
              <Ruler size={14} className="text-[#305CDE]" /> {details.sizeSqFt} sq ft
            </div>
          ) : null}
          {details.capacity ? (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#F8F9FB] px-3 py-2">
              <Users size={14} className="text-[#305CDE]" /> {details.capacity} {details.capacity === 1 ? "person" : "people"}
            </div>
          ) : null}
        </div>
      ) : null}

      <ul className="mt-4 flex-1 space-y-1.5">
        {(details.features || []).map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-[13px] text-[#374151]">
            <Check size={14} className="shrink-0 text-[#16A34A]" /> {feature}
          </li>
        ))}
      </ul>

      {isLet ? null : (
        <button
          type="button"
          onClick={() => onEnquire(unit)}
          className="mt-5 w-full rounded-[10px] bg-[#0A1628] px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1E293B]"
        >
          Enquire about this unit
        </button>
      )}
    </div>
  );
}

export function BuildingUnitsSection({ units = [], onEnquire }) {
  // Let rooms stay visible, after the ones you can still enquire about.
  const sorted = [...units].sort(
    (a, b) => Number(unitAvailability(a.unitDetails).key === "let") - Number(unitAvailability(b.unitDetails).key === "let")
  );
  return (
    <div id="available-units" className="border-b border-[#E5E7EB] py-6">
      <h2 className="text-[22px] font-extrabold text-[#0A1628]">Available units</h2>
      {sorted.length === 0 ? (
        <p className="mt-3 text-[14px] text-[#6B7280]">No units are listed for this building yet.</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {sorted.map((unit) => (
            <UnitCard key={unit._id} unit={unit} onEnquire={onEnquire} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BuildingSummary({ building }) {
  const from = fromPrice(building);
  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <div className="rounded-[12px] bg-[#0A1628] p-4 text-white">
        <p className="text-[13px] text-white/70">Available now or soon</p>
        <p className="text-[20px] font-extrabold">{unitsAvailableText(building.unitsAvailable)}</p>
        {from ? <p className="text-[13px] text-white/70">from {from.price}/month inc. VAT</p> : null}
      </div>
      <p className="mt-4 text-[13px] leading-6 text-[#6B7280]">
        Each room has its own price. Choose a room below and send an enquiry to the host; there is nothing to pay online.
      </p>
      <a
        href="#available-units"
        className="mt-4 block w-full rounded-[10px] border border-[#0A1628] px-4 py-3 text-center text-[14px] font-semibold text-[#0A1628] transition hover:bg-[#F8F9FB]"
      >
        See available units
      </a>
    </div>
  );
}
