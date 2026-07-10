import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const SECTIONS = [
  { id: 1, title: "Platform Role", content: "VenCome operates as an online marketplace connecting Guests and Hosts. VenCome facilitates but is not a principal party to agreements between Guests and Hosts, and is not the owner, provider, or operator of any listed space." },
  { id: 2, title: "Bookings and Payments", content: "All bookings are legally binding agreements between Guests and Hosts. VenCome processes and temporarily holds payments on behalf of Hosts and releases funds after booking completion. VenCome charges a commission of 10% on each completed booking, deducted from the booking fee paid by the Guest. The remainder is released to the Host upon booking completion. Guests will see the total booking fee inclusive of VenCome's commission at the point of booking. Founding hosts who joined VenCome prior to the platform's public launch date are entitled to zero commission on their first five completed bookings. This benefit applies to the specific account registered as a founding host and is non-transferable." },
  { id: 3, title: "Cancellation and Refund Policy", content: "We understand plans change. Guests may cancel a booking for a full refund up to 24 hours before the scheduled start time. Cancellations made within 24 hours of the booking will be reviewed on a case by case basis and a partial refund may be offered at VenCome's discretion. We always aim to be fair to both sides.\n\nWhere a Host cancels a confirmed booking, the Guest will receive a full refund. VenCome reserves the right to apply penalties to Hosts who cancel confirmed bookings without reasonable cause, including temporary suspension of their listing." },
  { id: 4, title: "Security Deposit", content: "VenCome may require a security deposit from Guests prior to booking. The deposit will be held by VenCome and released after the Host confirms the space has been left in satisfactory condition. VenCome reserves the right to withhold part or all of the deposit in cases of damage, misuse, or breach of terms." },
  { id: 5, title: "User Responsibilities", content: "Hosts agree to provide accurate, lawful, and up-to-date listings, ensure spaces are safe, suitable, and compliant with their intended use, comply with all applicable laws, regulations, and licensing requirements, ensure that any professional or regulated activities conducted in the space are carried out by appropriately qualified and insured individuals, and maintain appropriate insurance where required.\n\nGuests agree to use the space responsibly, follow Host rules, and pay for any damages caused." },
  { id: 6, title: "Recurring Bookings", content: "Where a Guest books a recurring series of sessions, each individual session within the series constitutes a separate booking for the purposes of cancellation and payment. Either party may cancel future sessions in a recurring series with a minimum of 48 hours written notice to the other party through the platform." },
  { id: 7, title: "Digital Room Licence", content: "Upon confirmation of a booking, VenCome will generate a digital room licence agreement between the Host and Guest. This licence constitutes the legally binding agreement governing the use of the space for that booking. Where a Host has uploaded their own room licence template, that template will be used in place of VenCome's standard licence. VenCome is not a party to the room licence agreement." },
  { id: 8, title: "Calendar Integration", content: "VenCome offers optional calendar integration with third-party calendar services including Google Calendar, Outlook, and iCal. VenCome is not liable for any scheduling conflicts, double bookings, or errors arising from failures in third-party calendar synchronisation." },
  { id: 9, title: "Reviews and Ratings", content: "VenCome operates a two-way review system. Both Guests and Hosts may submit reviews following a booking. Reviews are published only after both parties submit their reviews or after a defined review period expires. VenCome may remove reviews that are abusive, misleading, or violate platform policies." },
  { id: 10, title: "Account Suspension and Termination", content: "VenCome may suspend or terminate accounts at its sole discretion, including for breach of these Terms, fraudulent or illegal activity, repeated negative reviews or complaints, or safety concerns. VenCome may withhold payments during investigations." },
  { id: 11, title: "Liability Disclaimer", content: "11.1 VenCome is not liable for the condition, quality, or safety of any listing, actions or omissions of Hosts or Guests, any injury, loss, damage, or theft, or any professional, medical, wellness, or therapeutic services carried out within any listed space. Use of the platform is at the user's own risk.\n\n11.2 To the fullest extent permitted by law, VenCome's total aggregate liability arising from or in connection with these Terms shall not exceed the total amount of fees paid by the relevant Guest in relation to the affected booking.\n\n11.3 Nothing in these Terms excludes or limits VenCome's liability for death or personal injury caused by VenCome's negligence or fraud or fraudulent misrepresentation." },
  { id: 12, title: "Insurance and Protection", content: "VenCome does not provide insurance coverage or guarantees for any bookings, Hosts, or Guests. The security deposit is the primary mechanism for damage protection. Users are responsible for obtaining their own insurance if desired. Hosts are responsible for ensuring that any practitioners using their space maintain appropriate professional and public liability insurance." },
  { id: 13, title: "Dispute Resolution", content: "Users agree to first attempt to resolve disputes through VenCome support. If unresolved, disputes shall be resolved through the courts of England and Wales. To the fullest extent permitted by law, users agree to resolve disputes individually and waive any right to participate in class action lawsuits." },
  { id: 14, title: "Content and Data Rights", content: "By submitting content including listings, images, and descriptions, Hosts grant VenCome a worldwide, non-exclusive, royalty-free licence to use, reproduce, modify, and display such content for platform operation, marketing, and promotion." },
  { id: 15, title: "Pricing Rules", content: "Hosts must ensure all pricing is accurate and not misleading." },
  { id: 16, title: "Taxes and Legal Compliance", content: "Hosts are solely responsible for determining applicable taxes, reporting and paying all taxes, and complying with local laws, permits, and regulations. VenCome is not responsible for tax collection or reporting on behalf of Hosts." },
  { id: 17, title: "Data Protection", content: "VenCome processes personal data in accordance with the UK General Data Protection Regulation and the Data Protection Act 2018. VenCome's Privacy Policy sets out how personal data is collected, used, stored, and protected. By using the platform, users consent to the collection and processing of their personal data in accordance with the Privacy Policy." },
  { id: 18, title: "Age Requirement", content: "Users must be at least 18 years of age to create an account or make a booking on VenCome." },
  { id: 19, title: "Modifications", content: "VenCome reserves the right to update or modify these Terms at any time. Users will be notified of material changes by email or through the platform. Continued use of the platform following notification constitutes acceptance of the updated Terms." },
  { id: 20, title: "Governing Law", content: "These Terms shall be governed by and interpreted in accordance with the laws of England and Wales." },
  { id: 21, title: "Professional Use and Health-Related Activities", content: "21.1 Where a Host lists a space intended for therapy, treatment, wellness, or any health-related or regulated professional use, the Host warrants that any individuals carrying out such activities are appropriately qualified, competent, and experienced, hold all required licences, registrations, and certifications, and maintain valid and adequate professional liability insurance.\n\n21.2 VenCome does not independently verify the authenticity or current validity of any qualifications, licences, registrations, or insurance submitted by users with the issuing body.\n\n21.3 Where a badge, label, or similar indicator is displayed on a listing or profile, such badge indicates only that documentation has been submitted and reviewed. It does not constitute a guarantee, certification, endorsement, or validation by VenCome.\n\n21.4 Guests and any third parties are solely responsible for conducting their own due diligence before engaging in any professional or health-related services conducted within a listed space.\n\n21.5 Hosts must not permit the use of any listed space for unlawful, unlicensed, or regulated activities where the required qualifications, registrations, or insurance are not in place." },
  { id: 22, title: "Acceptable Use", content: "Users must not use the platform for illegal, fraudulent, or abusive activity, attempt to scrape, reverse-engineer, or exploit the platform, interfere with other users' experience or the platform's operations, or misrepresent themselves or their services." },
  { id: 23, title: "Force Majeure", content: "VenCome shall not be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including natural disasters, government actions, pandemics, or technical failures." },
];

