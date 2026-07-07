import { useState } from "react";
import { Users, Gift, CheckCircle, Copy, Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ReferHost() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const referralLink = `https://www.vencome.com/login?role=host&ref=${encodeURIComponent(
    localStorage.getItem("vencome_user_id") || "vencome"
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("vencome_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/referrals/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        setSent(true);
        setEmail("");
        setName("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send invite. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: "Earn Rewards",
      desc: "Get £50 credit when your referred host completes their first booking.",
    },
    {
      icon: Users,
      title: "Grow the Community",
      desc: "Help build the UK and Middle East's leading commercial space marketplace.",
    },
    {
      icon: CheckCircle,
      title: "Easy to Share",
      desc: "Share your unique link or invite hosts directly by email.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(48,92,222,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <Users size={28} color="#305CDE" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0A1628", marginBottom: 12 }}>
            Refer a Host
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#6B7280",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Know someone with a great commercial space? Invite them to list on VenCome and
            earn rewards when they get their first booking.
          </p>
        </div>

        {/* Benefits */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 56,
          }}
        >
          {benefits.map((b) => (
            <div
              key={b.title}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                border: "1.5px solid #E5E7EB",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(48,92,222,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <b.icon size={20} color="#305CDE" />
              </div>
              <p
                style={{ fontSize: 15, fontWeight: 700, color: "#0A1628", marginBottom: 6 }}
              >
                {b.title}
              </p>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {/* Share Link */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 32,
              border: "1.5px solid #E5E7EB",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 6 }}>
              Share your link
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Copy and share your unique referral link anywhere.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                readOnly
                value={referralLink}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#374151",
                  background: "#F9FAFB",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: copied ? "#16A34A" : "#0A1628",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                <Copy size={14} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Invite by Email */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 32,
              border: "1.5px solid #E5E7EB",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 6 }}>
              Invite by email
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Send a personal invite directly to their inbox.
            </p>

            {sent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle size={40} color="#16A34A" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0A1628" }}>Invite sent!</p>
                <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                  We've sent them an invitation to join VenCome as a host.
                </p>
                <button
                  onClick={() => setSent(false)}
                  style={{
                    marginTop: 16,
                    fontSize: 14,
                    color: "#305CDE",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Send another invite
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Their name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: 14,
                      color: "#374151",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Their email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="host@example.com"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: 14,
                      color: "#374151",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {error && <p style={{ fontSize: 13, color: "#DC2626" }}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "#305CDE",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Mail size={16} />
                  {loading ? "Sending..." : "Send Invite"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Terms note */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF", marginTop: 40 }}>
          Referral rewards are credited to your account after your referred host completes
          their first confirmed booking. Terms apply.
        </p>
      </div>
      <Footer />
    </div>
  );
}
