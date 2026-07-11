import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { apiFetch } from "../utils/api";
import { initSocket } from "../utils/socket";
import VencomeLoader from "../components/Loader";
import DashboardLayout from "../layouts/DashboardLayout";

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("vencome_user") || "{}");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch({
          endpoint: `/messages/${id}`,
          method: "GET",
        });
        setConversation(data.conversation);
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Live receive — join this conversation's room and append incoming
  // messages without a reload. Dedupe against our own optimistic sends,
  // since the server also broadcasts back to the sender's own socket.
  useEffect(() => {
    const token = localStorage.getItem("vencome_token");
    if (!token) return;

    const socket = initSocket(token);
    socket.emit("joinConversation", id);

    const handleIncoming = (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    };
    socket.on("message", handleIncoming);

    return () => {
      socket.off("message", handleIncoming);
    };
  }, [id]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await apiFetch({
        endpoint: "/messages",
        method: "POST",
        body: { conversationId: id, text: text.trim() },
      });
      setMessages((prev) => [...prev, msg]);
      setText("");
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
  if (!conversation) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
      Conversation not found.
    </div>
  );

  const otherUser = conversation.host?._id === currentUser._id ||
    conversation.host?._id === currentUser.id
    ? conversation.guest
    : conversation.host;

  const otherName = otherUser?.displayName ||
    [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(" ") ||
    otherUser?.name ||
    otherUser?.email?.split("@")[0] ||
    "Guest";

  const otherInitials = otherName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout title="Messages">
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
          onClick={() => {
            const currentPath = window.location.pathname;
            const base = currentPath.startsWith("/customer")
              ? "/customer/messages"
              : "/dashboard/messages";
            navigate(base);
          }}
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

        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#0A1628",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "700",
          flexShrink: 0,
        }}>
          {otherInitials}
        </div>

        <div>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
            {otherName}
          </p>
          {conversation.property?.title && (
            <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
              Re: {conversation.property.title}
            </p>
          )}
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
            No messages yet. Start the conversation.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender?._id === currentUser._id ||
            msg.sender?._id === currentUser.id ||
            msg.sender === currentUser._id ||
            msg.sender === currentUser.id;

          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "70%",
                background: isMe ? "#0A1628" : "#fff",
                color: isMe ? "#fff" : "#111827",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "12px 16px",
                fontSize: "14px",
                lineHeight: "1.5",
                border: isMe ? "none" : "1px solid #E5E7EB",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {msg.text}
                <div style={{
                  fontSize: "11px",
                  color: isMe ? "rgba(255,255,255,0.6)" : "#9CA3AF",
                  marginTop: "4px",
                  textAlign: "right",
                }}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
        gap: "12px",
        alignItems: "flex-end",
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
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
    </DashboardLayout>
  );
}
