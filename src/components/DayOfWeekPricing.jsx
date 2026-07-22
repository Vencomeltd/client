import { useState } from "react";

const DAYS = [
  { day: 0, label: "Sunday" },
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
];

const WEEKEND_DAYS = [0, 6]; // Saturday + Sunday

// Shared between CreateSpace.jsx and EditSpace.jsx (both use the same
// { hourly: {enabled, price}, daily: {enabled, price}, ... } pricing shape).
// EditPropertyModal.jsx uses a different, older pricing shape entirely and
// has its own separate implementation of this same idea.
export default function DayOfWeekPricing({ enabled, customDayPricing, onChange }) {
  const [quickSetValue, setQuickSetValue] = useState("");

  const rateFor = (day) => customDayPricing.find((d) => d.day === day)?.rate ?? "";

  const setRate = (day, value) => {
    const rate = value === "" ? null : Number(value);
    const next = customDayPricing.filter((d) => d.day !== day);
    if (rate !== null && !isNaN(rate) && rate >= 0) {
      next.push({ day, rate });
    }
    onChange({ customDayPricing: next });
  };

  const applyQuickSetWeekend = () => {
    const rate = Number(quickSetValue);
    if (!quickSetValue || isNaN(rate) || rate < 0) return;
    const next = customDayPricing.filter((d) => !WEEKEND_DAYS.includes(d.day));
    WEEKEND_DAYS.forEach((day) => next.push({ day, rate }));
    onChange({ customDayPricing: next });
  };

  return (
    <div style={{ marginTop: "24px", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "20px" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => onChange({ customDayPricingEnabled: !enabled })}
      >
        <div>
          <p style={{ fontWeight: "700", color: "#0A1628", fontSize: "15px", margin: 0 }}>
            Charge different prices for different days
          </p>
          <p style={{ color: "#6B7280", fontSize: "13px", margin: "2px 0 0" }}>
            e.g. a higher rate for Friday/Saturday/Sunday than a weekday
          </p>
        </div>
        <button
          type="button"
          aria-label={enabled ? "Disable day-of-week pricing" : "Enable day-of-week pricing"}
          onClick={(e) => {
            e.stopPropagation();
            onChange({ customDayPricingEnabled: !enabled });
          }}
          style={{
            width: "48px", height: "26px", borderRadius: "9999px",
            background: enabled ? "#0A1628" : "#E5E7EB",
            border: "none", cursor: "pointer", position: "relative",
            transition: "background 0.2s ease", flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute", top: "3px",
              left: enabled ? "25px" : "3px",
              width: "20px", height: "20px", borderRadius: "50%",
              background: "#fff", transition: "left 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: "20px" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>Quick-set weekend (Sat + Sun) rate:</span>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>£</span>
            <input
              type="number"
              min="0"
              placeholder="e.g. 180"
              value={quickSetValue}
              onChange={(e) => setQuickSetValue(e.target.value)}
              style={{
                width: "100px", padding: "8px 10px", borderRadius: "8px",
                border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none",
              }}
            />
            <button
              type="button"
              onClick={applyQuickSetWeekend}
              style={{
                padding: "8px 14px", borderRadius: "8px", border: "none",
                background: "#0A1628", color: "#fff", fontSize: "13px",
                fontWeight: "600", cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>

          {DAYS.map(({ day, label }) => (
            <div
              key={day}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: day !== 6 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <span style={{ fontSize: "14px", color: "#0A1628" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>£</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Base rate"
                  value={rateFor(day)}
                  onChange={(e) => setRate(day, e.target.value)}
                  style={{
                    width: "110px", padding: "8px 10px", borderRadius: "8px",
                    border: "1.5px solid #E5E7EB", fontSize: "14px", outline: "none",
                    textAlign: "right",
                  }}
                />
              </div>
            </div>
          ))}
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "10px", marginBottom: 0 }}>
            Leave a day blank to use the base rate above.
          </p>
        </div>
      )}
    </div>
  );
}
