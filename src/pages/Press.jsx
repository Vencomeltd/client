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

export default function Press() {
  return (
    <StaticPageLayout
      title="Press & Media"
      subtitle="For press enquiries and media resources."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="About VenCome">
          <p style={{ margin: 0 }}>
            VenCome is a B2B commercial property rental marketplace connecting business hosts with professional tenants across short-term and long-term rentals, serving the UK and Middle East. Hosts list offices, co-working space, meeting rooms, event venues, retail, industrial, and studio space; tenants search, book, and pay securely, with funds held in escrow until after the booking is complete.
          </p>
        </Card>

        <Card title="Media inquiries">
          <p style={{ margin: 0 }}>
            We haven't published a press kit yet. If you're working on a story and need information, quotes, or imagery, email{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>{" "}
            with a note about your outlet and deadline, and we'll get back to you.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
