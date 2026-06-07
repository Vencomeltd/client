import StaticPageLayout from "../components/StaticPageLayout";

const COLORS = {
  border: "#E5E7EB",
  text: "#374151",
  muted: "#6B7280",
  white: "#FFFFFF",
};

export default function ContactUs() {
  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="We'd love to hear from you."
    >
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "40px 32px", boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)", textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", fontSize: "16px", lineHeight: 1.7, color: COLORS.text, fontWeight: 500 }}>
          This page is being updated. Please check back soon.
        </p>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7, color: COLORS.muted }}>
          Email: info@vencome.com | Built by JetherVerse Agency
        </p>
      </div>
    </StaticPageLayout>
  );
}
