import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("vencome_user") || "{}");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/messages/conversations",
          method: "GET",
        });
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return <VencomeLoader />;

  return (
    <>
      <Navbar />
      <div style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "100px 24px 40px",
      }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#0A1628",
          marginBottom: "24px",
        }}>
          Messages
        </h1>

        {conversations.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#6B7280",
          }}>
            <MessageSquare size={48} color="#D1D5DB" style={{ marginBottom: "16px" }} />
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              No conversations yet
            </p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              When you message a host or receive an enquiry, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {conversations.map((conv) => {
              const isHost = conv.host?._id === currentUser._id ||
                conv.host?._id === currentUser.id;
              const otherUser = isHost ? conv.guest : conv.host;
              const otherName = otherUser?.displayName ||
                [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(" ") ||
                "User";
              const otherInitials = otherName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    background: "#fff",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid #E5E7EB",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: otherUser?.profileImage ? "transparent" : "#0A1628",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "700",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}>
                    {otherUser?.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : otherInitials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}>
                      <p style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#0A1628",
                        margin: 0,
                      }}>
                        {otherName}
                      </p>
                      {conv.lastMessageAt && (
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                          {new Date(conv.lastMessageAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    {conv.property?.title && (
                      <p style={{
                        fontSize: "12px",
                        color: "#2E58EC",
                        margin: "0 0 2px",
                        fontWeight: "500",
                      }}>
                        {conv.property.title}
                      </p>
                    )}
                    <p style={{
                      fontSize: "13px",
                      color: "#6B7280",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
