import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import Button from "../components/Button";
import Footer from "../components/Footer";

const HelpSupport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [openArticle, setOpenArticle] = useState(null);

  useEffect(() => {
    // Load Tawk.to script only on this page
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/69aebdf320c1d71c37343446/1jj99c05n"; // ← replace with your real ID
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
    };
  }, []);

  const helpArticles = [
    {
      category: "Booking & Payments",
      articles: [
        {
          title: "How do payments work?",
          content: (
            <>
              <p>
                All payments are processed securely via Stripe. When you book:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Instant Book: Charged immediately</li>
                <li>Request to Book: Charged after host approval</li>
                <li>
                  Funds are held in escrow until 24 hours after the event ends
                </li>
                <li>
                  Hosts receive payout automatically after the 24-hour period
                </li>
              </ul>
              <p className="mt-4">
                You can see payment status in <strong>My Bookings</strong>.
              </p>
            </>
          ),
        },
        {
          title: "How do I cancel a booking?",
          content: (
            <>
              <p>
                Cancellation depends on the host's policy (shown on each
                listing):
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Flexible: Full refund if cancelled 7+ days before</li>
                <li>Moderate: 50% refund if cancelled 5+ days before</li>
                <li>Strict: No refund after confirmation</li>
              </ul>
              <p className="mt-4">
                Go to <strong>My Bookings</strong> → select booking → Cancel (if
                eligible).
              </p>
            </>
          ),
        },
        {
          title: "I paid but the booking is still pending",
          content: (
            <>
              <p>
                If the host has "Request to Book" enabled, payment is held until
                they accept.
              </p>
              <p className="mt-3">
                You’ll see the status in My Bookings. If no response in 24
                hours, contact support.
              </p>
            </>
          ),
        },
      ],
    },
    {
      category: "Hosting & Listings",
      articles: [
        {
          title: "How do I list my venue?",
          content: (
            <>
              <p>Steps:</p>
              <ol className="list-decimal pl-6 mt-3 space-y-2">
                <li>Log in → click "Publish your space"</li>
                <li>
                  Follow the 10-step wizard: name, photos, features, pricing,
                  etc.
                </li>
                <li>Submit for review (usually approved within 24–48 hours)</li>
              </ol>
              <p className="mt-4">
                Once live, you'll receive booking notifications.
              </p>
            </>
          ),
        },
        {
          title: "How do I get paid?",
          content: (
            <>
              <p>After the event ends + 24 hours:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  Funds are automatically transferred to your connected payout
                  method
                </li>
                <li>Platform fee (10–20%) is deducted</li>
                <li>You can track payouts in your dashboard</li>
              </ul>
              <p className="mt-4">
                Make sure your payout method (bank/PayPal) is connected in
                Settings.
              </p>
            </>
          ),
        },
      ],
    },
    {
      category: "Account & Security",
      articles: [
        {
          title: "How do I verify my identity or business?",
          content: (
            <>
              <p>
                Go to Settings → Business Verification or Identity Verification.
              </p>
              <p className="mt-3">
                Business: Submit company name, VAT, registration number.
                <br />
                Identity: Use Stripe Identity (ID + selfie).
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Verified accounts get a blue checkmark and higher trust from
                users.
              </p>
            </>
          ),
        },
        {
          title: "How do I reset my password?",
          content: (
            <>
              <p>
                Click "Forgot password" on the login page → enter your email →
                follow the link sent to you.
              </p>
              <p className="mt-3">
                If you don't receive the email, check spam or contact support.
              </p>
            </>
          ),
        },
      ],
    },
    {
      category: "Technical Issues",
      articles: [
        {
          title: "The page is not loading / app is slow",
          content: (
            <>
              <p>Try:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Clear browser cache</li>
                <li>Switch to a different browser or device</li>
                <li>Check your internet connection</li>
              </ul>
              <p className="mt-4">
                If the issue continues, contact support with your browser and
                device details.
              </p>
            </>
          ),
        },
      ],
    },
  ];

  const filteredArticles = helpArticles
    .map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.props?.children?.some?.(
            (child) =>
              typeof child === "string" &&
              child.toLowerCase().includes(searchQuery.toLowerCase())
          )
      ),
    }))
    .filter((cat) => cat.articles.length > 0);

  const toggleArticle = (catIndex, artIndex) => {
    const key = `${catIndex}-${artIndex}`;
    setOpenArticle(openArticle === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Help & Support
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10">
            We're here to help you find, book, or host the perfect event space.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-white opacity-80" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help (e.g. booking, payment, hosting...)"
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg transition"
            />
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="max-w-5xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Talk to us right now</p>
            <button
              onClick={() => navigate("/support/tickets")}
              className="bg-primary text-white px-6 py-2 rounded-full"
            >
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
            <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">support@vencome.com</p>
            <a
              href="mailto:support@vencome.com"
              className="text-primary hover:underline font-medium"
            >
              Send Email
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition">
            <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">+441 50 123 4567</p>
            <a
              href="tel:+442071234567"
              className="text-primary hover:underline font-medium"
            >
              Call Now
            </a>
          </div>
        </div>
      </div>
      {/* Articles */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-2xl text-gray-600 mb-4">
              No results found for "{searchQuery}"
            </p>
            <p className="text-gray-500">
              Try different keywords or browse the categories below.
            </p>
          </div>
        ) : (
          filteredArticles.map((category, catIndex) => (
            <section key={catIndex} className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.articles.map((article, artIndex) => {
                  const isOpen = openArticle === `${catIndex}-${artIndex}`;
                  return (
                    <div
                      key={artIndex}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                    >
                      <button
                        onClick={() => toggleArticle(catIndex, artIndex)}
                        className="w-full px-6 py-5 text-left flex justify-between items-center"
                      >
                        <span className="text-lg font-medium text-gray-900">
                          {article.title}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-6 w-6 text-primary" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-500" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 pt-1 text-gray-700 leading-relaxed border-t border-gray-100">
                          {article.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
      {/* Final CTA */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our support team is available 24/7. Send us a message or start a
              live chat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Start a conversation */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-600 mb-8">
                Open a support ticket and chat with our team in real time —
                we'll keep you updated every step of the way.
              </p>
              <button
                onClick={() => navigate("/support/tickets")}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-medium transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Start a Conversation
              </button>
            </div>

            {/* Live Chat & Other Options */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Live Chat
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Instant help from our team
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.Tawk_API?.toggle?.()}
                  className="w-full bg-primary text-white py-4 rounded-xl font-medium transition"
                >
                  Start Live Chat
                </button>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Other ways to reach us
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <a
                        href="mailto:support@vencome.com"
                        className="text-primary hover:underline"
                      >
                        support@vencome.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href="tel:+442071234567"
                        className="text-primary hover:underline"
                      >
                        +441 50 123 4567
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Mon–Fri, 9 AM – 6 PM GMT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpSupport;
