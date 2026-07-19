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

const linkStyle = { color: COLORS.navy, fontWeight: 700, textDecoration: "underline", textDecorationColor: COLORS.gold };

export default function SafetyInformation() {
  return (
    <StaticPageLayout
      title="Safety Information"
      subtitle="Your safety is our priority."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="Secure payments">
          <p style={{ margin: 0 }}>
            Every booking is processed through Stripe. Funds are held securely in escrow and only released to the host after the booking is complete — hosts are never paid upfront, and your payment details are never stored on VenCome's own servers.
          </p>
        </Card>

        <Card title="Verified accounts">
          <p style={{ margin: 0 }}>
            Every login requires a one-time verification code sent to your email, and hosts and listings can carry a VenCome Verified badge once reviewed. Look for the verified badge when booking, especially for higher-value or longer-term spaces.
          </p>
        </Card>

        <Card title="Reporting a problem">
          <p style={{ margin: 0 }}>
            If a listing looks wrong — spam, misleading photos, or anything that doesn't match what's described — you can report it directly from the listing page. If something goes wrong with a specific booking, you can raise a dispute from that booking directly, which pauses the payout automatically while our team reviews it.
          </p>
          <p style={{ margin: 0 }}>
            You can also always reach us at{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>.
          </p>
        </Card>

        <Card title="Cancellations">
          <p style={{ margin: 0 }}>
            If your plans change, see our{" "}
            <Link to="/cancellation-options" style={linkStyle}>Cancellation Options</Link>{" "}
            for how refunds and released holds work for each booking type.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
