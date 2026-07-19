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

const SECTIONS = [
  {
    title: "Discover",
    links: [
      { to: "/", label: "Home" },
      { to: "/search", label: "Search Spaces" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { to: "/create-space", label: "List a Space" },
      { to: "/dashboard", label: "Host Dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/help-center", label: "Help Center" },
      { to: "/help-support", label: "Help & Support Articles" },
      { to: "/faq", label: "FAQ" },
      { to: "/cancellation-options", label: "Cancellation Options" },
      { to: "/safety", label: "Safety Information" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/careers", label: "Careers" },
      { to: "/press", label: "Press & Media" },
      { to: "/partners", label: "Our Partners" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms-and-conditions", label: "Terms & Conditions" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/accessibility", label: "Accessibility" },
    ],
  },
];

function Section({ title, links }) {
  return (
    <section
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "24px",
        padding: "32px 30px",
        boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)",
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: COLORS.navy }}>{title}</h2>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "10px" }}>
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              style={{ fontSize: "15px", color: COLORS.text, textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.navy; e.currentTarget.style.textDecoration = "underline"; e.currentTarget.style.textDecorationColor = COLORS.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.text; e.currentTarget.style.textDecoration = "none"; }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Sitemap() {
  return (
    <StaticPageLayout
      title="Sitemap"
      subtitle="Find everything on VenCome."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {SECTIONS.map((section) => (
          <Section key={section.title} title={section.title} links={section.links} />
        ))}
      </div>
    </StaticPageLayout>
  );
}
