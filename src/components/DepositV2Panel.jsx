// Deposit status + actions for a payments v2 booking, shown on the booking
// page. Guests see their deposit state and can replace a card that failed the
// hold; hosts can decide what to do when the guest didn't fix their card, and
// open a damage claim after checkout. Renders nothing for bookings without a
// v2 deposit.
import { useState } from "react";
import { AlertTriangle, CreditCard, ShieldCheck } from "lucide-react";
import { apiFetch } from "../utils/api";
import { UpdateCardForm } from "./PaymentForms";

const gbp = (pence) => `£${(Number(pence || 0) / 100).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "");

const BADGES = {
  not_required: { label: "No deposit", color: "#6B7280", bg: "#F3F4F6" },
  scheduled: { label: "Hold scheduled", color: "#1D4ED8", bg: "#EFF6FF" },
  held: { label: "Deposit held", color: "#047857", bg: "#ECFDF5" },
  awaiting_new_card: { label: "Card needed", color: "#B45309", bg: "#FFFBEB" },
  awaiting_host_decision: { label: "Host decision needed", color: "#B45309", bg: "#FFFBEB" },
  waived: { label: "Deposit waived", color: "#6B7280", bg: "#F3F4F6" },
  released: { label: "Deposit released", color: "#047857", bg: "#ECFDF5" },
  captured: { label: "Deposit taken", color: "#B91C1C", bg: "#FEF2F2" },
  partially_captured: { label: "Part of deposit taken", color: "#B91C1C", bg: "#FEF2F2" },
  charged: { label: "Deposit charged", color: "#1D4ED8", bg: "#EFF6FF" },
  refunded: { label: "Deposit refunded", color: "#047857", bg: "#ECFDF5" },
  failed: { label: "Deposit unavailable", color: "#B91C1C", bg: "#FEF2F2" },
};

function describe(dh, isHost) {
  const amount = gbp(dh.amountPence);
  const who = isHost ? "the guest's card" : "your card";
  switch (dh.status) {
    case "not_required":
      return "No deposit applies to this booking.";
    case "scheduled":
      return `A ${amount} hold will be placed on ${who} on ${fmtDate(dh.holdAt)}. ${isHost ? "" : "You're only charged if the host reports damage."}`;
    case "held":
      return `${amount} is held on ${who}. ${isHost ? "You can report damage for a limited time after checkout (24 hours)." : "You're only charged if the host reports damage; otherwise it's released after your stay."}`;
    case "awaiting_new_card":
      return isHost
        ? `The ${amount} hold couldn't be placed. The guest has until ${fmtDate(dh.cardFixDeadline)} to add a new card.`
        : `We couldn't place the ${amount} hold on your card. Please add a new card before ${fmtDate(dh.cardFixDeadline)}.`;
    case "awaiting_host_decision":
      return isHost
        ? "The guest didn't fix their card in time. Choose to continue without a deposit, or cancel the booking."
        : "We're waiting on the host to decide how to proceed without a deposit.";
    case "waived":
      return "The host chose to proceed without a deposit.";
    case "released":
      return isHost ? "The hold was released." : "Your deposit hold was released. You were not charged.";
    case "captured":
    case "partially_captured":
      return `${gbp(dh.capturedPence)} of the deposit was taken following an approved damage claim.`;
    case "charged":
      return isHost
        ? `${amount} was charged at booking and is refunded after the claim window unless you report damage.`
        : `${amount} was charged at booking and is refunded after your stay unless the host reports damage.`;
    case "refunded":
      return "The deposit was refunded.";
    default:
      return "";
  }
}

