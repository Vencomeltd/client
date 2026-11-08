import { useSearchParams } from "react-router-dom";
import { Building2, Check, Info, MapPin, Ruler, Star, Users } from "lucide-react";
import PropertyCard from "../components/PropertyCard";

// VISUAL PREVIEW ONLY (client review of "building listing with available
// room cards", vault backlog 4 Nov 2026). Not linked from navigation, noindex,
// no API calls. Every name, address, price and unit below is synthetic
// placeholder data -- the real unit data will come from the client's
// "Sales Vacant Unit Tracker" once we have it.

// React Router route module export, not a component.
// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
  return [
    { title: "Building listing preview | VenCome" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

// Plain gradient "photos" so no real listing imagery is used.
const photo = (label, from, to) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
      `<rect width="800" height="600" fill="url(#g)"/>` +
      `<text x="400" y="290" font-family="Manrope, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff" text-anchor="middle">Representative photo</text>` +
      `<text x="400" y="335" font-family="Manrope, Arial, sans-serif" font-size="22" fill="#ffffff" fill-opacity="0.8" text-anchor="middle">${label}</text>` +
      `</svg>`
  )}`;

const BUILDING = {
  name: "Sample Studios Building",
  address: "Placeholder Street, Example Area, London",
  summary:
    "A placeholder multi-let building used to show how a site with several available studios and offices could appear on VenCome. All details on this page are synthetic.",
  photos: [
    photo("Building exterior", "#0A1628", "#305CDE"),
    photo("Reception", "#1E3A8A", "#60A5FA"),
    photo("Typical studio", "#305CDE", "#93C5FD"),
    photo("Shared kitchen", "#0F766E", "#5EEAD4"),
    photo("Meeting room", "#4338CA", "#A5B4FC"),
  ],
  facts: [
    { label: "Building type", value: "Multi-let studios & offices" },
    { label: "Floors", value: "4 (lift access)" },
    { label: "Total units", value: "24" },
    { label: "Access", value: "24/7 fob entry" },
  ],
  amenities: [
    "24/7 access",
    "Staffed reception (weekdays)",
    "Lift to all floors",
    "Shared kitchen",
    "Bookable meeting room",
    "Bike storage",
    "Showers",
    "Superfast broadband",
    "Post handling",
  ],
};

// Synthetic units. vat: true means the price is shown inc. 20% VAT.
const UNITS = [
  { id: "G.02", type: "Studio", sqft: 180, people: "1–2 desks", monthlyEx: 650, vat: true, status: "Available now", features: ["Ground floor", "Street-facing window", "Sink installed", "Own lockable door"] },
  { id: "1.04", type: "Studio", sqft: 240, people: "2–3 desks", monthlyEx: 820, vat: true, status: "Available now", features: ["Natural light", "Air conditioning", "Furnished option", "Near kitchen"] },
  { id: "1.11", type: "Office", sqft: 410, people: "4–6 desks", monthlyEx: 1350, vat: true, status: "Available 1 Jan", features: ["Corner unit", "Dual aspect", "Air conditioning", "Meeting table"] },
  { id: "2.03", type: "Studio", sqft: 300, people: "Up to 4 people", monthlyEx: 975, vat: false, status: "Available now", features: ["High ceilings", "Blackout blinds", "Extra power points"] },
  { id: "3.07", type: "Office", sqft: 620, people: "8–10 desks", monthlyEx: 1980, vat: true, status: "Under offer", features: ["Top floor", "Private kitchenette", "Air conditioning", "Lift lobby access"] },
  { id: "3.09", type: "Studio", sqft: 150, people: "1 desk", monthlyEx: 540, vat: true, status: "Available now", features: ["Quiet rear side", "Furnished", "Ideal for one person"] },
];

const OPEN_DECISIONS = [
  {
    title: "How is a room booked or enquired about?",
    detail:
      "Options: an enquiry form/message to the building manager, a viewing request, or direct booking with payment like other VenCome spaces. The buttons on the unit cards are disabled until this is decided.",
  },
  {
    title: "Who maintains availability?",
    detail:
      "The client's team, VenCome admins, or an automatic sync. This decides who marks a unit as let, under offer or available, and how quickly the page reflects it.",
  },
  {
    title: "Manual entry or import from the Sales Vacant Unit Tracker?",
    detail:
      "Units could be typed in by hand per building, or imported from the client's spreadsheet (one-off upload, regular re-upload, or a live link). We need a copy of the tracker to confirm which columns exist.",
  },
  {
    title: "What happens to units that are let or under offer?",
    detail:
      "Hide them, or keep them visible with a badge (as unit 3.07 shows here). Linked to who maintains availability.",
  },
];

const fmt = (n) =>
  new Intl.NumberFormat("en-GB", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const shownPrice = (u) => (u.vat ? Math.round(u.monthlyEx * 1.2 * 100) / 100 : u.monthlyEx);
const lowestPrice = Math.min(...UNITS.filter((u) => u.status !== "Under offer").map(shownPrice));
const availableCount = UNITS.filter((u) => u.status !== "Under offer").length;

const OTHER_RESULTS = [
  { id: "preview-a", title: "Sample treatment room", location: "Placeholder area, London", category: "Treatment Room", price: "£25", priceUnit: "/hr", rating: 4.8, reviewCount: 12, image: photo("Sample space", "#64748B", "#CBD5E1") },
  { id: "preview-b", title: "Sample photography studio", location: "Example district, London", category: "Photo Studio", price: "£40", priceUnit: "/hr", rating: 4.9, reviewCount: 31, badge: "Verified", image: photo("Sample space", "#475569", "#94A3B8") },
  { id: "preview-c", title: "Sample hot desk", location: "Placeholder road, London", category: "Coworking", price: "£180", priceUnit: "/month", rating: 4.6, reviewCount: 8, image: photo("Sample space", "#334155", "#A1A1AA") },
];

function SectionLabel({ step, title, note }) {
  return (
    <div className="mb-5">
      <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#305CDE]">Preview {step}</p>
      <h2 className="mt-1 text-[22px] font-extrabold text-[#0A1628] md:text-[26px]">{title}</h2>
      {note ? <p className="mt-1 max-w-[720px] text-[14px] text-[#6B7280]">{note}</p> : null}
    </div>
  );
}

function BuildingCard({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group h-full w-full text-left transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] border-2 border-[#305CDE] bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition group-hover:shadow-[0_8px_28px_rgba(0,0,0,0.18)]">
        <div className="relative overflow-hidden rounded-[12px]">
          <div className="aspect-[4/3] w-full" />
          <img src={BUILDING.photos[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-3 top-3 z-[2] flex items-center gap-1 rounded-full bg-[#0A1628] px-3 py-[5px] text-[11px] font-bold uppercase tracking-[0.5px] text-white">
            <Building2 size={12} /> Building
          </span>
          <span className="absolute bottom-3 left-3 z-[2] rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white">
            Representative photos · {BUILDING.photos.length}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-2 pb-1 pt-3 sm:px-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5 text-[#6B7280]">
              <MapPin size={12} />
              <span className="truncate text-[13px]">Example Area, London</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Star size={12} className="fill-[#305CDE] text-[#305CDE]" />
              <span className="text-[13px] font-semibold text-[#111827]">4.90</span>
              <span className="text-[12px] text-[#6B7280]">(20)</span>
            </div>
          </div>
          <h3 className="mt-1 text-[15px] font-semibold text-[#111827]">{BUILDING.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-[rgba(48,92,222,0.1)] px-2 py-[3px] text-[11px] font-bold text-[#305CDE]">
              {availableCount} units available
            </span>
            <span className="rounded-md bg-[rgba(10,22,40,0.06)] px-2 py-[3px] text-[11px] font-semibold text-[#0A1628]">Studios</span>
            <span className="rounded-md bg-[rgba(10,22,40,0.06)] px-2 py-[3px] text-[11px] font-semibold text-[#0A1628]">Offices</span>
          </div>
          <p className="mt-2.5">
            <span className="text-[13px] text-[#6B7280]">From </span>
            <span className="text-[16px] font-bold text-[#111827]">£{fmt(lowestPrice)}</span>
            <span className="text-[13px] text-[#6B7280]">/month</span>
          </p>
          <span className="mt-2 text-[13px] font-semibold text-[#305CDE]">View available units →</span>
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "Under offer"
      ? "bg-[#FEF3C7] text-[#92400E]"
      : status === "Available now"
        ? "bg-[#DCFCE7] text-[#166534]"
        : "bg-[rgba(48,92,222,0.1)] text-[#305CDE]";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${style}`}>{status}</span>;
}

