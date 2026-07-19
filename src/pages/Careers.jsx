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

export default function Careers() {
  return (
    <StaticPageLayout
      title="Join Our Team"
      subtitle="We're building the future of commercial space. Come build it with us."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="What we're building">
          <p style={{ margin: 0 }}>
            VenCome connects business hosts with professional tenants across the UK and Middle East — think of it as the commercial-space equivalent of finding the right home, but for offices, studios, meeting rooms, and event venues. We're early, and there's a lot still to build.
          </p>
        </Card>

        <Card title="Current openings">
          <p style={{ margin: 0 }}>
            We don't have any open roles listed right now. If that changes, we'll post them here. In the meantime, if you think you'd be a strong fit for where we're headed, we're always happy to hear from people who reach out on their own — send a short note and your CV to{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>{" "}
            and let us know what you'd want to work on.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
