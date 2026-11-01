import { Link } from "react-router-dom";
import StaticPageLayout from "../components/StaticPageLayout";
import useSiteText from "../hooks/useSiteText";
import RichText from "../components/RichText";

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

export default function ContactUs() {
  const t = useSiteText();
  return (
    <StaticPageLayout
      title={t("contact.title")}
      subtitle={t("contact.subtitle")}
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <Card title="Get in touch">
          <RichText value={t("contact.intro")} paragraphStyle={{ margin: 0 }} linkStyle={linkStyle} />
        </Card>

        <Card title="Already have a booking or listing?">
          <p style={{ margin: 0 }}>
            For anything related to an existing booking or listing — cancellations, payment questions, or reporting an issue — you'll usually get a faster answer from{" "}
            <Link to="/help-support" style={linkStyle}>Help &amp; Support</Link>{" "}
            or your{" "}
            <Link to="/dashboard" style={linkStyle}>dashboard</Link>{" "}
            directly, where our team can see the details of your account.
          </p>
        </Card>

        <Card title="Press, partnerships, and careers">
          <p style={{ margin: 0 }}>
            For media inquiries, see{" "}
            <Link to="/press" style={linkStyle}>Press</Link>. For partnership inquiries, see{" "}
            <Link to="/partners" style={linkStyle}>Partners</Link>. For job opportunities, see{" "}
            <Link to="/careers" style={linkStyle}>Careers</Link>.
          </p>
        </Card>
      </div>
    </StaticPageLayout>
  );
}
