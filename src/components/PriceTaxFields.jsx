import { useEffect, useState } from "react";
import { buildUnitTax, quote } from "../utils/vatPricing";
import { vatPayload } from "../utils/vatForm";

// VAT status, VAT rate and utilities for one price option (per hour / day /
// week / month) in the listing form, with a live calculator of what the
// customer pays and the host's payout. Used by CreateSpace and EditSpace.
// `value` is the option's form state: { price, vatStatus, vatRate,
// utilitiesAmount, utilitiesPer, utilitiesVatable }.

const RATE_KEY = { hour: "hourly", day: "daily", week: "weekly", month: "monthly" };
let ratesRequest;
const loadRates = () => {
  ratesRequest ||= fetch(`${import.meta.env.VITE_API_URL}/properties/commission-rates`)
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
  return ratesRequest;
};

const gbp = (p) => `£${(p / 100).toFixed(2)}`;

const fieldStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function PriceTaxFields({ value = {}, onChange, unit }) {
  const [rates, setRates] = useState(null);
  useEffect(() => {
    let alive = true;
    loadRates().then((data) => alive && setRates(data));
    return () => {
      alive = false;
    };
  }, []);

  const vatApplies = value.vatStatus === "excludes" || value.vatStatus === "includes";
  const payload = vatPayload(value);
  const tax = payload ? buildUnitTax(payload) : null;
  const commissionPct = rates?.[RATE_KEY[unit]];
  const q = tax
    ? quote({
        corePence: tax.netPence,
        quantity: 1,
        tax,
        commissionRate: (commissionPct ?? 0) / 100,
        commissionBase: rates?.base,
      })
    : null;

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 180px" }}>
          <label style={labelStyle}>VAT status</label>
          <select value={value.vatStatus || ""} onChange={(e) => onChange({ vatStatus: e.target.value })} style={fieldStyle}>
            <option value="" disabled>
              Choose…
            </option>
            <option value="excludes">Price excludes VAT</option>
            <option value="includes">Price includes VAT</option>
            <option value="none">Not VAT registered (no VAT)</option>
          </select>
        </div>
        {vatApplies && (
          <div style={{ flex: "1 1 90px" }}>
            <label style={labelStyle}>VAT rate %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={value.vatRate ?? 20}
              onChange={(e) => onChange({ vatRate: e.target.value })}
              onWheel={(e) => e.target.blur()}
              style={fieldStyle}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 120px" }}>
          <label style={labelStyle}>Utilities charge (optional)</label>
          <input
            type="number"
            min="0"
            placeholder="£0"
            value={value.utilitiesAmount || ""}
            onChange={(e) => onChange({ utilitiesAmount: e.target.value })}
            onWheel={(e) => e.target.blur()}
            style={fieldStyle}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <select value={value.utilitiesPer || "unit"} onChange={(e) => onChange({ utilitiesPer: e.target.value })} style={fieldStyle}>
            <option value="unit">per {unit}</option>
            <option value="booking">one-off per booking</option>
          </select>
        </div>
        {vatApplies && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#374151", flex: "1 1 160px" }}>
            <input
              type="checkbox"
              checked={value.utilitiesVatable !== false}
              onChange={(e) => onChange({ utilitiesVatable: e.target.checked })}
            />
            Utilities subject to VAT
          </label>
        )}
      </div>

      {q && (
        <div style={{ background: "#F5F7FF", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#374151" }}>
          {[
            ["Core price (ex VAT)", q.corePence],
            ...(q.utilitiesPence ? [[`Utilities (ex VAT)${value.utilitiesPer === "booking" ? ", per booking" : ""}`, q.utilitiesPence]] : []),
            ...(q.vatStatus !== "none" ? [[`VAT at ${q.vatRatePct}%`, q.vatPence]] : []),
          ].map(([label, amount]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
              <span>{label}</span>
              <span>{gbp(amount)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 2px", marginTop: 4, borderTop: "1px solid #E0E7FF", fontWeight: 700, color: "#0A1628" }}>
            <span>Customer pays, per {unit}</span>
            <span>{gbp(q.totalPence)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#166534", fontWeight: 600 }}>
            <span>
              Your payout after VenCome commission{commissionPct != null ? ` (${commissionPct}% of the core price)` : ""}
            </span>
            <span>{commissionPct != null ? gbp(q.hostPayoutPence) : "…"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
