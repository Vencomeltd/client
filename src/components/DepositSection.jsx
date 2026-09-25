// Listing-form deposit setting for payments v2. When the platform has v2
// enabled this replaces the legacy "Require a security deposit" block (passed
// in as children); when it's off, the children render exactly as before.
// Hosts only choose whether to require a deposit and how much -- the type is
// always a card hold behind the scenes, and nothing about how it's collected
// is explained here.
import { useEffect, useState } from "react";

let cachedFlag = null;

export function usePaymentsV2() {
  const [enabled, setEnabled] = useState(cachedFlag ?? false);

  useEffect(() => {
    if (cachedFlag !== null) return;
    fetch(`${import.meta.env.VITE_API_URL}/platform-settings`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        cachedFlag = Boolean(data.paymentsV2);
        setEnabled(cachedFlag);
      })
      .catch(() => {});
  }, []);

  return enabled;
}

export const EMPTY_DEPOSIT_POLICY = { mode: "none", amount: "", longStayFallback: "none" };

// Form state -> the JSON the server expects (integer pence).
export const depositPolicyPayload = (policy = EMPTY_DEPOSIT_POLICY) => ({
  mode: policy.mode,
  amountPence: policy.mode === "none" ? 0 : Math.round((parseFloat(policy.amount) || 0) * 100),
  longStayFallback: policy.longStayFallback,
});

// Saved listing (pence) -> form state.
export const depositPolicyFromListing = (saved) => ({
  mode: saved?.mode || "none",
  amount: saved?.amountPence ? String(saved.amountPence / 100) : "",
  longStayFallback: saved?.longStayFallback || "none",
});

export default function DepositSection({ value = EMPTY_DEPOSIT_POLICY, onChange, children }) {
  const paymentsV2 = usePaymentsV2();
  if (!paymentsV2) return children;

  const enabled = value.mode !== "none";
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div style={{ marginTop: 24, border: "1.5px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => set({ mode: e.target.checked ? "card_hold" : "none" })}
        />
        <p style={{ fontWeight: 700, color: "#0A1628", fontSize: 15, margin: 0 }}>Require a security deposit</p>
      </label>

      {enabled && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#0A1628" }}>
            Deposit amount (£)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 100"
            value={value.amount}
            onChange={(e) => set({ amount: e.target.value })}
            onWheel={(e) => e.target.blur()}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none", background: "#fff" }}
          />
        </div>
      )}
    </div>
  );
}
