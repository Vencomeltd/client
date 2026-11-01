// A lease month (monthly-instalment lease, server utils/paymentsV2/lease.js)
// on the booking page: which month this is, whether it's paid or when it will
// be charged, and -- for the guest, when a payment failed -- a way to add a
// new card, which is charged straight away. Renders nothing for other bookings.
import { useState } from "react";
import { CalendarClock, CreditCard } from "lucide-react";
import { apiFetch } from "../utils/api";
import { UpdateCardForm } from "./PaymentForms";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

const card = { background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", padding: 24, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" };
const primaryBtn = { padding: "10px 16px", borderRadius: 10, border: "none", background: "#305CDE", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };

function describe(booking, isHost) {
  const { lease } = booking;
  if (booking.isPaid) return isHost ? "The guest has paid this month." : "This month is paid.";
  if (lease.index === 1) return isHost ? "Paid when the guest's booking is confirmed." : "Paid at checkout.";
  switch (lease.chargeStatus) {
    case "scheduled":
      return `${isHost ? "The guest's card" : "Your card"} will be charged on ${fmtDate(lease.chargeAt)}.`;
    case "failed":
      return isHost
        ? "The payment for this month didn't go through. We're retrying daily and have asked the guest to update their card."
        : "We couldn't take the payment for this month. We're retrying daily — or add a new card now and we'll charge it straight away.";
    case "awaiting_decision":
      return isHost
        ? "This month is still unpaid after several retries. VenCome will contact you about next steps."
        : "This month is still unpaid. Please add a new card, or contact VenCome.";
    case "stopped":
      return "The lease was ended before this month, so it won't be charged.";
    default:
      return "";
  }
}

export default function LeasePanel({ booking, isHost, onUpdate, showToast }) {
  const lease = booking?.lease;
  const [busy, setBusy] = useState(false);
  const [cardSecret, setCardSecret] = useState(null);
  if (!lease?.months) return null;

  const needsCard = !isHost && !booking.isPaid && ["failed", "awaiting_decision"].includes(lease.chargeStatus);
  const endpoint = `/bookings/lease/${booking.groupId}/update-card`;

  const startCardUpdate = async () => {
    setBusy(true);
    try {
      const data = await apiFetch({ endpoint, method: "POST", body: {}, showErrorToast: false });
      setCardSecret(data.clientSecret);
    } catch (err) {
      showToast?.(err.message || "Something went wrong.", "error");
    } finally {
      setBusy(false);
    }
  };

  const finishCardUpdate = async (setupIntentId) => {
    const data = await apiFetch({ endpoint, method: "POST", body: { setupIntentId }, showErrorToast: false });
    setCardSecret(null);
    const fresh = await apiFetch({ endpoint: `/bookings/${booking._id}`, showErrorToast: false });
    onUpdate({ lease: fresh.lease, isPaid: fresh.isPaid, payment: fresh.payment });
    showToast?.(data.error || "Card saved. Your monthly payments will use it from now on.", data.error ? "error" : undefined);
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#94A3B8", textTransform: "uppercase", margin: 0 }}>Lease</p>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", background: "#EFF6FF", borderRadius: 999, padding: "4px 10px" }}>
          Month {lease.index} of {lease.months}
        </span>
      </div>
      <p style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, color: "#475569", margin: 0, lineHeight: 1.5 }}>
        <CalendarClock size={16} color="#305CDE" style={{ flexShrink: 0, marginTop: 2 }} />
        {describe(booking, isHost)}
      </p>
      {lease.index <= lease.minimumMonths && (
        <p style={{ fontSize: 12, color: "#64748B", margin: "10px 0 0" }}>
          This month is inside the {lease.minimumMonths}-month minimum term, so it can't be cancelled online. To end the lease
          early, please contact VenCome.
        </p>
      )}
      {needsCard && (
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
    </div>
  );
}
