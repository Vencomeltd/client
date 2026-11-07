import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import PlatformReviewModal from "../components/PlatformReviewModal";
import { apiFetch as apiFetchJson } from "../utils/api";
import { trackEvent } from "../utils/analytics";
import { buildIcs, formatPaidAmount, googleCalendarUrl, propertyAddress } from "../utils/bookingCalendar";

export function meta() {
  return [{ title: "Booking confirmed | VenCome" }, { name: "robots", content: "noindex" }];
}

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const calendarButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 8,
  border: "1.5px solid #0A1628",
  background: "transparent",
  color: "#0A1628",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

// Post-payment page for a single booking (Checkout redirects here once it
// knows the booking id). Everything shown comes from the stored booking.
export default function BookingConfirmed() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [canPromptPlatformReview, setCanPromptPlatformReview] = useState(false);
  const [showPlatformReview, setShowPlatformReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("vencome_token");
        const bookingRes = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!bookingRes.ok) throw new Error("We couldn't find this booking.");
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        const propertyRes = await fetch(`${import.meta.env.VITE_API_URL}/properties/${bookingData.property}`);
        const propertyData = await propertyRes.json().catch(() => ({}));
        setProperty(propertyData.property || propertyData);

        // Arrived straight from checkout: fire the GA4 purchase event once
        // (PropertyDetails used to do this from ?success=true) and clean the URL.
        const params = new URLSearchParams(window.location.search);
        if (params.get("success") === "true") {
          trackEvent("purchase", { transaction_id: bookingData._id, currency: "GBP", value: bookingData.totalPrice || 0 });
          window.history.replaceState({}, "", window.location.pathname);
          apiFetchJson({ endpoint: "/platform-reviews/should-prompt", method: "GET", showErrorToast: false })
            .then((res) => setCanPromptPlatformReview(!!res?.shouldPrompt))
            .catch(() => {});
        }
      } catch (err) {
        setError(err.message || "Something went wrong loading your booking.");
      }
    };
    load();
  }, [id]);

  const title = property?.title || "Your booking";
  const address = propertyAddress(property);
  const pending = booking?.status === "pending";
  const hasVat = booking?.pricingBreakdown?.vatPence > 0;
  const eventDetails = booking
    ? `VenCome booking ref ${String(booking._id).slice(-8).toUpperCase()}. Manage it at ${window.location.origin}/customer/bookings?booking=${booking._id}`
    : "";

  // Apple Calendar / Outlook: the server's .ics when available, otherwise
  // one built here from the same booking data.
  const downloadIcs = async () => {
    let blob = null;
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking._id}/calendar.ics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && (res.headers.get("content-type") || "").includes("text/calendar")) blob = await res.blob();
    } catch {
      // fall through to the client-built file
    }
    if (!blob) {
      const ics = buildIcs({ uid: booking._id, title, checkIn: booking.checkIn, checkOut: booking.checkOut, location: address, details: eventDetails });
      blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vencome-booking-${String(booking._id).slice(-8)}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 16px 48px" }}>
        {error ? (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#DC2626", borderRadius: 12, padding: 16, fontSize: 14 }}>
            {error}{" "}
            <Link to="/customer/bookings" style={{ color: "#DC2626", fontWeight: 600 }}>Go to My Bookings</Link>
          </div>
        ) : !booking ? (
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading your booking…</p>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              {pending ? <Clock size={28} color="#D97706" /> : <CheckCircle2 size={28} color="#16A34A" />}
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0A1628", margin: 0 }}>
                {pending ? "Request Sent!" : "Booking Confirmed!"}
              </h1>
            </div>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, margin: "0 0 24px" }}>
              {pending
                ? "We'll email you the moment the host approves or declines — no need to check back."
                : "A confirmation email has been sent to you."}
            </p>

            <div style={{ border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
              {property?.coverImage && (
                <img src={property.coverImage} alt={title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
              )}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <span
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: 9999,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: pending ? "#D97706" : "#16A34A",
                    background: pending ? "rgba(217,119,6,0.1)" : "rgba(22,163,74,0.1)",
                  }}
                >
                  {pending ? "Waiting for the host to accept" : "Confirmed"}
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0A1628", margin: 0 }}>{title}</h2>
                {address && (
                  <p style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 14, color: "#6B7280", margin: 0 }}>
                    <MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {address}
                  </p>
                )}
                <p style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 14, color: "#374151", margin: 0 }}>
                  <CalendarDays size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                  {formatDateTime(booking.checkIn)} – {formatDateTime(booking.checkOut)}
                </p>
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: 14, color: "#6B7280" }}>
                    {pending ? "Total (charged when the host accepts)" : "Total paid"}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#0A1628" }}>
                    {formatPaidAmount(booking.totalPrice)}
                    {hasVat && <span style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}> inc. VAT</span>}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0A1628", margin: "0 0 10px" }}>Add to calendar</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a
                  href={googleCalendarUrl({ title, checkIn: booking.checkIn, checkOut: booking.checkOut, location: address, details: eventDetails })}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={calendarButton}
                >
                  Google Calendar
                </a>
                <button type="button" onClick={downloadIcs} style={calendarButton}>
                  Apple / Outlook (.ics)
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
              <Link
                to={`/customer/bookings?booking=${booking._id}`}
                style={{ background: "#0A1628", color: "#fff", borderRadius: 8, padding: "14px 24px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}
              >
                Manage booking
              </Link>
              {canPromptPlatformReview && (
                <button
                  type="button"
                  onClick={() => setShowPlatformReview(true)}
                  style={{ background: "none", border: "none", color: "#2E58EC", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  How was booking with VenCome?
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showPlatformReview && (
        <PlatformReviewModal
          onClose={() => setShowPlatformReview(false)}
          onSubmitted={() => setCanPromptPlatformReview(false)}
        />
      )}
    </div>
  );
}
