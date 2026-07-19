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

export default function Partners() {
  return (
    <StaticPageLayout
      title="Our Partners"
      subtitle="We work with the best to deliver the best."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="Calendar integrations">
          <p style={{ margin: 0 }}>
            Hosts can connect their external calendar so bookings and availability stay in sync automatically. We currently support Google Calendar, Microsoft Outlook, Apple iCal/CalDAV, Calendly, and Cal.com, with two-way sync — bookings made on VenCome push to your external calendar, and events on your external calendar block your VenCome availability.
          </p>
        </Card>

        <Card title="Interested in partnering with us?">
          <p style={{ margin: 0 }}>
            We're open to partnerships with property groups, coworking operators, brokers, and complementary platforms serving businesses across the UK and Middle East. If that's you, email{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>{" "}
            with a bit about what you have in mind.
          </p>
          <p style={{ margin: 0 }}>
            If you manage listings on behalf of hosts as an agent or broker, mention that in your email and we'll point you in the right direction.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
