import { useState } from "react";
import apiFetch from "../utils/apiClient";

// Shared "change email" control used on both host pages (Profile.jsx,
// Settings.jsx) and the customer profile page. Reuses the existing
// POST /settings/email/request-change + /verify-change flow -- unchanged,
// this component just gives it one implementation instead of three.
export default function EmailField({ value, onChanged, labelStyle, inputStyle }) {
  const [step, setStep] = useState("idle"); // idle | form | otp
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("idle");
    setNewEmail("");
    setCurrentPassword("");
    setOtp("");
    setLoading(false);
    setError("");
  };

  const handleRequestCode = async () => {
    if (!newEmail || !currentPassword) {
      setError("Please fill in both fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/settings/email/request-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request email change");
      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to request email change");
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/settings/email/verify-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      onChanged?.(data.user.email);
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
      <label style={label}>Email Address</label>

      {step === "idle" && (
        <>
          <input style={{ ...field, background: "#F9FAFB", color: "#6B7280" }} value={value || ""} disabled />
          <button
            type="button"
            onClick={() => setStep("form")}
            style={{ marginTop: "6px", background: "none", border: "none", padding: 0, color: "#2E58EC", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
          >
            Change email
          </button>
        </>
      )}

      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            style={field}
            placeholder="New email address"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setError(""); }}
          />
          <input
            type="password"
            style={field}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
          />
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
            Enter the code sent to <strong>{newEmail}</strong>
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
              {loading ? "Verifying..." : "Confirm Email"}
            </button>
            <button type="button" onClick={reset} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
