import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, ExternalLink } from "lucide-react";
import apiFetch from "../utils/apiClient";
import { initSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";

const WHATSAPP_NUMBER = "447878427090";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I need help with VenCome")}`;

function WhatsAppIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const CATEGORY_OPTIONS = [
  { value: "booking_payments", label: "Booking & Payments" },
  { value: "hosting_listings", label: "Hosting & Listings" },
  { value: "account_security", label: "Account & Security" },
  { value: "trust_safety", label: "Trust & Safety" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

// Pages that already have their own support surface (the dashboard sidebar's
// "Support" link, or the ticket pages themselves) or aren't a fit for a
// floating bubble (admin, auth screens). Prefix-matched against pathname.
const HIDDEN_PREFIXES = [
  "/admin",
  "/login",
  "/signup",
  "/forgot-password",
  "/impersonate",
  "/support-access",
  "/customer/",
  "/dashboard",
  "/settings",
  "/profile",
  "/chat",
  "/notifications",
  "/host/create",
  "/host/listings",
  "/host/analytics",
  "/host/bookings",
  "/host/calendar",
  "/host/availability",
  "/availability/",
  "/bookings/",
  "/my-bookings",
  "/my-listings",
  "/create-space",
  "/edit-space",
  "/property-availability",
  "/support/tickets",
];

function isHiddenPath(pathname) {
  return HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export default function SupportChatWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState("other");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const bottomRef = useRef(null);

  const hidden = isHiddenPath(location.pathname);

  // A small "Need help?" nudge next to the closed bubble, shown once per
  // browser session (sessionStorage) after a short delay so it doesn't
  // flash in before the page has settled.
  useEffect(() => {
    if (open || hidden) return;
    if (sessionStorage.getItem("vencome_support_greeting_seen")) return;
    const timer = setTimeout(() => setShowGreeting(true), 1500);
    return () => clearTimeout(timer);
  }, [open, hidden]);

  const dismissGreeting = () => {
    setShowGreeting(false);
    sessionStorage.setItem("vencome_support_greeting_seen", "1");
  };

  // Check for a still-open ticket once logged in, regardless of panel state,
  // so we can join its socket room and surface the unread badge even closed.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/support/tickets?limit=1");
        const data = await res.json();
        if (cancelled) return;
        const latest = data.tickets?.[0];
        if (latest && !["resolved", "closed"].includes(latest.status)) {
          setTicket(latest);
          setMessages(latest.messages || []);
        }
      } catch (err) {
        console.error("Failed to check for an active support ticket:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !ticket?._id) return;
    const token = localStorage.getItem("vencome_token");
    if (!token) return;
    const socket = initSocket(token);
    socket.emit("joinTicket", ticket._id);

    const handleMessage = (payload) => {
      if (String(payload.ticketId) !== String(ticket._id)) return;
      setMessages((prev) =>
        prev.some((m) => m._id === payload.message._id) ? prev : [...prev, payload.message]
      );
      if (payload.message.senderRole === "admin") setUnread(true);
    };

    socket.on("ticket_message", handleMessage);
    return () => socket.off("ticket_message", handleMessage);
  }, [user, ticket?._id]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  if (hidden) return null;

  const startConversation = async (categoryValue, message) => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const subject = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
      const res = await apiFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ category: categoryValue, subject, message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start conversation");
      setTicket(data);
      setMessages(data.messages || []);
      setText("");
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    startConversation(category, text);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending || !ticket) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("body", text.trim());
      const res = await apiFetch(`/support/tickets/${ticket._id}/messages`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showGreeting && !open && (
        <button
          type="button"
          onClick={() => {
            dismissGreeting();
            setOpen(true);
          }}
          style={{
            position: "fixed",
            bottom: 36,
            right: 88,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "10px 14px 10px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>Need help? 👋</span>
          <span
            role="button"
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              dismissGreeting();
            }}
            style={{ display: "flex", color: "#9CA3AF", padding: 2 }}
          >
            <X size={13} />
          </span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          dismissGreeting();
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close support chat" : "Open support chat"}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#0A1628",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(10,22,40,0.35)",
          zIndex: 1000,
        }}
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
        {!open && unread && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#DC2626",
              border: "2px solid #fff",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 24,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            height: 480,
            maxHeight: "calc(100vh - 140px)",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#0A1628",
              color: "#fff",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{ticket ? "Support" : "Hi there 👋"}</p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
                {ticket ? ticket.ticketNumber : "How can we help?"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                title="Chat on WhatsApp"
                aria-label="Chat on WhatsApp"
                style={{ display: "flex", color: "#25D366", opacity: 0.95 }}
              >
                <WhatsAppIcon size={18} />
              </a>
              {user && (
                <button
                  type="button"
                  onClick={() => navigate("/support/tickets")}
                  title="View all tickets"
                  aria-label="View all tickets"
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.8 }}
                >
                  <ExternalLink size={16} />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {!user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#F3F4F6", borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: "#111827", margin: 0, lineHeight: 1.5 }}>
                    Chat with our team on WhatsApp, or log in to start a support ticket.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like help finding and booking a space.")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, color: "#111827", textDecoration: "none" }}
                >
                  <WhatsAppIcon size={16} color="#25D366" />
                  Help me find a space
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like help listing my space.")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, color: "#111827", textDecoration: "none" }}
                >
                  <WhatsAppIcon size={16} color="#25D366" />
                  Help me list my space
                </a>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  style={{ background: "none", border: "none", color: "#2E58EC", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 0 0", textAlign: "left" }}
                >
                  Log in for ticket support
                </button>
              </div>
            ) : !ticket ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#F3F4F6", borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: "#111827", margin: 0, lineHeight: 1.5 }}>
                    Need a hand? Pick what you're after, or just type your question below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startConversation("booking_payments", "I'd like help finding and booking a space.")}
                  disabled={sending}
                  style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, color: "#2E58EC", cursor: sending ? "not-allowed" : "pointer" }}
                >
                  Help me find a space
                </button>
                <button
                  type="button"
                  onClick={() => startConversation("hosting_listings", "I'd like help listing my space.")}
                  disabled={sending}
                  style={{ textAlign: "left", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, fontWeight: 600, color: "#2E58EC", cursor: sending ? "not-allowed" : "pointer" }}
                >
                  Help me list my space
                </button>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg._id || i}
                  style={{ display: "flex", justifyContent: msg.senderRole === "customer" ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      background: msg.senderRole === "customer" ? "#0A1628" : "#F3F4F6",
                      color: msg.senderRole === "customer" ? "#fff" : "#111827",
                      borderRadius: 14,
                      padding: "8px 12px",
                      fontSize: 13,
                      lineHeight: 1.4,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.body}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {user && (
          <form
            onSubmit={ticket ? handleReply : handleStart}
            style={{ borderTop: "1px solid #E5E7EB", padding: 12, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}
          >
            {!ticket && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ height: 36, borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12, padding: "0 8px" }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, height: 36, borderRadius: 18, border: "1px solid #E5E7EB", padding: "0 12px", fontSize: 13, outline: "none" }}
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                aria-label="Send message"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: text.trim() ? "#2E58EC" : "#E5E7EB",
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={15} color={text.trim() ? "#fff" : "#9CA3AF"} />
              </button>
            </div>
          </form>
          )}
        </div>
      )}
    </>
  );
}
