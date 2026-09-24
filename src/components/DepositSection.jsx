// Listing-form deposit settings for payments v2. When the platform has v2
// enabled this replaces the legacy "Require a security deposit" block (passed
// in as children); when it's off, the children render exactly as before.
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

const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#0A1628" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none", background: "#fff" };

export default function DepositSection({ value = EMPTY_DEPOSIT_POLICY, onChange, children }) {
  const paymentsV2 = usePaymentsV2();
  if (!paymentsV2) return children;

  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div style={{ marginTop: 24, border: "1.5px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
      <p style={{ fontWeight: 700, color: "#0A1628", fontSize: 15, margin: 0 }}>Damage deposit</p>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "2px 0 14px" }}>
        Protect your space. Guests are only charged if you report damage.
      </p>

      <label style={labelStyle}>Deposit type</label>
      <select value={value.mode} onChange={(e) => set({ mode: e.target.value })} style={inputStyle}>
        <option value="none">No deposit</option>
        <option value="card_hold">Card hold (recommended) — held on the guest's card, not taken</option>
        <option value="charged">Charged deposit — taken at booking, refunded after the stay</option>
      </select>

      {value.mode !== "none" && (
        <>
          <label style={{ ...labelStyle, marginTop: 14 }}>Deposit amount (£)</label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 100"
            value={value.amount}
            onChange={(e) => set({ amount: e.target.value })}
            onWheel={(e) => e.target.blur()}
            style={inputStyle}
          />
        </>
      )}

      {value.mode === "charged" && (
        <p style={{ color: "#92400E", background: "#FFF7ED", borderRadius: 8, padding: "10px 12px", fontSize: 12, marginTop: 12 }}>
          A charged deposit only applies to bookings over £200. Smaller bookings take no deposit.
        </p>
      )}

      {value.mode === "card_hold" && (
        <>
          <p style={{ color: "#6B7280", fontSize: 12, marginTop: 12 }}>
            The hold is placed on the guest's card 48 to 72 hours before check-in. You have 24 hours after checkout to report damage.
          </p>
          <label style={{ ...labelStyle, marginTop: 14 }}>If a stay is too long for a card hold to cover</label>
          <select value={value.longStayFallback} onChange={(e) => set({ longStayFallback: e.target.value })} style={inputStyle}>
            <option value="none">Take no deposit</option>
            <option value="charged">Charge the deposit instead (bookings over £200 only)</option>
          </select>
        </>
      )}
    </div>
  );
}
