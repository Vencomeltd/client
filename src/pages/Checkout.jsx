import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import { PaymentElementForm } from "../components/PaymentForms";

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error("VITE_STRIPE_PUBLISHABLE_KEY is not set — checkout will not work.");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UNIT_WORD = { hour: "hour", day: "night", week: "week", month: "month", year: "year" };

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Payments v2 checkout (PaymentIntent + Payment Element); null = legacy embedded checkout.
  const [v2, setV2] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("vencome_token");
        const bookingRes = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bookingRes.ok) throw new Error("Booking not found");
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        const propertyRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/${bookingData.property}`);
        const propertyData = await propertyRes.json();
        setProperty(propertyData.property || propertyData);

        // Stripe redirected back here with a completed session instead of
        // firing onComplete inline (happens when a redirect-based step like
        // 3D Secure was needed) -- confirm it actually completed, then go
        // straight to the success page instead of starting a new checkout.
        const existingSessionId = new URLSearchParams(window.location.search).get("session_id");
        if (existingSessionId) {
          const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/payments/session-status/${existingSessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const statusData = await statusRes.json();
          if (statusRes.ok && statusData.status === "complete") {
            navigate(`/property/${bookingData.property}?success=true&bookingId=${bookingData._id}&value=${bookingData.totalPrice}`, { replace: true });
            return;
          }
        }

        // Payments v2: the server answers { enabled: false } (or 404 on an
        // older server) when it's off, and we fall through to legacy checkout.
        const v2Res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}/payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const v2Data = await v2Res.json().catch(() => ({}));
        if (v2Res.ok && v2Data.enabled) {
          setV2(v2Data);
          return;
        }
        if (!v2Res.ok && v2Res.status !== 404) throw new Error(v2Data.error || "Failed to start checkout");

        const sessionRes = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bookingId }),
        });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) throw new Error(sessionData.error || "Failed to start checkout");
        setClientSecret(sessionData.clientSecret);
      } catch (err) {
        setError(err.message || "Something went wrong loading checkout");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, navigate]);

  const options = useMemo(() => {
    if (!clientSecret || !booking) return null;
    return {
      clientSecret,
      // Embedded mode has no success_url/cancel_url -- this is the
      // equivalent for card payments that complete inline (no redirect-based
      // step like 3D Secure needed). Matches the exact query params
      // PropertyDetails.jsx's existing success-modal effect already reads.
      onComplete: () => {
        navigate(`/property/${booking.property}?success=true&bookingId=${booking._id}&value=${booking.totalPrice}`);
      },
    };
  }, [clientSecret, booking, navigate]);

  const durationUnits = booking?.totalUnits ?? booking?.totalNights;
  const durationWord = UNIT_WORD[booking?.pricingUnit] || "night";
  const rentTotal = booking?.totalPrice || 0;
  const depositAmount = booking?.deposit?.amount || 0;

  const v2Deposit = v2?.deposit && v2.deposit.mode !== "none" ? v2.deposit : null;
  const v2DepositGbp = v2Deposit ? (v2Deposit.amountPence / 100).toFixed(2) : null;
  const v2DepositCopy = !v2Deposit
    ? ""
    : v2Deposit.mode === "charged"
    ? `A refundable £${v2DepositGbp} deposit is charged to your card at booking and refunded after your stay unless the host reports damage.`
    : `£${v2DepositGbp} will be held on your card ${v2Deposit.holdLeadHours} to ${v2Deposit.holdLeadHoursMax} hours before check-in. You're only charged if there's damage.`;
  const v2Consent = v2Deposit
    ? `${v2DepositCopy} By paying, you agree that VenCome may save your card to place this ${v2Deposit.mode === "charged" ? "charge" : "hold"}.`
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 20px 40px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0A1628", marginBottom: 28 }}>
          Complete your booking
        </h1>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading checkout…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, alignItems: "start" }} className="checkout-grid">
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 8, minHeight: 480 }}>
              {v2 && booking && (
                <PaymentElementForm
                  clientSecret={v2.clientSecret}
                  payLabel={booking.status === "pending" ? "Send booking request" : `Pay £${rentTotal.toFixed(2)}`}
                  consentText={v2Consent}
                  onSuccess={() =>
                    navigate(`/property/${booking.property}?success=true&bookingId=${booking._id}&value=${booking.totalPrice}`)
                  }
                />
              )}
              {options && (
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
            </div>

            {property && booking && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", overflow: "hidden", position: "sticky", top: 24 }}>
                {property.coverImage && (
                  <img src={property.coverImage} alt={property.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                )}
                <div style={{ padding: 24 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px" }}>
                    Hosted by {property.host?.displayName || property.host?.firstName || "your host"}
                  </p>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A1628", margin: "0 0 12px" }}>
                    {property.title}
                  </h2>
                  {property.location?.city && (
                    <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", margin: "0 0 16px" }}>
                      <MapPin size={14} /> {property.location.city}{property.location.country ? `, ${property.location.country}` : ""}
                    </p>
                  )}

                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                      <CalendarDays size={14} />
                      {new Date(booking.checkIn).toLocaleDateString()} — {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                      <Users size={14} />
                      {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #F3F4F6", marginTop: 16, paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
                      <span>{durationUnits ? `${durationUnits} ${durationWord}${durationUnits !== 1 ? "s" : ""}` : "Rent"}</span>
                      <span>£{rentTotal.toFixed(2)}</span>
                    </div>
                    {depositAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
                        <span>Security deposit</span>
                        <span>£{depositAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: "#0A1628", marginTop: 8, paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
                      <span>Total</span>
                      <span>£{(rentTotal + depositAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  {v2Deposit && (
                    <div style={{ marginTop: 16, background: "#F5F7FF", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                      <strong>Deposit £{v2DepositGbp}</strong> — not part of the total above. {v2DepositCopy}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 20, fontSize: 12, color: "#6B7280" }}>
                    <ShieldCheck size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
                    {booking.status === "pending"
                      ? "You won't be charged until the host approves your request."
                      : "Payment is held securely and released to the host after your stay."}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