const card = { background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };
const primaryBtn = { padding: "10px 16px", borderRadius: 10, border: "none", background: "#305CDE", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const ghostBtn = { padding: "10px 16px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: "#334155", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" };

export default function DepositV2Panel({ booking, isHost, onUpdate, showToast }) {
  const dh = booking?.depositHold;
  const claim = booking?.damageClaim;
  const [busy, setBusy] = useState(false);
  const [cardSecret, setCardSecret] = useState(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!dh?.status) return null;

  const badge = BADGES[dh.status] || BADGES.not_required;
  const afterCheckout = new Date() >= new Date(booking.checkOut);
  const canClaim = isHost && afterCheckout && ["held", "charged"].includes(dh.status) && (!claim?.status || claim.status === "none");
  const endpoint = (path) => `/bookings/${booking._id}${path}`;

  const refresh = async () => {
    const fresh = await apiFetch({ endpoint: `/bookings/${booking._id}`, showErrorToast: false });
    onUpdate({ depositHold: fresh.depositHold, damageClaim: fresh.damageClaim, status: fresh.status });
  };

  const run = async (fn, successMessage) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
      if (successMessage) showToast?.(successMessage);
    } catch (err) {
      showToast?.(err.message || "Something went wrong.", "error");
    } finally {
      setBusy(false);
    }
  };

  const startCardUpdate = () =>
    run(async () => {
      const data = await apiFetch({ endpoint: endpoint("/deposit/update-card"), method: "POST", body: {}, showErrorToast: false });
      setCardSecret(data.clientSecret);
    });

  const finishCardUpdate = async (setupIntentId) => {
    await apiFetch({ endpoint: endpoint("/deposit/update-card"), method: "POST", body: { setupIntentId }, showErrorToast: false });
    setCardSecret(null);
    await refresh();
    showToast?.("Card saved. Your deposit hold has been placed.");
  };

  const decide = (decision) => {
    if (decision === "cancel" && !window.confirm("Cancel this booking? The guest will be refunded according to the cancellation policy.")) return;
    run(
      () => apiFetch({ endpoint: endpoint("/deposit/host-decision"), method: "POST", body: { decision }, showErrorToast: false }),
      decision === "cancel" ? "Booking cancelled." : "Continuing without a deposit."
    );
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      setPhotoUrl(data.url);
    } catch {
      showToast?.("Failed to upload photo. Try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const submitClaim = () => {
    const amountPence = Math.round((parseFloat(amount) || 0) * 100);
    run(async () => {
      await apiFetch({
        endpoint: endpoint("/claims"),
        method: "POST",
        body: { amountPence, reason: reason.trim(), evidenceUrls: [photoUrl] },
        showErrorToast: false,
      });
      setClaimOpen(false);
    }, "Claim opened. VenCome will review it.");
  };

  const claimCopy =
    claim?.status === "open"
      ? `Damage claim of ${gbp(claim.amountPence)} is being reviewed by VenCome.`
      : claim?.status === "approved"
      ? `Damage claim approved for ${gbp(claim.approvedAmountPence)}.`
      : claim?.status === "rejected"
      ? "Damage claim was reviewed and rejected. No deposit money was taken."
      : "";

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>Deposit</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: badge.color, background: badge.bg, borderRadius: 999, padding: "4px 10px" }}>{badge.label}</span>
      </div>

      <p style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.5 }}>
        <ShieldCheck size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
        {describe(dh, isHost)}
      </p>
      {claimCopy && <p style={{ fontSize: 13, color: "#B45309", background: "#FFFBEB", borderRadius: 10, padding: "10px 12px", marginTop: 12 }}>{claimCopy}</p>}

      {!isHost && dh.status === "awaiting_new_card" && (
        <div style={{ marginTop: 16 }}>
          {cardSecret ? (
            <UpdateCardForm clientSecret={cardSecret} onConfirmed={finishCardUpdate} />
          ) : (
            <button type="button" onClick={startCardUpdate} disabled={busy} style={primaryBtn}>
              <CreditCard size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
              Add a new card
            </button>
          )}
        </div>
      )}

      {isHost && dh.status === "awaiting_host_decision" && (
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button type="button" onClick={() => decide("proceed_without_deposit")} disabled={busy} style={primaryBtn}>
            Continue without a deposit
          </button>
          <button type="button" onClick={() => decide("cancel")} disabled={busy} style={{ ...ghostBtn, color: "#DC2626", borderColor: "#FECACA" }}>
            Cancel booking
          </button>
        </div>
      )}

      {canClaim && !claimOpen && (
        <button type="button" onClick={() => setClaimOpen(true)} style={{ ...ghostBtn, marginTop: 16, color: "#B45309", borderColor: "#FDE68A" }}>
          <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
          Report damage
        </button>
      )}

      {canClaim && claimOpen && (
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Amount to claim (£, up to {gbp(dh.amountPence)})</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>What was damaged?</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={2000} style={{ ...input, resize: "none" }} />
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Photo evidence</label>
          <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} style={{ display: "block", marginBottom: 12, fontSize: 13 }} />
          {photoUrl && <img src={photoUrl} alt="Claim evidence" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 12 }} />}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setClaimOpen(false)} disabled={busy} style={ghostBtn}>Cancel</button>
            <button
              type="button"
              onClick={submitClaim}
              disabled={busy || uploading || !photoUrl || reason.trim().length < 5 || !(parseFloat(amount) > 0)}
              style={{ ...primaryBtn, background: "#B45309", opacity: busy || uploading || !photoUrl || reason.trim().length < 5 || !(parseFloat(amount) > 0) ? 0.6 : 1 }}
            >
              {busy ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
