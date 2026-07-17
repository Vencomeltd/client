import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// Landing page for admin "Log in as user" (see AdminDashboard.jsx's
// handleImpersonateUser). Same-tab: the admin's own token/user is saved
// under vencome_admin_return first, so SupportAccessBanner can restore it
// when the admin clicks "Return to Admin" or the session expires.
export default function Impersonate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName") || "";
    const expiresAt = searchParams.get("expiresAt");

    if (!token || !userId || !expiresAt) {
      setError("Missing impersonation details.");
      return;
    }

    (async () => {
      try {
        const adminToken = localStorage.getItem("vencome_token");
        const adminUser = localStorage.getItem("vencome_user");
        if (adminToken && adminUser) {
          localStorage.setItem(
            "vencome_admin_return",
            JSON.stringify({ token: adminToken, user: adminUser, userId, userName, expiresAt })
          );
        }

        localStorage.setItem("vencome_token", token);
        localStorage.setItem("vencome_login_time", Date.now().toString());
        localStorage.removeItem("vencome_refresh"); // session ends when the 1h token expires, no silent refresh

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Couldn't load this user");
        const user = await res.json();

        localStorage.setItem("vencome_user", JSON.stringify(user));
        window.location.href = user.isHost ? "/dashboard" : "/customer/dashboard";
      } catch (err) {
        setError("This support access link has expired or is no longer valid.");
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-6">
      <div className="max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <p className="text-[15px] font-semibold text-[#DC2626]">{error}</p>
            <p className="mt-2 text-[13px] text-[#6B7280]">
              Request access to this account again from the admin Users panel.
            </p>
          </>
        ) : (
          <p className="text-[15px] font-medium text-[#0A1628]">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