export default function TermsAndConditions() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const scrollToCancellationPolicy = () => {
      if (window.location.hash === "#cancellation-policy") {
        setActive(3);
        setTimeout(() => {
          const el = document.getElementById("cancellation-policy");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    };

    scrollToCancellationPolicy();
    window.addEventListener("hashchange", scrollToCancellationPolicy);
    return () => window.removeEventListener("hashchange", scrollToCancellationPolicy);
  }, []);

  return (
    <div style={{ background: "#F8F6F0", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "#0A1628", color: "#fff",
        padding: "80px 24px 60px", textAlign: "center",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", color: "#2E58EC", textTransform: "uppercase", marginBottom: "16px" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "800", margin: "0 0 16px" }}>
          Terms & Conditions
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", maxWidth: "520px", margin: "0 auto" }}>
          Effective Date: 9 June 2026 — Please read these terms carefully before using VenCome.
        </p>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px" }}>

        {/* Intro */}
        <div style={{
          background: "#fff", borderRadius: "16px", padding: "28px 32px",
          border: "1px solid #E5E7EB", marginBottom: "32px",
        }}>
          <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8", margin: 0 }}>
            These Terms and Conditions govern your use of the VenCome platform. By creating an account or making a booking, you agree to be bound by these terms. VenCome Limited is registered in England and Wales.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SECTIONS.map((section) => {
            const isOpen = active === section.id;
            return (
              <div
                key={section.id}
                id={section.id === 3 ? "cancellation-policy" : undefined}
                style={{
                background: "#fff", borderRadius: "14px",
                border: `1px solid ${isOpen ? "#2E58EC" : "#E5E7EB"}`,
                overflow: "hidden", transition: "border-color 0.2s ease",
              }}>
                <button
                  type="button"
                  onClick={() => setActive(isOpen ? null : section.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "16px",
                    padding: "20px 24px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{
                      width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                      background: isOpen ? "#2E58EC" : "rgba(46,88,236,0.08)",
                      color: isOpen ? "#fff" : "#2E58EC",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: "700",
                    }}>
                      {section.id}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>
                      {section.title}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "18px", color: "#6B7280", flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}>
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 24px 24px" }}>
                    <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "20px" }}>
                      {section.content.split("\n\n").map((para, i) => (
                        <p key={i} style={{
                          fontSize: "14px", color: "#374151",
                          lineHeight: "1.8", margin: "0 0 12px",
                        }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: "40px", padding: "24px", borderRadius: "14px",
          background: "rgba(46,88,236,0.05)", border: "1px solid rgba(46,88,236,0.15)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Questions about these terms? Contact us at{" "}
            <a href="mailto:support@vencome.com" style={{ color: "#2E58EC", fontWeight: "600" }}>
              support@vencome.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
