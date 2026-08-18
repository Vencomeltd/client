import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LifeBuoy, X, Send, ExternalLink } from "lucide-react";
import apiFetch from "../utils/apiClient";
import { initSocket } from "../utils/socket";
import { useAuth } from "../context/AuthContext";

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
  const bottomRef = useRef(null);

  const hidden = isHiddenPath(location.pathname);

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

  if (!user || hidden) return null;

  const handleStart = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const trimmed = text.trim();
      const subject = trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
      const res = await apiFetch("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ category, subject, message: trimmed }),
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
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
        {open ? <X size={22} color="#fff" /> : <LifeBuoy size={24} color="#fff" />}
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
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Support</p>
              {ticket && (
                <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{ticket.ticketNumber}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/support/tickets")}
              title="View all tickets"
              aria-label="View all tickets"
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", opacity: 0.8 }}
            >
              <ExternalLink size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {!ticket ? (
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                Send us a message and our team will get back to you here.
              </p>
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
        </div>
      )}
    </>
  );
}
