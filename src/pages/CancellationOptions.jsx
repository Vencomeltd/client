import { Link } from "react-router-dom";
import StaticPageLayout from "../components/StaticPageLayout";

const COLORS = {
  navy: "#0A1628",
  gold: "#C9A84C",
  border: "#E5E7EB",
  text: "#374151",
  muted: "#6B7280",
  white: "#FFFFFF",
};

function Card({ title, children }) {
  return (
    <section
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "24px",
        padding: "36px 32px",
        boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)",
      }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: "22px", fontWeight: 800, color: COLORS.navy }}>{title}</h2>
      <div style={{ display: "grid", gap: "14px", fontSize: "15px", lineHeight: 1.8, color: COLORS.text }}>
        {children}
      </div>
    </section>
  );
}

export default function CancellationOptions() {
  return (
    <StaticPageLayout
      title="Cancellation Options"
      subtitle="Flexible cancellation for flexible spaces."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="Instant Book cancellations">
          <p style={{ margin: 0 }}>
            If you cancel an Instant Book booking more than 24 hours before the scheduled start time, you'll receive a full refund automatically.
          </p>
          <p style={{ margin: 0 }}>
            Cancellations made within 24 hours of the booking start time are reviewed on a case-by-case basis, and a partial refund may be offered at VenCome's discretion.
          </p>
        </Card>

        <Card title="Request to Book cancellations">
          <p style={{ margin: 0 }}>
            For Request to Book listings, your card is authorized but not charged when you submit a booking request. You are only charged once the host approves your request.
          </p>
          <p style={{ margin: 0 }}>
            If the host declines your request, or doesn't respond within 24 hours, your request automatically expires and your card authorization is simply released — you are never charged and there is nothing to refund.
          </p>
          <p style={{ margin: 0 }}>
            If you cancel a Request to Book booking after it's been approved and paid, the same Instant Book cancellation timing above applies.
          </p>
        </Card>

        <Card title="If a host cancels">
          <p style={{ margin: 0 }}>
            If a host cancels a confirmed booking, you'll receive a full refund. VenCome reserves the right to apply penalties to hosts who cancel confirmed bookings without reasonable cause, including temporary suspension of their listing.
          </p>
        </Card>

        <Card title="Security deposits">
          <p style={{ margin: 0 }}>
            Where a security deposit applies, it's held by VenCome and released after the host confirms the space was left in satisfactory condition. Deposits are separate from your booking cancellation and are not affected by the cancellation timing above.
          </p>
        </Card>

        <Card title="Need help with a booking?">
          <p style={{ margin: 0 }}>
            You can cancel or view the status of a booking any time from{" "}
            <Link to="/my-bookings" style={{ color: COLORS.navy, fontWeight: 700, textDecoration: "underline", textDecorationColor: COLORS.gold }}>
              My Bookings
            </Link>
            . For the full policy, see our{" "}
            <Link to="/terms-and-conditions#cancellation-policy" style={{ color: COLORS.navy, fontWeight: 700, textDecoration: "underline", textDecorationColor: COLORS.gold }}>
              Terms &amp; Conditions
            </Link>
            , or contact{" "}
            <a href="mailto:support@vencome.com" style={{ color: COLORS.navy, fontWeight: 700, textDecoration: "underline", textDecorationColor: COLORS.gold }}>
              support@vencome.com
            </a>
            .
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
