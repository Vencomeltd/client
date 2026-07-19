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

function LinkCard({ to, title, description }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "20px",
        padding: "28px 26px",
        boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)",
        textDecoration: "none",
        transition: "border-color 0.15s ease",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: COLORS.navy }}>{title}</h2>
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.7, color: COLORS.muted }}>{description}</p>
    </Link>
  );
}

const linkStyle = { color: COLORS.navy, fontWeight: 700, textDecoration: "underline", textDecorationColor: COLORS.gold };

export default function HelpCenter() {
  return (
    <StaticPageLayout
      title="Help Center"
      subtitle="Find answers to your questions."
    >
      <div style={{ display: "grid", gap: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
          <LinkCard
            to="/help-support"
            title="Help & Support articles"
            description="How payments, bookings, and payouts work, organized by topic."
          />
          <LinkCard
            to="/faq"
            title="Frequently Asked Questions"
            description="Quick answers to the questions we hear most often."
          />
          <LinkCard
            to="/cancellation-options"
            title="Cancellation Options"
            description="Refund and cancellation timing for every booking type."
          />
          <LinkCard
            to="/safety"
            title="Safety Information"
            description="How payments, verification, and disputes keep bookings safe."
          />
        </div>

        <div
          style={{
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "20px",
            padding: "28px 26px",
            boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.8, color: COLORS.text }}>
            Can't find what you need? Reach us directly at{" "}
            <a href="mailto:support@vencome.com" style={linkStyle}>support@vencome.com</a>{" "}
            or through{" "}
            <Link to="/contact" style={linkStyle}>Contact Us</Link>.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}
