import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Persistent "Viewing as [user] — Return to Admin" banner, shown whenever
// the current tab is mid-impersonation (see Impersonate.jsx, which stashes
// the admin's own session under vencome_admin_return before switching).
// Mounted once, globally, in App.jsx.
export default function SupportAccessBanner() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("vencome_admin_return");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!session) return;
    const msLeft = new Date(session.expiresAt).getTime() - Date.now();
    if (msLeft <= 0) {
      returnToAdmin();
      return;
    }
    const timer = setTimeout(returnToAdmin, msLeft);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) return null;

  async function returnToAdmin() {
    try {
      await fetch(`${API_URL}/admin/users/${session.userId}/support-access/end-session`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
    } catch (err) {
      console.error("Failed to end support access session:", err.message);
    } finally {
      localStorage.setItem("vencome_token", session.token);
      localStorage.setItem("vencome_user", session.user);
      localStorage.removeItem("vencome_admin_return");
      window.location.href = "/admin";
    }
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "#0A1628",
        color: "white",
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <ShieldAlert size={15} color="#F59E0B" />
      <span>
        Viewing as {session.userName || "this user"} — support access session
      </span>
      <button
        type="button"
        onClick={returnToAdmin}
        style={{
          background: "#2E58EC",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "5px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Return to Admin
      </button>
    </div>
  );
}