function UnitCard({ unit }) {
  const price = shownPrice(unit);
  return (
    <div className="flex h-full flex-col rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6B7280]">{unit.type}</p>
          <h3 className="text-[18px] font-extrabold text-[#0A1628]">Unit {unit.id}</h3>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      <p className="mt-3">
        <span className="text-[22px] font-extrabold text-[#111827]">£{fmt(price)}</span>
        <span className="text-[13px] text-[#6B7280]">/month{unit.vat ? " inc. VAT" : ""}</span>
      </p>
      <p className="text-[12px] text-[#6B7280]">
        {unit.vat ? `£${fmt(unit.monthlyEx)} ex VAT` : "No VAT charged on this unit"}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[13px] text-[#374151]">
        <div className="flex items-center gap-2 rounded-[10px] bg-[#F8F9FB] px-3 py-2">
          <Ruler size={14} className="text-[#305CDE]" /> {unit.sqft} sq ft
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-[#F8F9FB] px-3 py-2">
          <Users size={14} className="text-[#305CDE]" /> {unit.people}
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-1.5">
        {unit.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[#374151]">
            <Check size={14} className="shrink-0 text-[#16A34A]" /> {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        title="Preview only: booking/enquiry flow not decided yet"
        className="mt-5 w-full cursor-not-allowed rounded-[10px] bg-[#0A1628] px-4 py-3 text-[14px] font-semibold text-white opacity-50"
      >
        Enquire about this unit
      </button>
    </div>
  );
}

function BuildingPage() {
  const [main, ...rest] = BUILDING.photos;
  return (
    <div>
      {/* Gallery */}
      <div className="relative">
        <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2">
          <img src={main} alt="Representative photo: building exterior" className="aspect-[4/3] w-full rounded-[14px] object-cover md:col-span-2 md:row-span-2 md:h-full" />
          {rest.map((src, i) => (
            <img key={i} src={src} alt="Representative photo" className="hidden aspect-[4/3] w-full rounded-[14px] object-cover md:block" />
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[13px] text-[#1E3A8A]">
          <Info size={16} className="mt-[1px] shrink-0" />
          <span>
            <strong>Representative photos.</strong> These images show the building and a typical studio. Individual units may differ in layout, size and finish.
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-1.5 text-[14px] text-[#6B7280]">
            <MapPin size={14} /> {BUILDING.address}
          </div>
          <h1 className="mt-1 text-[26px] font-extrabold text-[#0A1628] md:text-[32px]">{BUILDING.name}</h1>
          <p className="mt-3 text-[15px] leading-7 text-[#374151]">{BUILDING.summary}</p>

          <div className="border-b border-[#E5E7EB] py-6">
            <h2 className="text-[20px] font-bold text-[#0A1628]">Building amenities</h2>
            <ul className="mt-5 grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {BUILDING.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-[14px] text-[#374151]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]">
                    <Check size={12} />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="h-fit rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
          <h2 className="text-[16px] font-bold text-[#0A1628]">Building details</h2>
          <dl className="mt-3 space-y-2.5 text-[14px]">
            {BUILDING.facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-3">
                <dt className="text-[#6B7280]">{f.label}</dt>
                <dd className="text-right font-semibold text-[#111827]">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-[12px] bg-[#0A1628] p-4 text-white">
            <p className="text-[13px] text-white/70">Available now or soon</p>
            <p className="text-[20px] font-extrabold">{availableCount} units</p>
            <p className="text-[13px] text-white/70">from £{fmt(lowestPrice)}/month</p>
          </div>
        </aside>
      </div>

      {/* Units */}
      <div className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#0A1628]">Available units</h2>
            <p className="text-[13px] text-[#6B7280]">Placeholder units. Real data will come from the Sales Vacant Unit Tracker.</p>
          </div>
          <span className="text-[13px] font-semibold text-[#6B7280]">{UNITS.length} units shown</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((u) => (
            <UnitCard key={u.id} unit={u} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BuildingListingPreview() {
  const [params] = useSearchParams();
  const buildingOnly = params.get("view") === "building";

  // Used inside the mobile phone frame below: just the building page.
  if (buildingOnly) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] px-4 py-5">
        <BuildingPage />
      </div>
    );
  }

  const openBuilding = () => document.getElementById("building-page")?.scrollIntoView({ behavior: "smooth" });
  // The sample result cards link to /property/:id; stop that in the preview.
  const blockLinks = (e) => {
    if (e.target.closest("a")) e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo-blue.png" alt="VenCome" className="h-[38px] w-auto object-contain" />
            <span className="text-[15px] font-bold text-[#0A1628]">Building listings: design preview</span>
          </div>
          <span className="rounded-full bg-[#305CDE] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.5px] text-white">
            Preview · sample data only
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <p className="mt-6 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-[13px] text-[#92400E]">
          This page is a visual mock-up for review. Every building, unit, price and photo is a placeholder, and nothing here can be booked.
        </p>

        <section className="py-10">
          <SectionLabel
            step="1"
            title="The building card in search results"
            note="One card per building or site, shown among normal listings. It shows how many units are available and the lowest monthly price. Click it to jump to the building page."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" onClickCapture={blockLinks}>
            <PropertyCard {...OTHER_RESULTS[0]} />
            <BuildingCard onOpen={openBuilding} />
            <PropertyCard {...OTHER_RESULTS[1]} />
            <PropertyCard {...OTHER_RESULTS[2]} />
          </div>
        </section>

        <section id="building-page" className="border-t border-[#E5E7EB] py-10">
          <SectionLabel
            step="2"
            title="The building page"
            note="Representative photo gallery (clearly labelled), building details and amenities, then a card for each available unit. Unit cards have no photos."
          />
          <BuildingPage />
        </section>

        <section className="border-t border-[#E5E7EB] py-10">
          <SectionLabel step="3" title="Mobile layout" note="The same building page on a phone-sized screen. Scroll inside the frame." />
          <div className="flex justify-center">
            <div className="rounded-[40px] border-[10px] border-[#0A1628] bg-[#0A1628] shadow-[0_12px_40px_rgba(10,22,40,0.25)]">
              <iframe
                src="/preview/building-listing?view=building"
                title="Mobile preview of the building page"
                className="block h-[720px] w-[375px] max-w-[calc(100vw-60px)] rounded-[30px] bg-white"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-[#E5E7EB] py-10">
          <SectionLabel step="4" title="Open decisions for the client" note="These are not decided in this preview. We need your answers before building the real feature." />
          <ol className="grid gap-4 md:grid-cols-2">
            {OPEN_DECISIONS.map((d, i) => (
              <li key={d.title} className="rounded-[18px] border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#305CDE] text-[13px] font-bold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0A1628]">{d.title}</h3>
                    <p className="mt-1 text-[14px] leading-6 text-[#374151]">{d.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
