import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// Landing page for admin "Log in as user" links (see AdminDashboard.jsx ->
// UserMenu -> "Log in as user"). Reads the short-lived impersonation token
// from the URL, stores it, fetches the user it belongs to, and drops the
// admin into that user's dashboard. Opened in a new tab on purpose — see the
// note in AdminDashboard.jsx's handleImpersonateUser for why.
export default function Impersonate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing impersonation token.");
      return;
    }

    (async () => {
      try {
        localStorage.setItem("vencome_token", token);
        localStorage.setItem("vencome_login_time", Date.now().toString());
        localStorage.removeItem("vencome_refresh"); // session ends when the 1h token expires, no silent refresh

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Couldn't load this user");
        const user = await res.json();

        localStorage.setItem("vencome_user", JSON.stringify(user));
        navigate(user.isHost ? "/dashboard" : "/customer/dashboard", { replace: true });
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
              Ask the user to grant support access again from their Settings page.
            </p>
          </>
        ) : (
          <p className="text-[15px] font-medium text-[#0A1628]">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
