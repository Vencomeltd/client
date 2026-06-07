import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const COLORS = {
  navy: "#0A1628",
  background: "#F8F6F0",
  border: "#E5E7EB",
  text: "#374151",
  muted: "#6B7280",
  white: "#FFFFFF",
};

function DefaultPlaceholder() {
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "24px",
        padding: "40px 32px",
        boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.7, color: COLORS.text, fontWeight: 500 }}>
        This page is being updated. Please check back soon.
      </p>
    </div>
  );
}

export default function StaticPageLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.background }}>
      <Navbar />
      <main style={{ paddingTop: "124px", paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 24px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: COLORS.navy,
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "28px",
            }}
          >
            ← Back to Home
          </Link>

          <section style={{ textAlign: "center", marginBottom: "44px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(36px, 6vw, 56px)",
                lineHeight: 1.05,
                color: COLORS.navy,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                maxWidth: "760px",
                margin: "18px auto 0",
                fontSize: "18px",
                lineHeight: 1.7,
                color: COLORS.muted,
              }}
            >
              {subtitle}
            </p>
          </section>

          {children || <DefaultPlaceholder />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
