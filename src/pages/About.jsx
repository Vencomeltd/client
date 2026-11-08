import StaticPageLayout from "../components/StaticPageLayout";
import useSiteText from "../hooks/useSiteText";
import RichText from "../components/RichText";

const COLORS = {
  navy: "#0A1628",
  blue: "#2E58EC",
  border: "#E5E7EB",
  text: "#374151",
  white: "#FFFFFF",
};

export default function About() {
  const t = useSiteText();
  return (
    <StaticPageLayout
      title={t("about.title")}
      subtitle={t("about.subtitle")}
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <section style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "36px 32px", boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "28px", fontWeight: 800, color: COLORS.navy }}>Our Story</h2>
          <div style={{ display: "grid", gap: "18px", fontSize: "16px", lineHeight: 1.9, color: COLORS.text }}>
            <RichText value={t("about.story")} paragraphStyle={{ margin: 0 }} linkStyle={{ color: COLORS.blue }} />
          </div>
        </section>
        <section style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "36px 32px", boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: "28px", fontWeight: 800, color: COLORS.navy }}>Our Mission</h2>
          <RichText value={t("about.mission")} paragraphStyle={{ margin: 0, fontSize: "17px", lineHeight: 1.9, color: COLORS.text }} linkStyle={{ color: COLORS.blue }} />
        </section>
      </div>
    </StaticPageLayout>
  );
}
