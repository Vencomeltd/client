import { useState } from "react";
import Navbar from "../components/Navbar";

const SECTIONS = [
  {
    id: 1,
    title: "Introduction",
    content: "VenCome Limited (\"VenCome\", \"we\", \"us\") operates an online marketplace connecting commercial space Hosts and Guests. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform. We process personal data in accordance with the UK General Data Protection Regulation and the Data Protection Act 2018."
  },
  {
    id: 2,
    title: "Information We Collect",
    content: "Account information: name, email address, phone number, date of birth, and password.\n\nProfile information: profile photo, bio, business details, and verification documents submitted by Hosts.\n\nBooking information: booking dates, payment details, messages exchanged between Guests and Hosts, and reviews.\n\nTechnical information: IP address, browser type, device information, and cookies used to operate and improve the platform.\n\nLocation information: addresses and coordinates of listed spaces, and approximate location data used for search and map features."
  },
  {
    id: 3,
    title: "How We Use Your Information",
    content: "We use personal data to create and manage your account, process bookings and payments, facilitate communication between Hosts and Guests, verify identity and prevent fraud, provide customer support, send booking confirmations and service updates, improve and personalise the platform, and comply with legal and regulatory obligations.\n\nWith your consent, we may also use your information to send marketing communications about new features, promotions, or platform updates. You can opt out of marketing communications at any time."
  },
  {
    id: 4,
    title: "Payment Processing",
    content: "Payments are processed securely through Stripe, a PCI DSS compliant payment processor. VenCome does not store your full card details. Stripe processes and temporarily holds funds on VenCome's behalf, with funds released to Hosts after booking completion in accordance with our commission structure set out in our Terms and Conditions."
  },
  {
    id: 5,
    title: "Sharing Your Information",
    content: "We share necessary booking details (such as name and contact information) between Hosts and Guests to facilitate a confirmed booking. We share data with trusted third-party service providers who help us operate the platform, including payment processors, cloud hosting providers, email and SMS providers, and identity verification providers.\n\nWe do not sell personal data to third parties. We may disclose information where required by law, to protect our legal rights, or to investigate fraud or safety concerns."
  },
  {
    id: 6,
    title: "Cookies and Tracking",
    content: "VenCome uses cookies and similar technologies to keep you logged in, remember your preferences, understand how the platform is used, and improve performance. You can control cookie preferences through your browser settings. Disabling certain cookies may affect platform functionality."
  },
  {
    id: 7,
    title: "Data Retention",
    content: "We retain personal data for as long as your account is active or as needed to provide services. We may retain certain information after account closure where required for legal, tax, dispute resolution, or fraud prevention purposes."
  },
  {
    id: 8,
    title: "Data Security",
    content: "We implement appropriate technical and organisational measures to protect personal data, including encryption in transit and at rest, secure password hashing, role-based access controls, and regular security reviews. While we take reasonable steps to protect your data, no system is completely secure, and we cannot guarantee absolute security."
  },
  {
    id: 9,
    title: "Your Rights",
    content: "Under UK GDPR, you have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, object to or restrict certain processing, request a copy of your data in a portable format, and withdraw consent where processing is based on consent.\n\nTo exercise any of these rights, contact us at privacy@vencome.com. We may need to verify your identity before fulfilling a request."
  },
  {
    id: 10,
    title: "International Data Transfers",
    content: "Where personal data is transferred outside the United Kingdom, we ensure appropriate safeguards are in place, such as standard contractual clauses, to protect your information in accordance with UK data protection law."
  },
  {
    id: 11,
    title: "Children's Privacy",
    content: "VenCome is not intended for use by individuals under 18 years of age. Users must be at least 18 to create an account or make a booking. We do not knowingly collect personal data from children."
  },
  {
    id: 12,
    title: "Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. We will notify users of material changes by email or through the platform. Continued use of VenCome after changes take effect constitutes acceptance of the updated policy."
  },
  {
    id: 13,
    title: "Contact Us",
    content: "If you have questions about this Privacy Policy or how your data is handled, contact us at privacy@vencome.com."
  },
];

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ background: "#F8F6F0", minHeight: "100vh" }}>
      <Navbar />

      <div style={{
        background: "#0A1628", color: "#fff",
        padding: "80px 24px 60px", textAlign: "center",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", color: "#2E58EC", textTransform: "uppercase", marginBottom: "16px" }}>
          Legal
        </p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "800", margin: "0 0 16px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", maxWidth: "520px", margin: "0 auto" }}>
          How we collect, use, and protect your data on VenCome.
        </p>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px" }}>

        <div style={{
          background: "#fff", borderRadius: "16px", padding: "28px 32px",
          border: "1px solid #E5E7EB", marginBottom: "32px",
        }}>
          <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8", margin: 0 }}>
            Your privacy matters to us. This policy explains what data we collect, why we collect it, and the choices and rights you have over your personal information when using VenCome.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SECTIONS.map((section) => {
            const isOpen = active === section.id;
            return (
              <div key={section.id} style={{
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

        <div style={{
          marginTop: "40px", padding: "24px", borderRadius: "14px",
          background: "rgba(46,88,236,0.05)", border: "1px solid rgba(46,88,236,0.15)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Questions about your data? Contact us at{" "}
            <a href="mailto:privacy@vencome.com" style={{ color: "#2E58EC", fontWeight: "600" }}>
              privacy@vencome.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
