import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FAQ_CATEGORIES = [
  {
    category: "Getting Started",
    faqs: [
      { q: "What is VenCome?", a: "VenCome is a B2B commercial space rental marketplace that connects businesses with professional spaces across the UK and Middle East. Whether you need an office for a day, a meeting room for an hour, or a studio for a week — VenCome makes it simple to find, book, and pay." },
      { q: "Who is VenCome for?", a: "VenCome is for businesses of all sizes — from freelancers needing a hot desk for a day, to large companies requiring conference rooms or event venues. It's also for property owners who want to monetise their commercial spaces." },
      { q: "Is VenCome available in my city?", a: "VenCome currently operates across the UK and the Middle East, with Saudi Arabia as a priority market. More cities are being added regularly. Search your location to see available spaces near you." },
    ]
  },
  {
    category: "Booking",
    faqs: [
      { q: "How do I book a space?", a: "Search for a space by location, date, and type. Select your preferred listing, choose your dates and duration, then click Book Now or Request to Book. You'll receive a confirmation once the host approves your request." },
      { q: "What is the difference between Instant Book and Request to Book?", a: "Instant Book spaces are confirmed immediately upon payment. Request to Book spaces require host approval — hosts have 24 hours to accept or decline your request." },
      { q: "Can I book a space for multiple days?", a: "Yes. VenCome supports hourly, daily, weekly, monthly, and annual bookings. Select your check-in and check-out dates and the pricing will be calculated automatically." },
      { q: "Can I cancel a booking?", a: "Yes. You can cancel from your customer dashboard. Cancellation policies vary by listing — please check the specific policy on the listing page before booking." },
    ]
  },
  {
    category: "Payments",
    faqs: [
      { q: "How does payment work?", a: "Payments are processed securely through Stripe. Your payment is held in escrow until after your booking is confirmed and completed. Hosts receive their payout 24–48 hours after check-in for short-term bookings." },
      { q: "What currencies does VenCome support?", a: "VenCome supports GBP, USD, EUR, AED, and SAR. The currency shown depends on the listing's market." },
      { q: "Is my payment information secure?", a: "Yes. All payments are processed through Stripe, which is PCI DSS compliant. VenCome never stores your card details." },
      { q: "What happens if a host declines my booking?", a: "If a host declines your request, you will receive a full refund automatically. No charges are applied for declined bookings." },
    ]
  },
  {
    category: "Hosting",
    faqs: [
      { q: "How do I list my space on VenCome?", a: "Click 'Publish your space' in the top navigation. You'll be guided through a step-by-step wizard to add your space details, photos, pricing, and availability. Your listing will be live once reviewed." },
      { q: "How much does it cost to list a space?", a: "Listing your space on VenCome is completely free. VenCome charges a 10% platform commission on each completed booking, automatically deducted before your payout." },
      { q: "When do I get paid?", a: "For short-term bookings, payouts are processed 24–48 hours after check-in. For monthly bookings, payouts are processed monthly." },
      { q: "Can I set my own pricing?", a: "Yes. You have full control over your pricing. You can set hourly, daily, weekly, monthly, and annual rates, as well as discounts for longer stays." },
    ]
  },
  {
    category: "Trust & Safety",
    faqs: [
      { q: "How does VenCome verify hosts?", a: "Hosts go through an identity and business verification process before their listings go live. VenCome also reviews all listings for accuracy and quality." },
      { q: "What if something goes wrong during my booking?", a: "Contact VenCome support immediately. Our team will mediate disputes and ensure fair resolution for both parties." },
      { q: "Is my personal information safe?", a: "Yes. VenCome is fully GDPR compliant and your personal data is never shared with third parties without your consent." },
    ]
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "#0A1628", marginBottom: 14 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 17, color: "#6B7280", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
            Everything you need to know about booking and listing on VenCome.
          </p>
        </div>

        {FAQ_CATEGORIES.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #E5E7EB" }}>
              {cat.category}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cat.faqs.map((faq, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openItem === key;
                return (
                  <div
                    key={key}
                    style={{
                      border: "1.5px solid",
                      borderColor: isOpen ? "#305CDE" : "#E5E7EB",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#fff",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenItem(isOpen ? null : key)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 22px",
                        background: isOpen ? "#F8F9FF" : "#fff",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: 16,
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", lineHeight: 1.4 }}>
                        {faq.q}
                      </span>
                      <span style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: isOpen ? "#305CDE" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d={isOpen ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"}
                            stroke={isOpen ? "#fff" : "#6B7280"}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 22px 18px", background: "#F8F9FF" }}>
                        <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 48, padding: "32px", background: "#fff", borderRadius: 20, border: "1.5px solid #E5E7EB" }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0A1628", marginBottom: 8 }}>Still have questions?</h3>
          <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 20 }}>Our team is here to help.</p>
          <a
            href="/contact"
            style={{ display: "inline-block", padding: "12px 28px", background: "#0A1628", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}
          >
            Contact Support
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
