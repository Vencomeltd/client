import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import apiFetch from "../utils/apiClient";
import { initSocket } from "../utils/socket";
import VencomeLoader from "../components/Loader";
import DashboardLayout from "../layouts/DashboardLayout";

const CATEGORY_LABELS = {
  booking_payments: "Booking & Payments",
  hosting_listings: "Hosting & Listings",
  account_security: "Account & Security",
  trust_safety: "Trust & Safety",
  technical: "Technical Issue",
  other: "Other",
};

const STATUS_CONFIG = {
  open: { label: "Open", color: "#305CDE", bg: "rgba(48,92,222,0.1)" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  waiting_on_user: { label: "Waiting on You", color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  resolved: { label: "Resolved", color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  closed: { label: "Closed", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      color: config.color,
      background: config.bg,
    }}>
      {config.label}
    </span>
  );
}

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function SupportTicketThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await apiFetch(`/support/tickets/${id}`);
        if (res.status === 403) {
          setLoadError("not_authorized");
          return;
        }
        if (res.status === 404) {
          setLoadError("not_found");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setLoadError("not_found");
          return;
        }
        setTicket(data);
        setMessages(data.messages || []);
        setStatus(data.status);
      } catch (err) {
        console.error("Failed to load ticket:", err);
        setLoadError("not_found");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Live receive — join this ticket's room and append incoming messages
  // without a reload. The server broadcasts to the whole `ticket_${id}`
  // room including the sender's own socket (same as the buyer-host chat in
  // ConversationPage.jsx), so a sent reply is appended here via the socket
  // event rather than optimistically from the POST response below — that
  // avoids the message appearing twice.
  useEffect(() => {
    const token = localStorage.getItem("vencome_token");
    if (!token) return;

    const socket = initSocket(token);
    socket.emit("joinTicket", id);

    const handleMessage = (payload) => {
      if (String(payload.ticketId) !== String(id)) return;
      setMessages((prev) =>
        prev.some((m) => m._id === payload.message._id) ? prev : [...prev, payload.message]
      );
      if (payload.status) setStatus(payload.status);
    };
    const handleStatusChanged = (payload) => {
      setStatus(payload.status);
    };

    socket.on("ticket_message", handleMessage);
    socket.on("ticket_status_changed", handleStatusChanged);

    return () => {
      socket.off("ticket_message", handleMessage);
      socket.off("ticket_status_changed", handleStatusChanged);
    };
  }, [id]);

  const handleTyping = () => {
    const socket = initSocket(localStorage.getItem("vencome_token"));
    socket.emit("ticket_typing", { ticketId: id });
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("body", text.trim());
      if (attachment) formData.append("attachment", attachment);

      const res = await apiFetch(`/support/tickets/${id}/messages`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setText("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <VencomeLoader />;

  if (loadError) {
    return (
      <DashboardLayout title="Support">
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
          {loadError === "not_authorized"
            ? "You don't have permission to view this ticket."
            : "Ticket not found."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Support">
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        background: "#F8F6F0",
        margin: "-32px",
      }}>
        {/* Header */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <button
            aria-label="Back to tickets"
            onClick={() => navigate("/support/tickets")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#0A1628",
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", margin: 0 }}>
                {ticket.ticketNumber}
              </p>
              <StatusPill status={status} />
              {(ticket.priority === "high" || ticket.priority === "urgent") && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#DC2626",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}>
                  {ticket.priority} priority
                </span>
              )}
            </div>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: "2px 0 0" }}>
              {ticket.subject}
            </p>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: "14px",
              marginTop: "40px",
            }}>
              No messages yet.
            </div>
          )}

          {messages.map((msg, index) => {
            const isCustomer = msg.senderRole === "customer";

            return (
              <div
                key={msg._id || index}
                style={{
                  display: "flex",
                  justifyContent: isCustomer ? "flex-end" : "flex-start",
                }}
              >
                <div style={{
                  maxWidth: "70%",
                  background: isCustomer ? "#0A1628" : "#fff",
                  color: isCustomer ? "#fff" : "#111827",
                  borderRadius: isCustomer ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  border: isCustomer ? "none" : "1px solid #E5E7EB",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {!isCustomer && (
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#305CDE", marginBottom: "4px" }}>
                      Support
                    </div>
                  )}
                  {msg.body}
                  {msg.attachments?.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {msg.attachments.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Attachment"
                          style={{
                            maxWidth: "100%",
                            borderRadius: "10px",
                            marginTop: i > 0 ? "8px" : 0,
                            display: "block",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <div style={{
                    fontSize: "11px",
                    color: isCustomer ? "rgba(255,255,255,0.6)" : "#9CA3AF",
                    marginTop: "4px",
                    textAlign: "right",
                  }}>
                    {relativeTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          background: "#fff",
          borderTop: "1px solid #E5E7EB",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          {attachment && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#6B7280",
            }}>
              <Paperclip size={14} />
              {attachment.name}
              <button
                type="button"
                onClick={() => {
                  setAttachment(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "12px" }}
              >
                Remove
              </button>
            </div>
          )}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <button
              type="button"
              aria-label="Attach image"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Paperclip size={18} color="#6B7280" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "24px",
                border: "1.5px solid #E5E7EB",
                fontSize: "14px",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                lineHeight: "1.5",
                maxHeight: "120px",
                overflowY: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              aria-label="Send message"
              onClick={handleSend}
              disabled={!text.trim() || sending}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: text.trim() ? "#2E58EC" : "#E5E7EB",
                border: "none",
                cursor: text.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}
            >
              <Send size={18} color={text.trim() ? "#fff" : "#9CA3AF"} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
