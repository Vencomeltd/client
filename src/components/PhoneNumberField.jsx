import { useState } from "react";
import { Check, ShieldAlert } from "lucide-react";
import apiFetch from "../utils/apiClient";

// Shared "change phone number" control used on both host pages (Profile.jsx,
// Settings.jsx) and the customer profile page. Phone numbers can only be set
// through this SMS-OTP flow -- there is no direct-edit path server-side, see
// POST /settings/phone/request-change + /verify-change.
export default function PhoneNumberField({ value, verified, onVerified, labelStyle, inputStyle }) {
  const [step, setStep] = useState("idle"); // idle | form | otp
  const [newPhone, setNewPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("idle");
    setNewPhone("");
    setOtp("");
    setLoading(false);
    setError("");
  };

  const handleRequestCode = async () => {
    if (!newPhone.trim()) {
      setError("Please enter a phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/settings/phone/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: newPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");
      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to send verification code");
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/settings/phone/verify-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      onVerified?.(data.user.phoneNumber, data.user.isPhoneVerified);
      reset();
    } catch (err) {
      setError(err.message || "Invalid or expired code");
      setLoading(false);
    }
  };

  const label = labelStyle || { fontSize: "13px", fontWeight: "700", color: "#0A1628", display: "block", marginBottom: "8px" };
  const field = inputStyle || {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1.5px solid #E5E7EB", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
  };
  const btnPrimary = { padding: "10px 18px", borderRadius: "10px", border: "none", background: loading ? "#9CA3AF" : "#2E58EC", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" };
  const btnSecondary = { padding: "10px 18px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: "600", cursor: "pointer" };

  return (
    <div>
      <label style={label}>Phone Number</label>

      {step === "idle" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input style={{ ...field, background: "#F9FAFB", color: "#6B7280" }} value={value || ""} disabled placeholder="Not set" />
            {value ? (
              verified ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16A34A", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
                  <Check size={14} /> Verified
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#D97706", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
                  <ShieldAlert size={14} /> Unverified
                </span>
              )
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setStep("form")}
            style={{ marginTop: "6px", background: "none", border: "none", padding: 0, color: "#2E58EC", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
          >
            {value ? "Change phone number" : "Add phone number"}
          </button>
        </>
      )}

      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="tel"
            style={field}
            placeholder="+44 7700 900000"
            value={newPhone}
            onChange={(e) => { setNewPhone(e.target.value); setError(""); }}
          />
          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
            Use international format, including the country code.
          </p>
          {error && <p style={{ fontSize: "12px", color: "#DC2626", margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleRequestCode} disabled={loading} style={btnPrimary}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
            <button type="button" onClick={reset} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
            Enter the code sent to <strong>{newPhone}</strong>
          </p>
          <input
            type="text"
            style={field}
            placeholder="6-digit code"
            maxLength={6}
            value={otp}
            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
          />
          {error && <p style={{ fontSize: "12px", color: "#DC2626", margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleVerifyCode} disabled={loading} style={btnPrimary}>
              {loading ? "Verifying..." : "Confirm Number"}
            </button>
            <button type="button" onClick={reset} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
