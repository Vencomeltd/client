import StaticPageLayout from "../components/StaticPageLayout";

const COLORS = {
  navy: "#0A1628",
  blue: "#2E58EC",
  border: "#E5E7EB",
  text: "#374151",
  white: "#FFFFFF",
};

export default function About() {
  return (
    <StaticPageLayout
      title="About VenCome"
      subtitle="We're removing the friction from finding and booking commercial space."
    >
      <div style={{ display: "grid", gap: "24px" }}>
        <section style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "36px 32px", boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "28px", fontWeight: 800, color: COLORS.navy }}>Our Story</h2>
          <div style={{ display: "grid", gap: "18px", fontSize: "16px", lineHeight: 1.9, color: COLORS.text }}>
            <p style={{ margin: 0 }}>Founded in London, VenCome was born from a simple but frustrating experience.</p>
            <p style={{ margin: 0 }}>While studying, our Founder set out to pursue aesthetics as a side venture — big ambition, limited budget. When it came to finding flexible space to work from, the process proved harder than it should be: unresponsive hosts, compliance headaches, unclear pricing, monthly-only commitments, and listings that never quite matched the right area, time, or price.</p>
            <p style={{ margin: 0 }}>As an entrepreneurship student, she had learned to see problems as opportunities. This one was impossible to ignore.</p>
            <p style={{ margin: 0, fontWeight: 700, color: COLORS.navy }}>She asked herself: why can't booking a professional space be as simple as booking a hotel?</p>
            <p style={{ margin: 0 }}>That question became VenCome — a marketplace where commercial spaces and professionals connect effortlessly, whether you need a treatment room in London today or a studio in New York tomorrow. Together with her co-founder, they turned an idea into a market-ready solution: the platform she wished had existed — transparent, responsive, and powered by an AI Matchmaker that cuts through the noise to find exactly what you need, fast.</p>
            <p style={{ margin: 0 }}>VenCome exists to remove the friction from starting and growing a business — so that budget, location, or limited connections are never what stands between a professional and their potential.</p>
          </div>
        </section>
        <section style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "24px", padding: "36px 32px", boxShadow: "0 12px 40px rgba(10, 22, 40, 0.08)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: "28px", fontWeight: 800, color: COLORS.navy }}>Our Mission</h2>
          <p style={{ margin: 0, fontSize: "17px", lineHeight: 1.9, color: COLORS.text }}>To become the world's leading marketplace for commercial and professional space rental — trusted by businesses of every size, in every major city, for any duration.</p>
        </section>
      </div>
    </StaticPageLayout>
  );
}
