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

export default function Accessibility() {
  return (
    <StaticPageLayout
      title="Accessibility"
      subtitle="VenCome is committed to accessibility for all."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="Our approach">
          <p style={{ margin: 0 }}>
            We want VenCome to be usable by everyone, regardless of ability. That means clear labeling on interactive elements — buttons, icons, and controls throughout the site carry proper accessible labels for screen readers, not just visual icons — sensible color contrast, and keyboard-navigable layouts.
          </p>
          <p style={{ margin: 0 }}>
            This is ongoing work, not a one-time checklist. As we add new features, we review them against the same standard.
          </p>
        </Card>

        <Card title="Something not working for you?">
          <p style={{ margin: 0 }}>
            If you use assistive technology and hit a page or feature that doesn't work the way it should, we want to know about it. Email{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>{" "}
            with what you were trying to do, what happened, and what device/browser/screen reader you were using if relevant — the more specific, the faster we can fix it.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
